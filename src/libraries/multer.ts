import multer from "multer";
import CustomError from "@/utilities/custom-error";

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        // Maximum file size of 5mb
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: (_req, file, cb) => {
        // accepted file types
        const mimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "application/pdf"];

        // Check if file type is accepted
        if (mimeTypes.includes(file.mimetype) !== true) {
            return cb(new CustomError("Invalid file type. Only jpeg, jpg, png, gif and pdf file types are accepted"));
        }

        cb(null, true);
    },
});

export default upload;
