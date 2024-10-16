import { IsOptional, IsUUID, IsString, IsNumber } from 'class-validator';

export class CreateUserInfoDto {
  //   @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  father_name?: string;

  @IsOptional()
  @IsString()
  samagra_id?: string;

  @IsOptional()
  @IsString()
  current_school_name?: string;

  @IsOptional()
  @IsString()
  current_school_address?: string;

  @IsOptional()
  @IsString()
  current_school_district?: string;

  @IsOptional()
  @IsNumber()
  current_class?: number;

  @IsOptional()
  previous_year_marks?: string;

  @IsOptional()
  @IsString()
  student_type?: string;

  @IsOptional()
  @IsString()
  aadhaar?: string;

  @IsOptional()
  @IsString()
  caste?: string;

  @IsOptional()
  income?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  disability?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
