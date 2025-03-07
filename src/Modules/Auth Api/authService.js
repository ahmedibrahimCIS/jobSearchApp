import {userModel} from "../../DB/models/userModel.js";
import dotenv from "dotenv";
import { emailEmitter } from "../../utils/Email/emailEmit.js";
import {hash,compare} from '../../utils/hashing/hash.js';
import { roleTypes } from "../../DB/models/userModel.js";
import { generateToken } from "../../utils/token/genToken.js";
import {decodedToken,tokenTypes} from '../../middlewares/authMiddleware.js'
import { OAuth2Client } from 'google-auth-library';
import { provider } from '../../DB/models/userModel.js';

dotenv.config(); 

export const signup = async (req, res, next) => {

    const {email } = req.body;

    const checkUser = await userModel.findOne({email});
    if(checkUser){
        return next(new Error("User already exists"), {cause: 400});
    }

    const user = await userModel.create({
        ...req.body,
    });

    const createdUser = await userModel.findById(user._id)
    
    if (!createdUser.firstName || !createdUser.email || !createdUser._id) {
        return next(new Error("Failed to create user properly"), {cause: 500});
    }


    emailEmitter.emit('sendEmail', 
        createdUser.email, 
        createdUser.firstName, 
        createdUser._id.toString()
    );

    return res.status(201).json({message: "User registered successfully", user: createdUser});
} 

export const confirmOTP = async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return next(new Error("User not found"), { cause: 400 });

    const otpRecord = user.OTP.find(otp => otp.type === "confirmEmail" && otp.expiresIn > new Date());
    if (!otpRecord || !(compare({plainText : otp, hashText : otpRecord.code}))) {
        return next(new Error("Invalid or expired OTP"), { cause: 400 });
    }
    
    user.isConfirmed = true;
    user.OTP = user.OTP.filter(otp => otp.type !== "confirmEmail");
    await user.save();

    res.status(200).json({ message: "Email confirmed successfully" });
};

export const login = async(req,res,next)=>{

    const {email , password} = req.body

    const user = await userModel.findOne({email})
    if(!user) return next(new Error("User not found"),{cause:400})

    const isValid = compare({plainText : password , hashText : user.password})
    if(!isValid) return next(new Error("Invalid email or password"),{cause:400})

    const access_token = generateToken({payload:{id:user._id},
        signature: user.role == roleTypes.USER 
        ? process.env.USER_ACCESS_TOKEN 
        : process.env.ADMIN_ACCESS_TOKEN,options:{expiresIn:process.env.ACCESS_TOKEN_EXPIRATION}})

        const refresh_token = generateToken({payload:{id:user._id},
            signature: user.role == roleTypes.USER 
            ? process.env.USER_REFRESH_TOKEN 
            : process.env.ADMIN_REFRESH_TOKEN,options:{expiresIn:process.env.REFRESH_TOKEN_EXPIRATION}})
    

    return res.status(200).json({message:"User logged in successfully" , tokens:{access_token,refresh_token}});
 }

export const refresh_token = async(req,res,next)=>{

    const {authorization} = req.headers;

    const user = await decodedToken({authorization,tokenType:tokenTypes.REFRESH,next});

    const access_token = generateToken({payload:{id:user._id},
        signature: user.role == roleTypes.USER ? 
        process.env.USER_ACCESS_TOKEN 
        : process.env.ADMIN_ACCESS_TOKEN,options:{expiresIn:process.env.ACCESS_TOKEN_EXPIRATION}})

    const refresh_token = generateToken({payload:{id:user._id},
        signature: user.role == roleTypes.USER ?
         process.env.USER_REFRESH_TOKEN 
         : process.env.ADMIN_REFRESH_TOKEN, options:{expiresIn:process.env.REFRESH_TOKEN_EXPIRATION}})
    

    return res.status(200).json({success:true, tokens:{access_token,refresh_token}});

 }

 export const forget_password = async(req,res,next)=>{
    const {email} = req.body;

    const user = await userModel.findOne({email});
    if(!user) return next(new Error("User not found"),{cause:400})




    emailEmitter.emit('forgetPassword',
        user.email,
        user.firstName,
        user._id.toString()
    );

    return res.status(200).json({success:true});
 }

 export const reset_password = async(req,res,next)=>{
    const {email, otp, password} = req.body;
   
    const user = await userModel.findOne({email});
    if(!user) return next(new Error("User not found"),{cause:400});

    
    // Find valid forget password OTP
    const otpRecord = user.OTP.find(otp => {
        const isValid = otp.type === "forgetPassword" && otp.expiresIn > new Date();
        return isValid;
    });

    if (!otpRecord) {
        return next(new Error("Invalid OTP"), { cause: 400 });
    }

    // Compare the provided OTP with stored hash
    const isOtpValid = compare({plainText: otp, hashText: otpRecord.code});
   

    if (!isOtpValid) {
        return next(new Error("Invalid OTP code"), { cause: 400 });
    }

    // Update password and remove used OTP
    user.password = hash({plainText: password});
    user.OTP = user.OTP.filter(otp => otp.type !== "forgetPassword");
    await user.save();

    return res.status(200).json({ 
        success: true,
        message: "Password reset successfully" 
    });
}
export const loginWithGmail = async(req,res,next)=>{
    const { idToken } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,  
    });
    const payload = ticket.getPayload();
    
    if (!payload.email_verified) {
        return next(new Error("Email not verified"), {cause: 400});
    }

    // Find or create user
    let user = await userModel.findOne({ email: payload.email });

    if (user?.provider === "system") {
        return next(new Error("User already exists with email/password login"), {cause: 400});
    }

    if (!user) {
        user = await userModel.create({ 
            firstName: payload.given_name,
            lastName: payload.family_name,
            email: payload.email,
            provider: "google",
            isConfirmed: true 
        });
    }

    // Generate tokens
    const access_token = generateToken({
        payload: {id: user._id},
        signature: user.role === roleTypes.USER 
            ? process.env.USER_ACCESS_TOKEN 
            : process.env.ADMIN_ACCESS_TOKEN,
        options: {expiresIn: process.env.ACCESS_TOKEN_EXPIRATION}
    });

    const refresh_token = generateToken({
        payload: {id: user._id},
        signature: user.role === roleTypes.USER 
            ? process.env.USER_REFRESH_TOKEN 
            : process.env.ADMIN_REFRESH_TOKEN,
        options: {expiresIn: process.env.REFRESH_TOKEN_EXPIRATION}
    });

    return res.status(200).json({
        success: true,
        message: "Logged in successfully with Google",
        tokens: {access_token, refresh_token},
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }
    });
}