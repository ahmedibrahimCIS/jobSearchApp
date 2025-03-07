import mongoose,{Schema} from "mongoose";
import {Job} from "./jobModel.js";

const companySchema = new Schema(
    {
        companyName: { 
            type: String, 
            required: true, 
            unique: true 
        },
        description: { 
            type: String, 
            required: true 
        },
        industry: { 
            type: String,
            required: true 
        },
        address: { 
        type: String, 
        required: true 
        },
      numberOfEmployees: {
        type: String,
        required: true,
        validator: function(value) {
          // Check if value matches pattern (Regex)
          const rangePattern = /^\d+-\d+$/;
          if (!rangePattern.test(value)) return false;

          // Split the range and convert to numbers
          const [min, max] = value.split('-').map(Number);
          
          //max must be greater than min
          return min < max;
      },
      message: 'Number of employees must be in range format (e.g., "11-20", "21-50") and max must be greater than min'
      },
      companyEmail: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true
         },
      createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
      logo: {
        secure_url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      coverPic: {
        secure_url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      HRs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      bannedAt: { type: Date, default: null },
      deletedAt: { type: Date, default: null },
      legalAttachment: {
        secure_url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      approvedByAdmin: { type: Boolean, default: false },
    },
    { timestamps: true , toJSON: { virtuals: true }, toObject: { virtuals: true }}
  );

  companySchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
      // Delete HR users linked to this company
      await mongoose.model("User").deleteMany({ _id: { $in: this.HRs } });
      await mongoose.model("Job").deleteMany({ companyId: this._id });

   

      next();
    } catch (err) {
      next(err);
    }
  });

  companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId",
  });
  
  
  export const Company = mongoose.model("Company", companySchema);
  