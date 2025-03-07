import {userModel} from '../../DB/models/userModel.js'
import {hash , compare} from '../../utils/hashing/hash.js'
import cloudinary from '../../utils/File Upload/cloudinaryConfig.js'
import { defaultImageOnCloud,defaultImagePublicId } from '../../DB/models/userModel.js'




export const updateProfile = async (req, res, next) => {
  const user = await userModel.findOneAndUpdate({_id:req.user._id},req.body,{
      new:true , runValidators:true
  })

  if(!user) return next(new Error("User not found"),{cause:400})


  return res.status(200).json({success:true , message:"Profile updated successfully" , results:{user}});   
}

export const getUserAccount = async (req, res, next) => {
    const user = await userModel.findOne({_id:req.user._id})
    return res.status(200).json({success:true , results:user});
}

export const shareProfile = async (req, res, next) => {
    const { profileId } = req.params;

    const user = await userModel.findOne(
      { _id: profileId },
      'firstName lastName mobileNumber profilePic coverPic'
  )
    if(!user) return next(new Error("User not found"),{cause:400})
    
      const userResponse = {
        username: user.username,
        mobileNumber: user.mobileNumber, 
        profilePic: user.profilePic,
        coverPic: user.coverPic
    };
    return res.status(200).json({ success: true, results: userResponse }) 
};


 export const updatePassword = async (req, res, next) => {
    const {oldPassword,newPassword} = req.body

     if (!compare({plainText : oldPassword , hashText : req.user.password})) 
          return next(new Error("Invalid password"),{cause:400})
            
   
    const hashedPassword = hash({plainText : newPassword})

    const user = await userModel.updateOne({_id:req.user._id},{password:hashedPassword, changeCredentialTime:Date.now()})

    return res.status(200).json({success:true , message:"Password updated successfully"});
 }


 export const uploadProfilePicture = async(req,res,next)=>{

  const user  = await userModel.findById({_id:req.user._id})

  if(!user) return next(new Error("User not found"),{cause:400})

    // Delete existing cover picture if it exists
    if (user.profilePic && user.profilePic.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
  }

  if(req.file){
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
      folder:`users/${user._id}/Profile Picture`,
  })

  await userModel.updateOne(
    { _id: user._id },
    {
        profilePic: {
            secure_url,
            public_id
        }
    }
);
  }

  return res.status(200).json({success:true,message:"Profile picture uploaded successfully"})
}

export const uploadCoverPicture = async(req,res,next)=>{

  const user  = await userModel.findById({_id:req.user._id})

  if(!user) return next(new Error("User not found"),{cause:400})

    // Delete existing cover picture if it exists
    if (user.coverPic && user.coverPic.public_id) {
      await cloudinary.uploader.destroy(user.coverPic.public_id);
  }

  if(req.file){
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
      folder:`users/${user._id}/Cover Picture`
  })

  await userModel.updateOne(
    { _id: user._id },
    {
        coverPic: {
            secure_url,
            public_id
        }
    }
  )
  }

  return res.status(200).json({success:true,message:"Cover picture uploaded successfully"})
}

export const deleteProfilePicture = async(req,res,next)=>{

  const user  = await userModel.findById({_id:req.user._id})

  if(!user) return next(new Error("User not found"),{cause:400})

  const results = await cloudinary.uploader.destroy(user.profilePic.public_id)

  if (results.result === "ok") {
     await userModel.updateOne(
      { _id: user._id },
      {
        profilePic: {
          secure_url: defaultImageOnCloud,
          public_id: defaultImagePublicId
      }
    }
  )
  }

  return res.status(200).json({success:true,message:"Profile picture deleted successfully"})
}

export const deleteCoverPicture = async(req,res,next)=>{

  const user  = await userModel.findById({_id:req.user._id})

  if(!user) return next(new Error("User not found"),{cause:400})

  const results = await cloudinary.uploader.destroy(user.coverPic.public_id)  

  if (results.result === "ok") {
      await userModel.updateOne(
        { _id: user._id },
        {
          coverPic: {
            secure_url: defaultImageOnCloud,
            public_id: defaultImagePublicId
          }
        }
      )
  }

  return res.status(200).json({success:true,message:"Cover picture deleted successfully"})
}

export const softDeleteUser = async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate({_id: req.user._id}, {isDeleted: true})
  if(!user) return next(new Error("User not found"),{cause:400})  
  return res.status(200).json({success:true , message:"User deleted successfully" , results:{user}})
}
