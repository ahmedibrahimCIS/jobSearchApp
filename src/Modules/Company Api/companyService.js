import {Company} from "../../DB/models/companyModel.js"
import cloudinary from "../../utils/File Upload/cloudinaryConfig.js"
import {roleTypes} from "../../DB/models/userModel.js"
import {Job} from "../../DB/models/jobModel.js"


export const addCompany = async (req, res,next) => {
    const {companyName, companyEmail} = req.body

    const companyExist = await Company.findOne({companyEmail , companyName})
    if(companyExist){
        return next(new Error("Company already exists"))
    }
    
    const company = await Company.create({...req.body , createdBy: req.user._id})
    return res.status(201).json({message: "Company created successfully", company})
}

export const updateCompanyData = async (req, res,next) => {
    const {id} = req.params

    const company = await Company.findById(id);
    if(!company){
        return next(new Error("Company not found"))
    }

    if(company.createdBy.toString() !== req.user._id.toString()){
        return next(new Error("You are not authorized to update this company"))
    }

    //check if req.body has legalAttachment
    if(req.body.hasOwnProperty("legalAttachment")){
        return next(new Error("cannot update legal attachment"))
    }
    

    const updatedCompany = await Company.findByIdAndUpdate(id, {...req.body}, {new: true})
    return res.status(200).json({message: "Company updated successfully", updatedCompany})
}

export const softDeleteCompany = async (req, res,next) => {
    const {id} = req.params

    const company = await Company.findById(id)
    if(!company){
        return next(new Error("Company not found"))
    }

    if(company.createdBy.toString() !== req.user._id.toString() && req.user.role !== roleTypes.ADMIN){
        return next(new Error("You are not authorized to delete this company"))
    }

    await Company.findByIdAndUpdate(id, {$set: {isDeleted: true}})
    return res.status(200).json({message: "Company deleted successfully"})
    
}

export const getSpecificCompany = async (req, res,next) => {
    const {id} = req.params

    const company = await Company.findOne({_id: id, deletedAt: null}).populate({path:"jobs", select:"jobTitle jobLocation workingTime seniorityLevel jobDescription technicalSkills softSkills addedBy updatedBy closed companyId"})

    if(!company){
        return next(new Error("Company not found"))
    }


    return res.status(200).json({success: true, company})
    
    
}

export const searchForCompany = async (req, res,next) => {
    const {companyName} = req.query

    //search for company using regex and case insensitive
    const company = await Company.find({companyName: {$regex: companyName, $options: "i"}})
    if(!company){
        return next(new Error("Company not found"))
    }

    return res.status(200).json({success: true, company})
    
}

export const uploadCompanyLogo = async (req, res,next) => {
    const {id} = req.params

    const company = await Company.findById(id)
    if(!company){
        return next(new Error("Company not found"))
    }

    if(company.createdBy.toString() !== req.user._id.toString()){
        return next(new Error("You are not authorized to upload logo for this company"))
    }
        // Delete existing logo if it exists
        if (company.logo && company.logo.public_id) {
            await cloudinary.uploader.destroy(company.logo.public_id);
        }

    if(req.file){
        const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `Companies/${company.companyName}/company-logo`})
        await Company.findByIdAndUpdate(id, {$set: {logo: {secure_url, public_id}}})
    }

    return res.status(200).json({message: "Company logo uploaded successfully"})
}

export const uploadCompanyCoverPic = async (req, res,next) => {
    const {id} = req.params

    const company = await Company.findById(id)
    if(!company){
        return next(new Error("Company not found"))
    }

    if(company.createdBy.toString() !== req.user._id.toString()){
        return next(new Error("You are not authorized to upload cover pic for this company"))
    }

    if(req.file){
        const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `Companies/${company.companyName}/company-cover-pic`})
        await Company.findByIdAndUpdate(id, {$set: {coverPic: {secure_url, public_id}}})
    }

    return res.status(200).json({message: "Company logo uploaded successfully"})
}

export const deleteCompanyCoverPic = async (req, res,next) => {
    const {id} = req.params

        const company = await Company.findById(id)
    if(!company){
        return next(new Error("Company not found"))
    }

    if(company.createdBy.toString() !== req.user._id.toString()){
        return next(new Error("You are not authorized to delete cover pic for this company"))
    }
    const results = await cloudinary.uploader.destroy(company.coverPic.public_id)  

    if (results.result === "ok") {
      await Company.updateOne(
        { _id: company._id },
        {
          coverPic: {
            secure_url: "",
            public_id: ""
          }
        }
      )
  }

    return res.status(200).json({message: "Company cover pic deleted successfully"})
}

export const deleteCompanyLogo = async (req, res,next) => {
    const {id} = req.params

    const company = await Company.findById(id)
    if(!company){
        return next(new Error("Company not found"))
    }

    if(company.createdBy.toString() !== req.user._id.toString()){
        return next(new Error("You are not authorized to delete logo for this company"))
    }
    const results = await cloudinary.uploader.destroy(company.logo.public_id)  

    if (results.result === "ok") {
      await Company.updateOne(
        { _id: company._id },
        {
          logo: {
            secure_url: "",
            public_id: ""
          }
        }
      )
  }

    return res.status(200).json({message: "Company logo deleted successfully"})
}

