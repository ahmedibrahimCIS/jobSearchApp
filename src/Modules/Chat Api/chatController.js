import { Router } from 'express';
import * as chatService from './chatService.js';
import { authentication } from '../../middlewares/authMiddleware.js';
import { validation } from '../../middlewares/validation.js';
import * as chatValidation from './chatValidation.js';
import { asyncHandler } from '../../utils/error handling/asyncHandler.js';

const router = Router();

// Start new chat
router.post(
    '/initiate',
    authentication(),
    validation(chatValidation.initiateChatSchema),
    asyncHandler(chatService.initiateChat)
);

// Get chat history
router.get(
    '/:chatId/history',
    authentication(),
    validation(chatValidation.getChatHistorySchema),
    asyncHandler(chatService.getChatHistory)
);

// Send message in chat
router.post(
    '/:chatId/message',
    authentication(),
    validation(chatValidation.sendMessageSchema),
    asyncHandler(chatService.sendMessage)
);

export default router;