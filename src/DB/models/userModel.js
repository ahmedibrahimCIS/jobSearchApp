import mongoose,{Schema} from "mongoose";
import {hash} from "../../utils/hashing/hash.js";
import CryptoJS from "crypto-js";
import cron from "node-cron";

export const roleTypes= {
    ADMIN:"Admin",
    USER:"User"
}
export const provider={
  GOOGLE:"google",
  SYSTEM:"system"
}

export const defaultImageOnCloud = "https://res.cloudinary.com/dnjqcx9c2/image/upload/v1739060420/default-image_hgslbw.jpg"
export const defaultImagePublicId = "default-image_hgslbw"

const userSchema = new Schema(
  {
    firstName: { 
        type:String,
        required:[true,"firstName is required"],
        minLength:[3,'firstName must be at least 3 characters'],
        trim:true
     },
    lastName: { 
        type:String,
        required:[true,"lastName is required"],
        minLength:[3,'lastName must be at least 3 characters'],
        trim:true
    },
    email:{
        type:String,
        requierd:[true,'Email is required'],
        lowercase:true,
        unique:true,
        trim:true,
        match:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password:{
        type: String,
        required:[true,'Password is required'],
    },
    provider: { 
        type: String, 
        enum:Object.values(provider),
        required: true  
      },
    gender: { 
        type: String, 
        enum: ["Male", "Female"], 
        required: true 
    },
    DOB: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const age = new Date().getFullYear() - value.getFullYear();
          return age >= 18;
        },
        message: "User must be at least 18 years old.",
      },
    },
    mobileNumber: { type: String, required: true },
    role:{
        type:String,
        enum:Object.values(roleTypes),
        default:roleTypes.USER
    },
    isConfirmed: {
        type:Boolean,
        default:false
    },
    deletedAt: { type: Date, default: null },
    bannedAt: { type: Date, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changeCredentialTime: { type: Date, default: null },
    profilePic: {
      secure_url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    coverPic: {
      secure_url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    OTP: [
      {
        code: { type: String, required: true },
        type: { type: String, enum: ["confirmEmail", "forgetPassword"], required: true },
        expiresIn: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true , toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field for username
userSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

//Dcrypt mobileNumber after findOne
userSchema.post('findOne',async function(doc){
  if(doc){
    doc.mobileNumber = CryptoJS.AES.decrypt(doc.mobileNumber, "ENCRYPTION_SECRET").toString(CryptoJS.enc.Utf8);
  }
})

userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {

    await mongoose.model("Company").updateMany(
      { HRs: this._id },
      { $pull: { HRs: this._id } }
    );
    await mongoose.model("Company").deleteMany({ createdBy: this._id });
      
    await mongoose.model("Job").deleteMany({ addedBy: this._id });
    await mongoose.model("App").deleteMany({ userId: this._id });
    await mongoose.model("Chat").deleteMany({ senderId: this._id, receiverId: this._id });
      
      
      next();
  } catch (err) {
      next(err);
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    this.password = hash({plainText : this.password});
  }

  if (this.isModified("mobileNumber")) {
    this.mobileNumber = CryptoJS.AES.encrypt(this.mobileNumber, "ENCRYPTION_SECRET").toString(CryptoJS.enc.Utf8);
  }
  next();
});

//Cron job to remove expired OTPs every 6 hours
cron.schedule("0 */6 * * *", async () => {
  await mongoose.model("User").updateMany(
    {},
    { $pull: { OTP: { expiresIn: { $lt: new Date() } } } }
  );
  console.log("Expired OTPs removed.");
});

export const userModel = mongoose.model("User", userSchema);
