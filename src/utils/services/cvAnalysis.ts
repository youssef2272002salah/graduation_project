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
      model: "gemma2-9b-it",
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

  async updateCvByPrompt(cv: any, new_prompt: string): Promise<any> {
    const prompt = `You are an expert in structured CV editing.
  
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
 
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gemma2-9b-it",
      temperature: 0.3
    });
  
    const rawContent = completion.choices[0]?.message?.content || "";
    const cleaned = rawContent.replace(/```(json)?/g, "").trim();
    console.log("cleaned", cleaned);
  
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
      model: "gemma2-9b-it",
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

  async getCareerPath(cv: any, desiredCareer: string): Promise<any> {
    const prompt = `You are an expert in career counseling and technical skill development.

    Analyze the following structured CV and provide a highly specialized, step-by-step career path to transition into the desired career field.
    
    ⚡ Focus on **technical skills, core knowledge areas, required certifications, practical projects**, and **industry tools** that the candidate must master to succeed.
    
    ⚡ Make sure each module focuses on real topics from the target career path, avoiding general advice like self-assessment or goal-setting.
    
    ⚡ Prioritize hands-on learning, industry practices, and actual job-ready abilities.
    
    Structured CV:
    ${JSON.stringify(cv)}
    
    Desired Career:
    ${desiredCareer}
    
    IMPORTANT: Return the career path in the following JSON format, WITHOUT ANY ADDITIONAL TEXT:
    
    {
      "modules": [
        {
          "time": "Time period (e.g., Month 1-2)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left"
        },
        {
          "time": "Time period (e.g., Month 3-4)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "right"
        },
        {
          "time": "Time period (e.g., Month 5-6)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left"
        },
        {
          "time": "Time period (e.g., Month 7-8)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "right"
        },
        {
          "time": "Time period (e.g., Month 9-10)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "left"
        },
        {
          "time": "Time period (e.g., Month 11-12)",
          "name": "Module Name",
          "description": "Overview of what will be learned in this step",
          "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "side": "right"
        }
      ]
    }
    `;
    
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gemma2-9b-it	",
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

  async atsAnalysis(cv: any, jobDescription: string): Promise<any> {
    const prompt = `You are an expert in resume analysis.
  
  Analyze the following structured CV **against the provided job description**, and provide a detailed ATS (Applicant Tracking System) analysis. Evaluate how well the CV matches the job requirements based on skills, experience, structure, and relevance.
  
  Structured CV:
  ${JSON.stringify(cv)}
  
  Job Description:
  ${jobDescription}
  
  IMPORTANT: Return the ATS analysis in the following strict JSON format, WITHOUT ANY ADDITIONAL TEXT:
  
  {
    "atsScore": {
      "overall": number (0-100),
      "keywords": [array of matched keywords],
      "missingKeywords": [array of missing keywords],
      "formatScore": number (0-100)
    },
    "jobMatch": {
      "score": number (0-100),
      "matchingSkills": [array of matching skills],
      "missingSkills": [array of missing skills],
      "recommendations": [array of suggestions to improve match],
      "relevance": number (0-100)
    },
    "structure": {
      "completeness": number (0-100),
      "sectionsPresent": [array of present sections],
      "sectionsMissing": [array of missing sections],
      "suggestions": [array of structure improvement suggestions],
      "readability": number (0-100)
    },
    "detailedFeedback": {
      "overallScore": number (0-100),
      "summary": "short summary of resume quality",
      "strengths": [array of strengths],
      "weaknesses": [array of weaknesses],
      "actionItems": [array of specific action items],
      "improvementPlan": "short improvement strategy"
    }
  }`;
  
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gemma2-9b-it",
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
