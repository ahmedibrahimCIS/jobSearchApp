import Joi from 'joi';
import { generalFields } from '../../middlewares/validation.js';

export const initiateChatSchema = Joi.object({
   userId:generalFields.id.required(),
   applicationId:generalFields.id.required()
});

export const getChatHistorySchema = Joi.object({
  
        chatId:generalFields.id.required()

});

export const sendMessageSchema = Joi.object({
    message:Joi.string().required(),
    chatId:generalFields.id.required()
});
