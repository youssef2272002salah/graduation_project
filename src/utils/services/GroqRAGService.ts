import weaviate, { WeaviateClient } from "weaviate-ts-client";
import { Groq } from "groq-sdk";
import { Ollama } from "ollama"; // We will use this for embeddings now
import { logger } from "../logging";

// The EmbeddingService using ollama
class EmbeddingService {
  private static ollamaInstance: Ollama | null = null;
  private static model: string = "nomic-embed-text";

  private static getOllamaInstance(): Ollama {
    if (this.ollamaInstance === null) {
      logger.info("Initializing Ollama client for EmbeddingService...");
      this.ollamaInstance = new Ollama({ host: "http://localhost:11434" });
    }
    return this.ollamaInstance;
  }

  /**
   * Creates a vector embedding from a piece of text using the Ollama API.
   */
  static async createEmbedding(text: string): Promise<number[]> {
    const ollama = this.getOllamaInstance();
    logger.debug(`Creating embedding for text: "${text.substring(0, 50)}..."`);
    const response = await ollama.embeddings({
      model: this.model,
      prompt: text,
    });
    return response.embedding;
  }
}

export class GroqRAGService {
  private weaviateClient: WeaviateClient;
  private groq: Groq;

  constructor() {
    this.weaviateClient = weaviate.client({
      scheme: "http",
      host: "localhost:8080",
    });
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Uses Groq to extract a concise list of skills from a CV.
   */
  private async groqExtractSkills(cv: any): Promise<string> {
    logger.debug("-> Asking Groq to extract skills from CV...");
    const prompt = `Analyze the 'skills' and 'workExperience' sections of the following structured CV JSON. Extract a concise, comma-separated list of the most important technical skills and programming languages. Return ONLY the comma-separated string, nothing else.

        CV JSON:
        ${JSON.stringify(
          { skills: cv.skills, workExperience: cv.workExperience },
          null,
          2
        )}`;

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192", // Use a fast model for this simple task
    });

    const skills = completion.choices[0]?.message?.content?.trim() || "";
    logger.debug(`-> Groq Extracted Skills: ${skills}`);
    return skills;
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
    }`; // Using the exact, full prompt from your file

    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt.replace("${resumeText}", resumeText) },
      ],
      model: "gemma2-9b-it", // Using gemma2 as you had it in your new file
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const finalJson = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );
    logger.info({ message: "✅ Groq Output for analyze", data: finalJson });
    return finalJson;
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
      messages: [
        {
          role: "user",
          content: prompt
            .replace("${new_prompt}", new_prompt)
            .replace(
              "${JSON.stringify(cv, null, 2)}",
              JSON.stringify(cv, null, 2)
            ),
        },
      ],
      model: "gemma2-9b-it",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const finalJson = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );
    logger.info({
      message: "✅ Groq Output for updateCvByPrompt",
      data: finalJson,
    });
    return finalJson;
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
      messages: [
        {
          role: "user",
          content: prompt
            .replace("${JSON.stringify(cv)}", JSON.stringify(cv))
            .replace("${jobDescription}", jobDescription),
        },
      ],
      model: "llama3-8b-8192", // Using llama3-8b as you had it in your old file
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const finalJson = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );
    logger.info({ message: "✅ Groq Output for atsAnalysis", data: finalJson });
    return finalJson;
  }

  // =========== RAG-Enabled Methods ===========

  async getCareerRecommendation(cv: any): Promise<any> {
    // Step 1: Call Groq to extract skills
    const userSkills = await this.groqExtractSkills(cv);
    if (!userSkills) throw new Error("Groq failed to extract skills from CV.");

    // Step 2: Use skills to query Weaviate
    const vectorAsArray = await EmbeddingService.createEmbedding(userSkills);

    const weaviateResponse = await this.weaviateClient.graphql
      .get()
      .withClassName("Job")
      .withFields("job_title required_skills")
      .withNearVector({ vector: vectorAsArray })
      .withLimit(3)
      .do();
    const retrievedJobs = weaviateResponse.data.Get.Job;

    // Step 3: Call Groq again with the augmented prompt
    const augmentedPrompt = `Based on the candidate's skills AND the following relevant job data, provide career recommendations.
        Candidate's Skills: ${userSkills}
        Relevant Job Data (for context you don't have to stick to them): ${JSON.stringify(
          retrievedJobs,
          null,
          2
        )}
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
      messages: [{ role: "user", content: augmentedPrompt }],
      model: "llama3-70b-8192", // Using the powerful llama3-70b as you had it
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const finalJson = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );
    logger.info({
      message: "✅ Groq RAG Output for getCareerRecommendation",
      data: finalJson,
    });
    return finalJson;
  }

  async getCareerPath(cv: any, desiredCareer: string): Promise<any> {
    // Step 1: Call Groq to extract user's current skills
    const userSkills = await this.groqExtractSkills(cv);
    if (!userSkills) throw new Error("Groq failed to extract skills from CV.");

    // Step 2: Use the 'desiredCareer' to query Weaviate for context
    const vectorAsArray = await EmbeddingService.createEmbedding(userSkills);

    const weaviateResponse = await this.weaviateClient.graphql
      .get()
      .withClassName("Job")
      .withFields("job_title required_skills career_path")
      .withNearVector({ vector: vectorAsArray })
      .withLimit(1)
      .do();
    const retrievedJob = weaviateResponse.data.Get.Job[0];

    // Step 3: Call Groq again with the augmented prompt
    const augmentedPrompt = `Create a detailed, technical roadmap for a person to achieve their desired career.
        Candidate's Current Skills: ${userSkills}
        Desired Career: ${desiredCareer}
        Use this real job data as context for the required skills and career path, but you don't have to stick to them: ${JSON.stringify(
          retrievedJob,
          null,
          2
        )}
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
      messages: [{ role: "user", content: augmentedPrompt }],
      model: "llama3-70b-8192", // Using the powerful llama3-70b as you had it
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const finalJson = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );
    logger.info({
      message: "✅ Groq RAG Output for getCareerPath",
      data: finalJson,
    });
    return finalJson;
  }
}
