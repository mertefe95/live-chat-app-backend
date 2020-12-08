import express from "express";
import { Request , Response } from "express";
const router = express.Router();
import { UserProfile } from '../models/UserProfile';

router.get('/userprofile', (req: Request, res: Response) => {
        const userProfile = UserProfile.find({})
        if(!userProfile) {
            return res
                .status(400)
                .send()
        }
        return res
            .status(200)
            .send(userProfile)
})





export { router as userProfileRouter};