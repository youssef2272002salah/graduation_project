import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SocialMediaDTO {
    @IsString()
    socialMedia!: string;

    @IsString()
    link!: string;

    @IsString()
    displayName!: string;
}

class SummaryDTO {
    @IsString()
    text!: string;

    @IsOptional()
    isShownInPreview?: boolean;
}

class EducationDTO {
    @IsString()
    degree!: string;

    @IsString()
    school!: string;

    @IsString()
    startYear!: string;

    @IsString()
    endYear!: string;

    @IsString()
    notes!: string;

    @IsOptional()
    isShownInPreview?: boolean;
}

class CourseDTO {
    @IsString()
    name!: string;

    @IsString()
    school!: string;

    @IsString()
    startYear!: string;

    @IsString()
    endYear!: string;

    @IsString()
    link!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SummaryDTO)
    notes!: SummaryDTO[];

    @IsOptional()
    isShownInPreview?: boolean;
}

class SkillDTO {
    @IsString()
    title!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SummaryDTO)
    skills!: SummaryDTO[];
}

class LanguageDTO {
    @IsString()
    title!: string;

    @IsString()
    level!: string;

    @IsOptional()
    isShownInPreview?: boolean;
}

class WorkExperienceDTO {
    @IsString()
    company!: string;

    @IsString()
    position!: string;

    @IsString()
    startYear!: string;

    @IsString()
    endYear!: string;

    @IsString()
    workType!: string;

    @IsString()
    location!: string;

    @IsArray()
    @IsString({ each: true })
    technologies!: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SummaryDTO)
    achievements!: SummaryDTO[];
}

class TitlesDTO {
    @IsString()
    profile!: string;

    @IsString()
    experience!: string;

    @IsString()
    education!: string;

    @IsString()
    skills!: string;

    @IsString()
    languages!: string;

    @IsString()
    certification!: string;
}

export class CreateCVDTO {
    
    @IsString()
    title!: string;

    @IsString()
    name!: string;

    @IsString()
    position!: string;

    @IsString()
    contactInformation!: string;

    @IsString()
    email!: string;

    @IsString()
    address!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialMediaDTO)
    socialMedia!: SocialMediaDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SummaryDTO)
    summary!: SummaryDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationDTO)
    educations!: EducationDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CourseDTO)
    courses!: CourseDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkExperienceDTO)
    workExperience!: WorkExperienceDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SkillDTO)
    skills!: SkillDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LanguageDTO)
    languages!: LanguageDTO[];

    @ValidateNested()
    @Type(() => TitlesDTO)
    titles!: TitlesDTO;

    @IsArray()
    @IsString({ each: true })
    order!: string[];
}
