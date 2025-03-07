import {Job} from "../../DB/models/jobModel.js"
import {Company} from "../../DB/models/companyModel.js"
import {App} from "../../DB/models/appModel.js"
import {emailEmitter} from "../../utils/Email/emailEmit.js"
import {roleTypes} from "../../DB/models/userModel.js"


export const addJob = async (req, res, next) => {
    const {
        jobTitle, 
        jobLocation, 
        workingTime, 
        seniorityLevel, 
        jobDescription, 
        technicalSkills, 
        softSkills
    } = req.body;

    const { companyId } = req.params; 

    const company = await Company.findById(companyId);
    console.log('Found company:', company);

    if (!company) {
        return next(new Error("Company not found"), { cause: 404 });
    }

    
    if (company.createdBy.toString() !== req.user._id.toString() && 
        !company.HRs.includes(req.user._id)) {
        return next(new Error("You are not authorized to add job for this company"));
    }

    const job = await Job.create({
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        companyId,
        addedBy: req.user._id
    });

    return res.status(201).json({
        success: true,
        message: "Job created successfully",
        job
    });
};

export const updateJob = async (req, res,next) => {
    const {jobId} = req.params

    const job = await Job.findOne({_id: jobId})
    if(!job){
        return next(new Error("Job not found"))
    }

    if(job.addedBy.toString() !== req.user._id.toString()){
        return next(new Error("You are not authorized to update this job"))
    }

    const updatedJob = await Job.findOneAndUpdate({_id: jobId}, {...req.body,updatedBy: req.user._id}, {new: true})

    return res.status(200).json({message: "Job updated successfully", updatedJob})
}

export const deleteJob = async (req, res,next) => {
    const {jobId} = req.params

    const job = await Job.findOne({_id: jobId})
    
    if(!job){
        return next(new Error("Job not found"))
    }

    if(job.addedBy.toString() !== req.user._id.toString() && !company.HRs.includes(req.user._id)){
        return next(new Error("You are not authorized to delete this job"))
    }

    await Job.findOneAndDelete({_id: jobId})

    return res.status(200).json({message: "Job deleted successfully"})
}

export const getCompanyJobs = async (req, res, next) => { //company/companyId/jobs?page=1
    const { companyId } = req.params;

    //pagination
    let {page} = req.query  
    page = page ? page : 1
    const limit = 10
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalJobs = await Job.countDocuments({companyId: companyId});
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    //get company
    const company = await Company.findOne({
        _id: companyId
    })
    
    if (company) {
        const jobs = await Job.find({companyId: company._id})
        .skip(skip).limit(limit).sort({createdAt: -1}).populate({path:'companyId', select: 'companyName industry'});
        return res.status(200).json({ 
            success: true, 
            message: "Jobs found",
            jobs,
            totalJobs: totalJobs,
            currentPage: page,
            totalPages: totalPages
        });
    }
}

export const getSpecificCompanyJob = async (req, res, next) => { //company/companyId/jobs/:jobId
    const { companyId,jobId } = req.params;

    const job = await Job.findOne({
       _id: jobId,
        companyId: companyId
    }).populate({path:'companyId', select: 'companyName industry'});

    if (!job) {
            return next(new Error("No jobs found with this title"), { cause: 404 });
    }

    return res.status(200).json({
        success: true,
        job
    });
};

export const getAllJobs = async (req, res, next) => {//job/jobs?page=1&limit=10&sort=-createdAt&workingTime=full-time&jobLocation=New York&seniorityLevel=junior&jobTitle=Software Engineer&technicalSkills=JavaScript,React,Node.js
        
    const {
            page = 1,
            limit = 10,
            sort ,
            workingTime,
            jobLocation,
            seniorityLevel,
            jobTitle,
            technicalSkills
        } = req.query;

        console.log(req.query);
        const filters = {};

        // Add filters only if they exist in query params
        if (workingTime) {
            filters.workingTime = workingTime;
        }

        if (jobLocation) {
            filters.jobLocation = { $regex: jobLocation, $options: 'i' };
        }

        if (seniorityLevel) {
            filters.seniorityLevel = seniorityLevel;
        }

        if (jobTitle) {
            filters.jobTitle = { $regex: jobTitle, $options: 'i' };
        }

        if (technicalSkills) {
            const skills = Array.isArray(technicalSkills) 
                ? technicalSkills 
                : technicalSkills.split(',').filter(skill => skill.trim() !== ''); // Remove empty values
        
            if (skills.length > 0) {
                filters.technicalSkills = { 
                    $all: skills.map(skill => new RegExp(skill.trim(), 'i'))
                };
            }
        }
        //pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalJobs = await Job.countDocuments(filters);
        const totalPages = Math.ceil(totalJobs / parseInt(limit));

        // Get jobs with filters, pagination and sorting
        const jobs = await Job.find(filters)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'companyId',
                select: 'companyName industry'
            });

        return res.status(200).json({
            success: true,
            results: {
                jobs,
                totalJobs,
                currentPage: parseInt(page),
                totalPages,
                appliedFilters: {
                    workingTime: workingTime || 'All',
                    jobLocation: jobLocation || 'All',
                    seniorityLevel: seniorityLevel || 'All',
                    jobTitle: jobTitle || 'All',
                    technicalSkills: technicalSkills ? 
                        (Array.isArray(technicalSkills) ? technicalSkills : technicalSkills.split(',')) 
                        : 'All'
                }
            }
        });

   
};

