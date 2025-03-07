import mongoose, { Schema } from "mongoose";
const applicationSchema = new Schema(
    {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      userCV: {
        secure_url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "viewed", "in consideration", "rejected"],
        default: "pending",
      },
    },
    { timestamps: true }
  );

  
  export const App = mongoose.model("Application", applicationSchema);
  