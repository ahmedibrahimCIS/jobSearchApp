import Joi from "joi"
import {generalFields} from "../../middlewares/validation.js"

export const addCompanySchema = Joi.object({
        companyName: generalFields.Name.required(),
        description: generalFields.description.required(),
        industry: Joi.string().min(2).max(20).required(),
        address: Joi.string().min(3).max(20).required(),
        numberOfEmployees: Joi.string().regex(/^\d+-\d+$/).required(),
        companyEmail: Joi.string().email().required(),
    })

    export const updateCompanySchema = Joi.object({
        id: generalFields.id.required(),
        companyName: generalFields.Name.optional(),
        description: generalFields.description.optional(),
        industry: Joi.string().min(2).max(20).optional(),
        address: Joi.string().min(3).max(20).optional(),
        numberOfEmployees: Joi.string().regex(/^\d+-\d+$/).optional(),
        companyEmail: Joi.string().email().optional(),
    }).unknown(true);