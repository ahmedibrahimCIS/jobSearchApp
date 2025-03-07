import {Router} from 'express';
import * as userValidation from './userValidtion.js'
import {validation} from '../../middlewares/validation.js'
import { asyncHandler } from '../../utils/error handling/asyncHandler.js';
import * as userService from './userService.js'
import {authentication} from '../../middlewares/authMiddleware.js'
import {uploadCloud} from '../../utils/File Upload/multerUpload.js'

const router = Router();

router.get('/profile' ,authentication(),asyncHandler(userService.getUserAccount))
router.get('/profile/:profileId' ,validation(userValidation.shareProfileSchema),authentication(),asyncHandler(userService.shareProfile))
router.patch('/updatePassword',validation(userValidation.updatePasswordSchema),authentication(),asyncHandler(userService.updatePassword))
router.patch('/updateProfile',validation(userValidation.updateProfileSchema),authentication(),asyncHandler(userService.updateProfile))
router.patch('/softDelete',authentication(),asyncHandler(userService.softDeleteUser))
router.post('/uploadProfilePicture' ,authentication(),uploadCloud().single('image'),asyncHandler(userService.uploadProfilePicture))
router.post('/uploadCoverPicture' ,authentication(),uploadCloud().single('image'),asyncHandler(userService.uploadCoverPicture))
router.delete('/deleteProfilePicture' ,authentication(),uploadCloud().single('image'),asyncHandler(userService.deleteProfilePicture))
router.delete('/deleteCoverPicture' ,authentication(),uploadCloud().single('image'),asyncHandler(userService.deleteCoverPicture))





export default router