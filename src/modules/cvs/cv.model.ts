import { Schema, model, Document } from 'mongoose';

interface SocialMedia {
    socialMedia?: string;
    link?: string;
    displayName?: string;
}

interface Summary {
    text?: string;
    isShownInPreview?: boolean;
}

interface Education {
    degree?: string;
    school?: string;
    startYear?: string;
    endYear?: string;
    notes?: string;
    isShownInPreview?: boolean;
}

interface Course {
    name?: string;
    school?: string;
    startYear?: string;
    endYear?: string;
    link?: string;
    notes?: Summary[];
    isShownInPreview?: boolean;
}

interface Skill {
    text?: string;
    isShownInPreview?: boolean;
}

interface SkillCategory {
    title?: string;
    skills?: Skill[];
    isShownInPreview?: boolean;
}

interface Language {
    title?: string;
    level?: string;
    isShownInPreview?: boolean;
}

interface WorkExperience {
    company?: string;
    href?: string;
    position?: string;
    startYear?: string;
    endYear?: string;
    workType?: string;
    location?: string;
    technologies?: string[];
    achievements?: Summary[];
    isShownInPreview?: boolean;
}

interface Titles {
    profile?: string;
    experience?: string;
    education?: string;
    skills?: string;
    languages?: string;
    certification?: string;
}

interface ICV extends Document {
    _id: string;
    user_id?: object;
    title?: string;
    name?: string;
    position?: string;
    contactInformation?: string;
    email?: string;
    address?: string;
    socialMedia?: SocialMedia[];
    summary?: Summary[];
    educations?: Education[];
    courses?: Course[];
    skills?: SkillCategory[];
    languages?: Language[];
    workExperience?: WorkExperience[];
    titles?: Titles;
    order?: string[];
}

const cvSchema = new Schema<ICV>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String },
    name: { type: String },
    position: { type: String },
    contactInformation: { type: String },
    email: { type: String },
    address: { type: String },
    socialMedia: [{
        socialMedia: String,
        link: String,
        displayName: String
    }],
    summary: [{
        text: String,
        isShownInPreview: Boolean
    }],
    educations: [{
        degree: String,
        school: String,
        startYear: String,
        endYear: String,
        notes: String,
        isShownInPreview: Boolean
    }],
    courses: [{
        name: String,
        school: String,
        startYear: String,
        endYear: String,
        link: String,
        notes: [{
            text: String,
            isShownInPreview: Boolean
        }],
        isShownInPreview: Boolean
    }],
    skills: [{
        title: String,
        skills: [{
            text: String,
            isShownInPreview: Boolean
        }],
        isShownInPreview: Boolean
    }],
    languages: [{
        title: String,
        level: String,
        isShownInPreview: Boolean
    }],
    workExperience: [{
        company: String,
        href: String,
        position: String,
        startYear: String,
        endYear: String,
        workType: String,
        location: String,
        technologies: [String],
        achievements: [{
            text: String,
            isShownInPreview: Boolean
        }],
        isShownInPreview: Boolean
    }],
    titles: {
        profile: String,
        experience: String,
        education: String,
        skills: String,
        languages: String,
        certification: String
    },
    order: [String]
});

const CVModel = model<ICV>('CV', cvSchema);

export { CVModel, ICV };
