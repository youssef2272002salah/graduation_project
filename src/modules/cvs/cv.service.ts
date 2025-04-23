import { CVModel, ICV } from './cv.model';
import {CreateCVDTO } from '../cvs/cv.dto';
import {AppError} from '../../utils/appError';
import { Response } from "express";

import { v4 as uuidv4 } from 'uuid';
import { PDFService } from '../../utils/services/PDFService';
import { GroqService } from '../../utils/services/grok.service';

const { ATSAnalysisService } = require('../../utils/services/cvAnalysis');
const { JoobleService } = require('../../utils/services/jooble');


const groqService = new GroqService();
const joobleService = new JoobleService();

const pdfService = new PDFService();
const atsAnalysisService = new ATSAnalysisService(groqService);


export class CvService {
  

  async create(cvDto: CreateCVDTO, res: Response) {
    try {
    const newCv = await CVModel.create({
      ...cvDto,
    });    

    if (!newCv) {
      throw new AppError("Cv not created", 404);
    }
    return newCv;
}
    catch (error) {
      console.log(error);
      throw new AppError("Cv not created", 404);
    }
  }

    async getAllMyCvs(email: string) {
        const cvs = await CVModel.find({ email });
        return cvs;
    }


    // get cv by id
    async getCvById(id: string) {
        const cv = await CVModel.findById(id);
        return cv;
    }

    // update cv by id
    async updateCvById(id: string, cvDto: CreateCVDTO) {
        const updatedCv = await CVModel.findByIdAndUpdate(id
            , cvDto
            , { new: true });
        return updatedCv;
    }

    // delete cv by id
    async deleteCvById(id: string) {
        const deletedCv = await CVModel.findByIdAndDelete(id);
        return deletedCv;
    }

    
    async uploadCv (filePath: string) {
        
            const text = await pdfService.extractText(filePath);
            const resumeId = uuidv4();
        
            // Cleanup the uploaded file after processing
            await pdfService.cleanup(filePath);
        
            const analysis = await atsAnalysisService.analyze(text);
            // cast it to json 
            return JSON.stringify(analysis);
    }


    async getCareerRecommendation(cv: ICV) {
        const analysis = await atsAnalysisService.getCareerRecommendation(cv);
        return analysis;
    }

    async getCareerPath(cv: ICV, desiredCareer: string) {
        const analysis = await atsAnalysisService.getCareerPath(cv, desiredCareer);
        return analysis;
    }

    async atsAnalysis(cv: ICV,jobDescription: string) {
        const analysis = await atsAnalysisService.atsAnalysis(cv,jobDescription);
        return analysis;
    }

    async getJobs(track: string, location: string) {
        const analysis = await joobleService.getJobs(track, location);
        return analysis;
    }






}