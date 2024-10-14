import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDocDTO {
  @ApiProperty({
    description: 'The UUID of the user',
    example: 'a3d8fa45-bdfa-49d1-8b3f-54bafcf3aabb',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'The type of the document (e.g. ID, Certificate)',
    example: 'Income Certificate',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  doc_type: string;

  @ApiProperty({
    description: 'The subtype of the document (e.g. Government-issued)',
    example: 'Government-issued Income Certificate',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  doc_subtype: string;

  @ApiProperty({
    description: 'The name of the document',
    example: 'Income Certificate for John Doe',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  doc_name: string;

  @ApiProperty({
    description: 'Source where the document was imported from',
    example: 'Government Portal',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  imported_from: string;

  @ApiProperty({
    description: 'The path where the document is stored',
    example: '/documents/income_certificate.pdf',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  doc_path?: string;

  @ApiProperty({
    description: 'Additional document data (optional)',
    example: 'Document data as base64 string',
    required: false,
  })
  @IsOptional()
  doc_data?: string;

  @ApiProperty({
    description: 'The datatype of the document (e.g. PDF, JPG)',
    example: 'PDF',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  doc_datatype: string;
}
