// // src/utils/services/ollamaCvAnalysis.ts (v9 - Final with Build Fix & llmExtractSkills)

// import weaviate, { WeaviateClient } from "weaviate-ts-client";
// import { Ollama } from "ollama";
// import { logger } from "../logging"; // Using your shared logger

// // Type definitions are imported using 'import type', which is erased at compile time and avoids the error.

// // class EmbeddingService {
// //   private static instance: FeatureExtractionPipeline | null = null;
// //   static async getInstance(): Promise<FeatureExtractionPipeline> {
// //     if (this.instance === null) {
// //       logger.info("Loading embedding model for the first time...");

// //       // --- THIS IS THE FIX ---
// //       // We use a dynamic import() here, which is asynchronous.
// //       // This correctly loads the ES Module inside our CommonJS file.

// //       this.instance = (await pipeline(
// //         "feature-extraction",
// //         "Xenova/all-MiniLM-L6-v2"
// //       )) as FeatureExtractionPipeline;

// //       logger.info("Embedding model loaded successfully.");
// //     }
// //     return this.instance;
// //   }
// // }

// export class OllamaCvAnalysisService {
//   private weaviateClient: WeaviateClient;
//   private ollama: Ollama;
//   private model_name: string = "llama3.2:latest";

//   constructor() {
//     this.weaviateClient = weaviate.client({
//       scheme: "http",
//       host: "localhost:8080",
//     });
//     this.ollama = new Ollama({ host: "http://localhost:11434" });
//   }

//   private async llmExtractSkills(cv: any): Promise<string> {
//     logger.debug("-> Asking LLM to extract skills from CV...");
//     const prompt = `Analyze the 'skills' and 'workExperience' sections of the following structured CV JSON. Extract a concise, comma-separated list of the most important technical skills and programming languages. Return ONLY the comma-separated string.

//         Example output: "React, Node.js, Python, SQL, Docker, Git"
        
//         CV JSON:
//         ${JSON.stringify(
//           { skills: cv.skills, workExperience: cv.workExperience },
//           null,
//           2
//         )}`;

//     const response = await this.ollama.chat({
//       model: this.model_name,
//       messages: [{ role: "user", content: prompt }],
//       stream: false,
//     });

//     const skills = response.message.content.trim();
//     logger.debug(`-> LLM Extracted Skills: ${skills}`);
//     return skills;
//   }

//   // =========== CV PARSING ===========
//   async analyze(resumeText: string): Promise<any> {
//     const systemPrompt = `You are a silent, efficient JSON parsing API...`; // Full prompt here
//     const userPrompt = `Parse the following resume text...`; // Full prompt here

//     const response = await this.ollama.chat({
//       model: this.model_name,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//       format: "json",
//     });
//     const finalJson = JSON.parse(response.message.content);
//     logger.info({ message: "✅ LLM Output for analyze", data: finalJson });
//     return finalJson;
//   }

//   // =========== CAREER GUIDANCE ===========
//   async getCareerRecommendation(cv: any): Promise<any> {
//     const userSkills = await this.llmExtractSkills(cv);
//     if (!userSkills) throw new Error("LLM failed to extract skills from CV.");

//     const embedder = await EmbeddingService.getInstance();
//     const queryVector = await embedder(userSkills, {
//       pooling: "mean",
//       normalize: true,
//     });
//     const vectorAsArray = Array.from(queryVector.data as Float32Array);

//     const weaviateResponse = await this.weaviateClient.graphql
//       .get()
//       .withClassName("Job")
//       .withFields("job_title job_description required_skills")
//       .withNearVector({ vector: vectorAsArray })
//       .withLimit(3)
//       .do();

//     const retrievedJobs = weaviateResponse.data.Get.Job;
//     const prompt = `Based on the candidate's skills AND the following relevant job data...`; // Full prompt here

//     const response = await this.ollama.chat({
//       model: this.model_name,
//       messages: [{ role: "user", content: prompt }],
//       format: "json",
//     });
//     const finalJson = JSON.parse(response.message.content);
//     logger.info({
//       message: "✅ LLM Output for getCareerRecommendation",
//       data: finalJson,
//     });
//     return finalJson;
//   }

//   async getCareerPath(cv: any, desiredCareer: string): Promise<any> {
//     const userSkills = await this.llmExtractSkills(cv);
//     if (!userSkills) throw new Error("LLM failed to extract skills from CV.");

//     const embedder = await EmbeddingService.getInstance();
//     const queryVector = await embedder(desiredCareer, {
//       pooling: "mean",
//       normalize: true,
//     });
//     const vectorAsArray = Array.from(queryVector.data as Float32Array);

//     const weaviateResponse = await this.weaviateClient.graphql
//       .get()
//       .withClassName("Job")
//       .withFields("job_title required_skills career_path")
//       .withNearVector({ vector: vectorAsArray })
//       .withLimit(1)
//       .do();
//     const retrievedJob = weaviateResponse.data.Get.Job[0];
//     const prompt = `You are an expert career counselor...`; // Full prompt here

//     const response = await this.ollama.chat({
//       model: this.model_name,
//       messages: [{ role: "user", content: prompt }],
//       format: "json",
//     });
//     const finalJson = JSON.parse(response.message.content);
//     logger.info({
//       message: "✅ LLM Output for getCareerPath",
//       data: finalJson,
//     });
//     return finalJson;
//   }

//   // =========== CV & JOB ANALYSIS ===========
//   async atsAnalysis(cv: any, jobDescription: string): Promise<any> {
//     const prompt = `You are an expert ATS...`; // Full prompt here

//     const response = await this.ollama.chat({
//       model: this.model_name,
//       messages: [{ role: "user", content: prompt }],
//       format: "json",
//     });
//     const finalJson = JSON.parse(response.message.content);
//     logger.info({ message: "✅ LLM Output for atsAnalysis", data: finalJson });
//     return finalJson;
//   }

//   async updateCvByPrompt(cv: any, user_prompt: string): Promise<any> {
//     const prompt = `You are an expert CV editor...`; // Full prompt here

//     const response = await this.ollama.chat({
//       model: this.model_name,
//       messages: [{ role: "user", content: prompt }],
//       format: "json",
//     });
//     const finalJson = JSON.parse(response.message.content);
//     logger.info({
//       message: "✅ LLM Output for updateCvByPrompt",
//       data: finalJson,
//     });
//     return finalJson;
//   }
// }
