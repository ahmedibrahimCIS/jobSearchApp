import { Chat } from '../../DB/models/chatModel.js';
import { App } from "../../DB/models/appModel.js"
import { Job } from '../../DB/models/jobModel.js';
import { Company } from '../../DB/models/companyModel.js';

export const initiateChat = async (req, res, next) => {
    const { userId, applicationId } = req.body;

    const application = await App.findById(applicationId)
    
    const job = await Job.findById(application.jobId)   
    
    const company = await Company.findById(job.companyId)
    const isAuthorized = 
        company.createdBy.toString() === req.user._id.toString() || 
        company.HRs?.includes(req.user._id);

    if (!isAuthorized) {
        return next(new Error("Only HR or company owner can initiate chat"), { cause: 403 });
    }

    const chat = await Chat.create({
        senderId: req.user._id,
        receiverId: userId,
        messages: [] 
    });

    // Notify participant
    const io = req.app.get('io');
    io.to(`notifications_${userId}`).emit('newMessageNotification', {
        chatId: chat._id,
        senderId: req.user._id,
        message: 'New chat initiated'
    });

    return res.status(201).json({
        success: true,
        chat: await chat.populate([
            {
                path: 'senderId',
                select: 'firstName lastName profilePic'
            },
            {
                path: 'receiverId',
                select: 'firstName lastName profilePic'
            }
        ])
    });
};

export const getChatHistory = async (req, res, next) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
        .populate([
            {
                path: 'senderId',
                select: 'firstName lastName profilePic'
            },
            {
                path: 'receiverId',
                select: 'firstName lastName profilePic'
            },
            {
                path: 'messages.senderId',
                select: 'firstName lastName profilePic'
            }
        ]);

    if (!chat) {
        return next(new Error("Chat not found"), { cause: 404 });
    }

    if (chat.senderId._id.toString() !== req.user._id.toString() && 
        chat.receiverId._id.toString() !== req.user._id.toString()) {
        return next(new Error("Not authorized to view this chat"), { cause: 403 });
    }

    return res.status(200).json({
        success: true,
        chat
    });
};

export const sendMessage = async (req, res, next) => {
    const { chatId } = req.params;
    const { message } = req.body;

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
        return next(new Error("Chat not found"), { cause: 404 });
    }

    if (chat.senderId.toString() !== req.user._id.toString() && 
        chat.receiverId.toString() !== req.user._id.toString()) {
        return next(new Error("Not authorized to send message in this chat"), { cause: 403 });
    }

    // Add new message
    chat.messages.push({
        message,
        senderId: req.user._id
    });

    await chat.save();

    // Notify 
    const io = req.app.get('io');
    const recipientId = chat.senderId.toString() === req.user._id.toString() 
        ? chat.receiverId 
        : chat.senderId;

    io.to(`notifications_${recipientId}`).emit('newMessage', {
        chatId: chat._id,
        message: {
            message,
            senderId: req.user._id,
            timestamp: new Date()
        }
    });

    return res.status(200).json({
        success: true,
        message: "Message sent successfully"
    });
};