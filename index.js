import express from 'express'
import { connectDB } from './src/DB/connection.js';
import authRouter from './src/Modules/Auth Api/authController.js';
import userRouter from './src/Modules/User Api/userController.js';
import companyRouter from './src/Modules/Company Api/companyController.js';
import { globalErrorHandler } from './src/utils/error handling/errorHandler.js';
import { notFoundHandler } from './src/utils/error handling/routeHandler.js';
import {rateLimit} from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import { runSocket } from './src/utils/SocketIO/socketio.js';
import {getIO} from './src/utils/SocketIO/config.js'
import jobRouter from './src/Modules/Jobs Api/jobController.js';
import chatRouter from './src/Modules/Chat Api/chatController.js';
import { createHandler } from 'graphql-http/lib/use/express';
import schema from './src/Modules/Admin dashboard/graphqlService.js';

//Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: "Too many requests, please try again later."
});



const app = express()

await connectDB();

//Rate Limiter helmet cors 
app.use(limiter)
app.use(helmet())
app.use(cors())

app.use(express.json())

//Routers
app.use("/auth", authRouter)
app.use("/user", userRouter)
app.use("/company", companyRouter)
app.use("/job", jobRouter)
app.use("/chat", chatRouter)

//Test Route (vercel)
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.all('*', notFoundHandler)
   

//Error Handler
app.use(globalErrorHandler);

//GraphQL
app.use('/graphql', createHandler({ schema }));


//Port , Socket
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})


runSocket(server)

export {getIO}
export default app;