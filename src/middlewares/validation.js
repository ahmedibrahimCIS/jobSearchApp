import joi  from "joi";
import { Types } from "mongoose";

export const isValidId = (value,helper) =>{
    return Types.ObjectId.isValid(value)? true : helper.message('Invalid id');
}

export const generalFields = {
        firstName:joi.string().min(3).max(20),
        lastName:joi.string().min(3).max(20),
        Name:joi.string().min(3).max(20),
        description:joi.string().min(3).max(20),
        numberOfEmployees:joi.string().valid("1-10", "11-20", "21-50", "51-100", "101-200", "201-500", "500+"),
        email:joi.string().email(),
        password:joi.string().min(6).max(20),
        confirmPassword:joi.string().equal(joi.ref('password')).min(6).max(20),
        provider:joi.string().valid("google","system"),
        gender:joi.string().valid("Male", "Female"),
        role:joi.string().valid('User','Admin'),
        phone:joi.string().pattern(new RegExp('^[0-9]{10}$')),
        DOB:joi.date().less('now'),
        code:joi.string().pattern(new RegExp('^[0-9]{6}$')),
        id:joi.string().custom(isValidId),
        fileObject:
           { fieldname:joi.string().required(),
            originalname:joi.string().required(),
            encoding:joi.string().required(),
            mimetype:joi.string().required(),
            size:joi.number().required(),
            destination:joi.string().required(),
            filename:joi.string().required(),
            path:joi.string().required()
           }
    
}

export const validation = (schema)=>{
    return (req,res,next)=>{
        const data = {...req.body,...req.params,...req.query};
         // Trim all string query parameters
         for (let key in req.query) {
            if (typeof req.query[key] === "string") {
                req.query[key] = req.query[key].trim(); // Remove spaces & newlines
            } else if (Array.isArray(req.query[key])) {
                req.query[key] = req.query[key].map(item => 
                    typeof item === "string" ? item.trim() : item
                );
            }
        }
        
        if (req.file || req.files?.length) {
            data.file = req.file || req.files;
        }
        const results = schema.validate(data , {abortEarly:false});
        if(results.error){
            const errorMessage = results.error.details.map((obj)=>{ obj.message});
            return next(new Error(errorMessage, {cause:400}));
        }
        return next();
    }
}

