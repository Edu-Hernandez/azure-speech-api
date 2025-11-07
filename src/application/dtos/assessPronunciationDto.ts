import { IsString, IsOptional } from 'class-validator';

export interface AssessPronunciationDtoProps {
    sentence: string;
    language?: string | undefined;
}

export class AssessPronunciationDto implements AssessPronunciationDtoProps {
    @IsString()
    sentence!: string;

    @IsOptional()
    @IsString()
    language?: string;
}