import EventEmitter from 'events';
import { sendEmail,subject } from './sendEmail.js';
import { customAlphabet } from 'nanoid';
import {hash} from '../hashing/hash.js';
import {userModel} from '../../DB/models/userModel.js';
import {temp } from './generateHtml.js';


export const emailEmitter = new EventEmitter();

emailEmitter.on('sendEmail',async(email,firstName,id)=>{
    const data = {
        email: email,
        firstName: firstName,
        id: id
    };
    await sendCode({data, subjectType:subject.VERIFY_EMAIL});
});

emailEmitter.on('forgetPassword',async(email,firstName,id)=>{
    const data = {
        email: email,
        firstName: firstName,
        id: id
    };
    await sendCode({data, subjectType:subject.RESET_PASSWORD});
});

emailEmitter.on('updateEmail',async(email,firstName,id)=>{
    const data = {
        email: email,
        firstName: firstName,
        id: id
    };
    await sendCode({data, subjectType:subject.UPDATE_EMAIL});
});

emailEmitter.on('applicationAccepted', async (email, data) => {
    await sendEmail({
        to: email,
        subject: "Application Accepted!",
        html: `
            <h1>Congratulations ${data.recipientName}!</h1>
            <p>Your application for the position of ${data.jobTitle} at ${data.companyName} has been accepted.</p>
            <p>The HR team will contact you soon with next steps.</p>
            <p>Best regards,<br>${data.companyName} Team</p>
        `
    });
});

emailEmitter.on('applicationRejected', async (email, data) => {
    await sendEmail({
        to: email,
        subject: "Application Update",
        html: `
            <h1>Dear ${data.recipientName},</h1>
            <p>Thank you for your interest in the ${data.jobTitle} position at ${data.companyName}.</p>
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates.</p>
            <p>We appreciate your time and interest in joining our team.</p>
            <p>Best regards,<br>${data.companyName} Team</p>
        `
    });
});

export const sendCode = async(data ={},subjectType)=>{
    
    const {email,firstName,id} = data;
    const otp = customAlphabet('1234567890', 6)();
    const hashedOTP = hash({plainText : otp});

    await userModel.updateOne(
        {_id: id},
        {
            $push: {
                OTP: {
                    code: hashedOTP,
                    type: subjectType === subject.VERIFY_EMAIL ? "confirmEmail" : "forgetPassword",
                    expiresIn: Date.now() + 300000
                }
            }
        }
    );
    
    await sendEmail({
        to: email, 
        subject: subjectType, 
        html:temp(otp, firstName, subjectType)
    });
}