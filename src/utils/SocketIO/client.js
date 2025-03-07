import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const userId = "67ca126703a33f5964c1b438"; // HR or job applicant
const recipientId = "67c4aadc1e048d25a17da9dc"; // Chat recipient
const chatId = "67c690c1fa2df2358083156f"; // Chat ID

// Listen for new  message notifications
socket.on("newMessageNotification", (data) => {
    console.log("\nNew Chat Message Notification:");
    console.log(`Chat ID: ${data.chatId}`);
    console.log(`Sender ID: ${data.senderId}`);
    console.log(`Message: ${data.message}`);
});

// Listen for new job applications
socket.on("newJobApplication", (data) => {
    console.log("\nNew Job Application:", data);
});

// Listen for new messages
socket.on("newMessage", (data) => {
    console.log("\nNew Message Received:");
    console.log(`Chat ID: ${data.chatId}`);
    console.log(`Sender ID: ${data.message.senderId}`);
    console.log(`Message: ${data.message.message}`);
    console.log(`Timestamp: ${data.message.timestamp}`);
});

// Join notifications room for HR
socket.emit("joinNotifications", userId);
console.log(`Joined notifications room for user ${userId}`);

setTimeout(() => {
    socket.emit("joinHRRoom", userId);
    console.log(`Joined HR Room: user_${userId}`);

    //  new job application
    setTimeout(() => {
        console.log("Emitting new job application...");
        socket.emit("newJobApplication", {
            jobId: "67c4aadc1e048d25a17da9dc",
            applicantId: "67c690c1fa2df2358083156f",
            companyId: "67c4a8d5788d055a401dbd32"
        });
    }, 2000);

    setTimeout(() => {
        console.log(`Leaving HR Room: user_${userId}`);
        socket.emit("leaveHRRoom", userId);
    }, 5000);
}, 2000);

//  sending a chat message
setTimeout(() => {
    console.log("Sending new message...");
    socket.emit("sendMessage", {
        senderId: userId,
        receiverId: recipientId,
        message: "Hello from the client!"
    });
}, 3000);
