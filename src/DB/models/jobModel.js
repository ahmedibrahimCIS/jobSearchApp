import mongoose,{Schema} from "mongoose";
import {App} from "./appModel.js"
const jobSchema = new Schema(
    {
      jobTitle: { type: String, required: true },
      jobLocation: { type: String, enum: ["onsite", "remotely", "hybrid"], required: true },
      workingTime: { type: String, enum: ["part-time", "full-time"], required: true },
      seniorityLevel: {
        type: String,
        enum: ["fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"],
        required: true,
      },
      jobDescription: { type: String, required: true },
      technicalSkills: [{ type: String, required: true }],
      softSkills: [{ type: String, required: true }],
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      closed: { type: Boolean, default: false },
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    },
    { timestamps: true ,toJSON:{virtuals:true},toObject:{virtuals:true}}
  );

  jobSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
      // Delete applications linked to this job
      await mongoose.model("Application").deleteMany({ jobId: this._id });
      next();
    } catch (err) {
      next(err);
    }
  });
  
  jobSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'jobId'
});

  export const Job = mongoose.model("Job", jobSchema);