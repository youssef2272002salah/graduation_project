import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { CvService } from "./cv.service";
import { CreateCVDTO } from "./cv.dto";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest.interface";
import { ICV } from "./cv.model";
import { AppError } from "../../utils/appError";


const cvService = new CvService();

export class CvController {
  createCv = expressAsyncHandler(async (req: Request, res: Response) => {

      const user = (req as AuthenticatedRequest).user;
          if (!user) {
              throw new AppError("User not found", 404);
          }
    req.body.email = user.email;
    const cv: ICV = await cvService.create(req.body as CreateCVDTO, res);
    if (!cv || !cv._id) {
      throw new AppError("Cv not created", 404);
    }
    user.cvs.push(cv._id);

    await user.save();


    res.status(201).json({
      status: "success",
      message: "Cv created successfully",
      data: cv,
    });
  });

  // todo: i make filter by email (may cause confilct if user email not like email in cv)
  getAllMyCvs = expressAsyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const cvs = await cvService.getAllMyCvs(user.email);
    res.status(200).json({
      status: "success",
      data: cvs,
    });
  });

  getCvById = expressAsyncHandler(async (req: Request, res: Response) => {
    const cv = await cvService.getCvById(req.params.id);
    if (!cv) {
      throw new AppError("Cv not found", 404);
    }
    res.status(200).json({
      status: "success",
      data: cv,
    });
  });

  updateCvById = expressAsyncHandler(async (req: Request, res: Response) => {
    const cv = await cvService.updateCvById
    (req.params.id, req.body as CreateCVDTO);
    if (!cv) {
      throw new AppError("Cv not found", 404);
    }
    res.status(200).json({
      status: "success",
      message: "Cv updated successfully",
      data: cv,
    });
  });

  deleteCvById = expressAsyncHandler(async (req: Request, res: Response) => {
    const cv = await cvService.deleteCvById(req.params.id);
    if (!cv) {
      throw new AppError("Cv not found", 404);
    }
    res.status(200).json({
      status: "success",
      message: "Cv deleted successfully",
   });
  });
  
  uploadCv = expressAsyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const filePath = req.file.path;

    let cvAsJson = await cvService.uploadCv(filePath);
    let cvObject: ICV = JSON.parse(cvAsJson);
    cvObject.email = user.email;
    cvObject.title = req.file.originalname ? req.file.originalname : "Untitled CV";

    const cv: ICV = await cvService.create(cvObject as CreateCVDTO, res);
    
    if (!cv || !cv._id) {
      throw new AppError("Cv not created", 404);
    }

    user.cvs.push(cv._id);
    await user.save();

    res.status(201).json({
      status: "success",
      message: "Cv created successfully",
      data: cv,
    });
  });

  getCareerRecommendation = expressAsyncHandler(async (req: Request, res: Response) => {
    const cv = await cvService.getCvById(req.params.id);
    if (!cv) {
      throw new AppError("Cv not found", 404);
    }
    const recommendation = await cvService.getCareerRecommendation(cv);
    res.status(200).json({
      status: "success",
      data: recommendation,
    });
  });

  careerPath = expressAsyncHandler(async (req: Request, res: Response) => {
    const cv = await cvService.getCvById(req.params.id);
    if (!cv) {
      throw new AppError("Cv not found", 404);
    }
    const desiredCareer = req.body.desiredCareer;
    const path = await cvService.getCareerPath(cv, desiredCareer);
    res.status(200).json({
      status: "success",
      data: path,
    });
  });


  atsAnalysis = expressAsyncHandler(async (req: Request, res: Response) => {
    const cv = await cvService.getCvById(req.params.id);
    const jobDescription = req.body.jobDescription;
    if (!cv) {
      throw new AppError("Cv not found", 404);
    }
    if (!jobDescription) {
      throw new AppError("Please provide job description", 400);
    }
    const analysis = await cvService.atsAnalysis(cv, jobDescription);
    res.status(200).json({
      status: "success",
      data: analysis,
    });
  });

  getJobs = expressAsyncHandler(async (req: Request, res: Response) => {
    const track = req.body.track;
    const location = req.body.location;
    if (!track || !location) {
      throw new AppError("Please provide track and location", 400);
    }
    const jobs = await cvService.getJobs(track, location);
    res.status(200).json({
      status: "success",
      data: jobs,
    });
  });

  
}