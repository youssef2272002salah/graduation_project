import axios from 'axios';


export class JoobleService {
    private apiUrl: string;
    private apiKey: string;
    constructor() {
        this.apiKey = process.env.JOOBLE_API_KEY || '';
        this.apiUrl = `${process.env.JOOBLE_API_URL}/${this.apiKey}` || '';
    }

    async getJobs(track: string, location:string){
        try {
            const response = await axios.post(this.apiUrl, {
              keywords: track,
              location: location,
              page: 1,
              radius: 20
            });
        
            const jobs = response.data.jobs;
        
            console.log('Found Jobs:', jobs.length);
            console.log('Sample Job:', jobs[0]);
            const returnedJobs = jobs.map((job: any) => ({
                title: job.title|| 'job title not available',
                company: job.company || 'company name not available',
                location: job.location || 'location not available',
                description: job.snippet || 'description not available',
                salary: job.salary || 'salary not available',
                source: job.source || 'source not available',
                url: job.link || 'url not available',
                datePosted: job.updated || 'date posted not available',
            }));

            return {
                total : jobs.length,
                jobs: returnedJobs,
            }
          } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching jobs: ${error.message}`);
            } else {
                throw new Error('Error fetching jobs: An unknown error occurred.');
            }
        }
    }
}
        
