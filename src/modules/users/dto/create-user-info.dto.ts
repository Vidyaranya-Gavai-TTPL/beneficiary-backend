import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsNumber } from 'class-validator';

export class CreateUserInfoDto {
  //   @IsUUID()
  // @ApiProperty()
  user_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  father_name?: string;

  @ApiProperty()
  @IsOptional()
  samagra_id?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  current_school_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  current_school_address?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  current_school_district?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  current_class?: number;

  @ApiProperty()
  @IsOptional()
  previous_year_marks?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  student_type?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  aadhaar?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  caste?: string;

  @ApiProperty()
  @IsOptional()
  income?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  disability?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: string;
}
