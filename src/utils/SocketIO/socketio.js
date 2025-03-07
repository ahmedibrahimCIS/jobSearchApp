import { initSocket , getIO} from "./config.js";


export const runSocket = function(server,getIO) {
    const io= initSocket(server);

    io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("joinHRRoom", (userId) => {
        const room = `user_${userId}`;
        socket.join(room);
        console.log(`HR joined room: ${room}`);
    });

    socket.on("newJobApplication", (data) => {
        const room = `user_${data.companyId}`;
        io.to(room).emit("newJobApplication", data);
    });
    

    
    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    });
});
}
