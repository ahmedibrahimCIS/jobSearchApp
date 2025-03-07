import joi from 'joi';
import { generalFields } from '../../middlewares/validation.js';


export const registerSchema = joi.object({
    firstName:generalFields.firstName.required(),
    lastName:generalFields.lastName.required(),
    email:generalFields.email.required(),
    password:generalFields.password.required(),
    confirmPassword:generalFields.confirmPassword.required(),
    provider:generalFields.provider.required(),
    gender:generalFields.gender.required(),
    DOB:generalFields.DOB.required(),
    mobileNumber:generalFields.phone.required(),
    role:generalFields.role.required()
}).required()

export const loginSchema = joi.object({
   email:generalFields.email.required(),
   password:generalFields.password.required()
}).required()

export const confirmEmailSchema = joi.object({
    email:generalFields.email.required(),
    otp:generalFields.code.required()
}).required()

export const forgetPasswordSchema = joi.object({
    email:generalFields.email.required()
}).required()

export const resetPasswordSchema = joi.object({
    email:generalFields.email.required(),
    otp:generalFields.code.required(),
    password:generalFields.password.required()
}).required()