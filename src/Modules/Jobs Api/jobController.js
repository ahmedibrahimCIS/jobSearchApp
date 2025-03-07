import {Router} from "express"
import * as jobService from "./jobService.js"
import {validation} from "../../middlewares/validation.js"
import * as jobValidation from "./jobValidation.js"
import {authentication} from "../../middlewares/authMiddleware.js"
import {asyncHandler} from "../../utils/error handling/asyncHandler.js"


const router = Router({mergeParams: true})

router.get( '/all-jobs', asyncHandler(jobService.getAllJobs));
router.post("/add-job/:companyId", authentication(),validation(jobValidation.addJobSchema), asyncHandler(jobService.addJob))
router.patch("/update-job/:jobId", authentication(),validation(jobValidation.updateJobSchema), asyncHandler(jobService.updateJob))
router.delete("/delete-job/:jobId", authentication(), asyncHandler(jobService.deleteJob))
router.get('/', asyncHandler(jobService.getCompanyJobs))
router.get('/:jobId', asyncHandler(jobService.getSpecificCompanyJob))
router.get('/:jobId/applications', authentication(), asyncHandler(jobService.getJobApplications))
router.post('/:jobId/apply', authentication(), asyncHandler(jobService.applyToJob))
router.patch('/:jobId/applications/:applicationId/status', authentication(), asyncHandler(jobService.updateApplicationStatus))
export default router