export const getJobApplications = async (req, res, next) => {//job/jobId/applications?page=1&limit=10&sort=-createdAt
    const {jobId} = req.params
    const {page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const job = await Job.findOne({_id: jobId})
        .populate('companyId');
    
    if (!job) {
        return next(new Error("Job not found"), { cause: 404 });
    }

    const isAuthorized = 
        job.companyId.createdBy.toString() === req.user._id.toString() || 
        job.companyId.HRs?.includes(req.user._id);

    if (!isAuthorized) {
        return next(new Error("Not authorized to view applications"), { cause: 403 });
    }

    // Get applications with pagination
    const applications = await Job.findOne({_id: jobId})
        .populate({
            path: 'applications',
            options: {
                sort,
                skip: (page - 1) * limit,
                limit: parseInt(limit)
            },
            populate: {
                path: 'userId',
                select: 'firstName lastName email gender DOB profilePic mobileNumber'
            }
        });

    return res.status(200).json({
        success: true,
        message: "Applications fetched successfully",
        results: {
            applications,
            currentPage: parseInt(page),
        }
    });
};

export const applyToJob = async (req, res, next) => {
    if (req.user.role !== roleTypes.USER) {
        return next(new Error("Only users can apply to jobs"), { cause: 403 });
    }

    const { jobId } = req.params;

    const job = await Job.findById(jobId)
        .populate('companyId', 'createdBy HRs');
    
    if (!job) {
        return next(new Error("Job not found"), { cause: 404 });
    }

    // Check if user already applied
    const existingApplication = await App.findOne({
        jobId,
        userId: req.user._id
    });

    if (existingApplication) {
        return next(new Error("You have already applied to this job"), { cause: 400 });
    }
    const application = await App.create({
        jobId,
        userId: req.user._id,
        userCV: req.file?.path || req.user.userCV, // Use uploaded file or user's existing resume
        status: 'pending'
    });

    const io = req.app.get('io');
    const HRs = job.companyId.HRs;
    
    io.emit('newJobApplication', {
        jobId: job._id,
        applicantId: req.user._id,
        companyId: job.companyId._id,
        HRs
    });
    return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        application
    });
}

export const updateApplicationStatus = async (req, res, next) => {//job/jobId/applications/:applicationId/status
    const { applicationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    const application = await App.findById(applicationId)
        .populate([
            {
                path: 'jobId',
                select: 'jobTitle companyId',
                populate: {
                    path: 'companyId',
                    select: 'companyName createdBy HRs'
                }
            },
            {
                path: 'userId',
                select: 'firstName lastName email'
            }
        ]);

    if (!application) {
        return next(new Error("Application not found"), { cause: 404 });
    }

    const isAuthorized = 
        application.jobId.companyId.createdBy.toString() === req.user._id.toString() || 
        application.jobId.companyId.HRs?.includes(req.user._id);

    if (!isAuthorized) {
        return next(new Error("Not authorized to update application status"), { cause: 403 });
    }

    if (application.status !== 'pending') {
        return next(new Error(`Application is already ${application.status}`), { cause: 400 });
    }

    // Update application status
    application.status = status;
    await application.save();

    //  email data
    const emailData = {
        recipientName: application.userId.firstName,
        jobTitle: application.jobId.jobTitle,
        companyName: application.jobId.companyId.companyName,
        status: status
    };

    // Send email based on status
    if (status === 'accepted') {
        emailEmitter.emit('applicationAccepted', 
            application.userId.email,
            emailData
        );
    } else {
        emailEmitter.emit('applicationRejected', 
            application.userId.email,
            emailData
        );
    }
    return res.status(200).json({
        success: true,
        message: `Application ${status} successfully`,
        application
    });
};