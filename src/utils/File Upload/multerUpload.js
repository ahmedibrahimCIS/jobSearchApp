import multer ,{diskStorage} from 'multer';




export const fileValidation ={
    images:["image/jpg","image/png","image/jpeg"],
    files:["application/pdf"],
    videos:["video/mp4"],
    audio:["audio/mp3"]
}

export const uploadCloud = ()=>{
    const storage = diskStorage({})

    return multer({storage,limits:{fileSize:1024 * 1024 * 5}});// Limit file size to 5MB /assigment
}