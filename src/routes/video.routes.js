import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

//providing with all the videos at the home route of video
// if a get req is there
// on a post req upload the video to cloudinary
router.route("/").get(getAllVideos).post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },

    ]),
    publishAVideo);
    
export default router;