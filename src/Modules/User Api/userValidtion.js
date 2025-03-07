import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const updateProfileSchema = joi.object({
    firstName:generalFields.firstName.required(),
    lastName:generalFields.lastName.required(),
    email:generalFields.email.required(),
    mobileNumber:generalFields.phone.required(),
    DOB:generalFields.DOB.required(),
    gender:generalFields.gender.required(),
   
}).required()

export const updatePasswordSchema = joi.object({
    oldPassword:joi.string().min(6).max(20).required(),
    newPassword:joi.string().min(6).max(20).not(joi.ref('oldPassword')).required(),
    confirmPassword:joi.string().min(6).max(20).required()
}).required()

export const shareProfileSchema = joi.object({
    profileId:generalFields.id.required()
}).required()




