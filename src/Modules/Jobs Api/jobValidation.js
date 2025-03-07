import Joi from "joi"
import { generalFields } from "../../middlewares/validation.js";

export const addJobSchema = Joi.object({
    companyId: generalFields.id.required(),
    jobTitle: Joi.string().required(),
    jobLocation: Joi.string().required(),
    workingTime: Joi.string().required(),
    seniorityLevel: Joi.string().required(),
    jobDescription: Joi.string().required(), 
    technicalSkills: Joi.array().items(Joi.string()).required(),
    softSkills: Joi.array().items(Joi.string()).required(),
})

export const updateJobSchema = Joi.object({
    jobId: generalFields.id.required(),
    jobTitle: Joi.string(),
    jobLocation: Joi.string().valid("onsite","remotely","hybrid"),
    workingTime: Joi.string().valid('full-time', 'part-time'),
    seniorityLevel: Joi.string().valid("fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"),
    jobDescription: Joi.string(), 
    technicalSkills: Joi.array().items(Joi.string()),
    softSkills: Joi.array().items(Joi.string()),
})


export const searchJobSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).optional(),
        sort: Joi.string().valid('createdAt', '-createdAt', 'title', '-title').optional(),
        workingTime: Joi.string().valid('full-time', 'part-time').optional(),
        jobLocation: Joi.string().valid("onsite", "remotely", "hybrid").optional(),
        seniorityLevel: Joi.string().valid("fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO").optional(),
        jobTitle: Joi.string().optional(),
        technicalSkills: Joi.alternatives().try(
            Joi.string(),
            Joi.array().items(Joi.string())
        ).optional()
    })
});

