import {Router} from "express"
import { authentication } from "../../middlewares/authMiddleware.js"
import * as companyService from "./companyService.js"
import { validation } from "../../middlewares/validation.js"
import * as companyValidation from './companyValidtion.js'
import {uploadCloud} from '../../utils/File Upload/multerUpload.js'
import { asyncHandler } from "../../utils/error handling/asyncHandler.js"   
import jobRouter from "../Jobs Api/jobController.js"

const router = Router({mergeParams: true})

router.use("/:companyId/jobs", jobRouter)

router.post("/add-company", authentication(),validation(companyValidation.addCompanySchema), asyncHandler(companyService.addCompany))
router.patch("/update-company/:id", authentication(),validation(companyValidation.updateCompanySchema), asyncHandler(companyService.updateCompanyData))
router.patch("/soft-delete/:id", authentication(), asyncHandler(companyService.softDeleteCompany))
router.get("/get-specific-company/:id", authentication(), asyncHandler(companyService.getSpecificCompany))
router.get("/search-for-company", authentication(), asyncHandler(companyService.searchForCompany))
router.patch("/upload-company-logo/:id", authentication(), uploadCloud().single("logo"), asyncHandler(companyService.uploadCompanyLogo))
router.patch("/upload-company-cover-pic/:id", authentication(), uploadCloud().single("coverPic"), asyncHandler(companyService.uploadCompanyCoverPic))
router.patch("/delete-company-cover-pic/:id", authentication(), asyncHandler(companyService.deleteCompanyCoverPic))
router.patch("/delete-company-logo/:id", authentication(), asyncHandler(companyService.deleteCompanyLogo))

export default router
