import { CVModel, ICV } from './cv.model';
import {CreateCVDTO } from '../cvs/cv.dto';
import {AppError} from '../../utils/appError';
import { Response } from "express";
require('dotenv').config();
const { Mistral } = require('@mistralai/mistralai');

const MODEL = 'mistral-large-2407'; // Change to the model you want

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

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


    
    async updateCvByPrompt(cv: ICV, new_prompt: string) {
      try {
        console.log(cv)
        const cleanText =  `You are an expert in structured CV editing.
  
        You will receive two inputs:
        1. A structured CV in JSON format.
        2. A natural language instruction describing the changes to apply.
        
        Apply the instruction to the CV and return ONLY the updated CV in valid JSON format. DO NOT include any explanation or extra text.
        
        Instruction:
        "${new_prompt}"
        
        Original CV:
        \`\`\`json
        ${JSON.stringify(cv, null, 2)}
        \`\`\`
        
        IMPORTANT: Return the structured CV in the following JSON format, WITHOUT ANY ADDITIONAL TEXT:
      
          {
            "name": "Full Name",
            "position": "Current Job Title",
            "contactInformation": "Phone Number",
            "email": "Email Address",
            "address": "City, Country",
            "socialMedia": [
              {
                "socialMedia": "Platform Name",
                "link": "Profile URL",
                "displayName": "Profile Display Name"
              }
            ],
            "summary": [
              {
                "text": "Professional summary extracted from the resume.",
                "isShownInPreview": true
              }
            ],
            "educations": [
              {
                "degree": "Degree Name",
                "school": "University Name",
                "startYear": "YYYY-MM-DD",
                "endYear": "YYYY-MM-DD",
                "notes": "Relevant courses or achievements",
                "isShownInPreview": true
              }
            ],
            "courses": [
              {
                "name": "Course Name",
                "school": "Institution Name",
                "startYear": "YYYY-MM-DD",
                "endYear": "YYYY-MM-DD",
                "link": "Certificate URL",
                "notes": [
                  {
                    "text": "Key topics covered",
                    "isShownInPreview": true
                  }
                ],
                "isShownInPreview": true
              }
            ],
            "skills": [
              {
                "title": "Category Name",
                "skills": [
                  {
                    "text": "Skill Name",
                    "isShownInPreview": true
                  }
                ],
                "isShownInPreview": true
              }
            ],
            "languages": [
              {
                "title": "Language Name",
                "level": "Proficiency Level",
                "isShownInPreview": true
              }
            ],
            "workExperience": [
              {
                "company": "Company Name",
                "isShownInPreview": true,
                "href": "Company Website URL",
                "position": "Job Title",
                "startYear": "YYYY-MM-DD",
                "endYear": "YYYY-MM-DD",
                "workType": "Remote/On-site/Hybrid",
                "location": "City, Country",
                "technologies": ["Tech 1", "Tech 2"],
                "achievements": [
                  {
                    "text": "Key achievement from this role",
                    "isShownInPreview": true
                  }
                ]
              }
            ],
            "titles": {
              "profile": "PROFILE",
              "experience": "EXPERIENCE",
              "education": "EDUCATION",
              "skills": "SKILLS",
              "languages": "LANGUAGES",
              "certification": "CERTIFICATION"
            },
            "order": [
              "contactInformation",
              "profile",
              "workExperience",
              "education",
              "courses",
              "skills",
              "languages"
            ]
          }`;
        const response = await client.chat.complete({
          model: MODEL,
          messages: [{ role: 'user', content: cleanText }]
        });
    
        const content = response.choices[0]?.message?.content;
        if (!content) {
          console.warn(`⚠️ No content returned from model: ${MODEL}`);
          return null;
        }
    
        console.log(`✅ Success with model: ${MODEL}`);
        
        // Attempt to extract and parse JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/); // Match first JSON block
        if (!jsonMatch) {
          console.error("❌ No valid JSON found in response.");
          return null;
        }
    
        const json = JSON.parse(jsonMatch[0]);
        console.log("Parsed JSON:", json);
        return json;
    
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ Error with model ${MODEL}: ${error.message}`);
        } else {
          console.error(`❌ Error with model ${MODEL}: ${String(error)}`);
        }
        return null;
      }
    }



}