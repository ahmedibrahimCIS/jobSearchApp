import {Router} from 'express';
import * as authValidation from './authValidation.js'
import {validation} from '../../middlewares/validation.js'
import { asyncHandler } from '../../utils/error handling/asyncHandler.js';
import * as authService from './authService.js'

const router =Router();

router.post('/signup' , validation(authValidation.registerSchema),asyncHandler(authService.signup))
router.patch('/confirmOTP' , validation(authValidation.confirmEmailSchema),asyncHandler(authService.confirmOTP))
router.post('/login' , validation(authValidation.loginSchema),asyncHandler(authService.login))
router.get('/refresh-token' , asyncHandler(authService.refresh_token))
router.patch('/forgert-password' , validation(authValidation.forgetPasswordSchema),asyncHandler(authService.forget_password))
router.patch('/reset-password' , validation(authValidation.resetPasswordSchema),asyncHandler(authService.reset_password))
router.post('/loginWithGmail' , asyncHandler(authService.loginWithGmail))


export default router