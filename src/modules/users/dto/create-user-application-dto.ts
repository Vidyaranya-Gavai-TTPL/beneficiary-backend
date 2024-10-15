import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserApplicationDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Unique identifier for the benefit',
    type: String,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  benefit_id: string;

  @ApiProperty({
    description: 'Benefit provider ID',
    type: String,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  benefit_provider_id: string;

  @ApiProperty({
    description: 'Benefit provider URI',
    type: String,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  benefit_provider_uri: string;

  @ApiProperty({
    description: 'External application ID',
    type: String,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  external_application_id: string;

  @ApiProperty({
    description: 'Status of the application',
    type: String,
    maxLength: 20,
    example: 'pending',
  })
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  @IsNotEmpty()
  status: string;
}
