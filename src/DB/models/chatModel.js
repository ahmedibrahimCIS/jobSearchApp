import mongoose,{Schema} from "mongoose";
const chatSchema = new Schema(
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      messages: [
        {
          message: { type: String, required: true },
          senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        },
      ],
    },
    { timestamps: true }
  );
  
  export const Chat = mongoose.model("Chat", chatSchema);