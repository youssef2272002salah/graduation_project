import { Groq } from "groq-sdk";

export class ATSAnalysisService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async analyze(resumeText: string): Promise<any> {
    const prompt = `You are an expert in resume parsing and structuring.

    Extract relevant details from the following resume text and return the structured CV in strict JSON format:
    
    Resume text:
    ${resumeText}
    
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

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    const cleaned = rawContent.replace(/```(json)?/g, "").trim();

  
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Failed to parse:", cleaned);
      throw new Error("Invalid JSON format from AI.");
    }
  }

  async getCareerRecommendation(cv: any): Promise<any> {
    const prompt = `You are an expert in career counseling.
  
    Analyze the following structured CV and provide career recommendations based on the candidate's skills and experience:
  
    Structured CV:
    ${JSON.stringify(cv)}
    
    IMPORTANT: Return the career recommendations in the following JSON format, WITHOUT ANY ADDITIONAL TEXT:
  
    {
      "careers": [
        {
          "title": "Career Title",
          "matchScore": number (0-100),
          "description": "Reason why this career is a good fit."
        },
        {
          "title": "Career Title",
          "matchScore": number (0-100),
          "description": "Reason why this career is a good fit."
        },
        {
          "title": "Career Title",
          "matchScore": number (0-100),
          "description": "Reason why this career is a good fit."
        },
        {
          "title": "Career Title",
          "matchScore": number (0-100),
          "description": "Reason why this career is a good fit."
        }
      ]
    }`;
  
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3
    });
    console.log(completion.choices[0]?.message?.content);
  
    const rawContent = completion.choices[0]?.message?.content || "";
    const cleaned = rawContent.replace(/```(json)?/g, "").trim();

  
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Failed to parse:", cleaned);
      throw new Error("Invalid JSON format from AI.");
    }
  
  }

  async getCareerPath(cv: any, desiredCareer: string): Promise<any> {
    const prompt = `You are an expert in career counseling.
    
    Analyze the following structured CV and provide a step-by-step career path to transition into the desired career.
  
    Structured CV:
    ${JSON.stringify(cv)}
  
    Desired Career: ${desiredCareer}
    
    IMPORTANT: Return the career path in the following JSON format, WITHOUT ANY ADDITIONAL TEXT:
  
    {
      "modules": [
        {
          "time": "Time period (e.g., Month 1-2)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left or right"
        },
        {
          "time": "Time period (e.g., Month 3-4)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left or right"
        },
        {
          "time": "Time period (e.g., Month 5-6)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left or right"
        },
        {
          "time": "Time period (e.g., Month 7-8)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left or right"
        },
        {
          "time": "Time period (e.g., Month 9-10)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left or right"
        },
        {
          "time": "Time period (e.g., Month 11-12)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left or right"
        }
      ]
    }`;
  
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    const cleaned = rawContent.replace(/```(json)?/g, "").trim();

  
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Failed to parse:", cleaned);
      throw new Error("Invalid JSON format from AI.");
    }
  }
  
  
}
