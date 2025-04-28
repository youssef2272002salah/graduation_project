import { Router } from "express";
import { CvController } from "./cv.controller";
import { protect } from "../auth/auth.middleware";
import { validateDto } from "../../utils/validateDto";
import { CreateCVDTO } from "../cvs/cv.dto";
import { upload } from '../../utils/services/FileUploadService';


const cvRouter = Router();
const cvController = new CvController();


cvRouter.post("/uploadCv", protect,upload.single('resume'), cvController.uploadCv);
cvRouter.post("/createCv",protect, cvController.createCv);

cvRouter.post("/careerRecommendation/:id", protect, cvController.getCareerRecommendation);
cvRouter.post("/careerPath/:id", protect, cvController.careerPath);

cvRouter.get("/getAllMyCvs", protect, cvController.getAllMyCvs);
cvRouter.get("/:id", protect, cvController.getCvById);

cvRouter.delete("/:id", protect, cvController.deleteCvById);
cvRouter.put("/:id", protect, cvController.updateCvById);

cvRouter.post("/atsAnalysis/:id", protect, cvController.atsAnalysis);
cvRouter.post("/getJobs", protect, cvController.getJobs);


export { cvRouter };
