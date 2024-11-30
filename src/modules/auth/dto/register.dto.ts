import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDTO {
  @ApiProperty({})
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[5-9]\d{9}$/, {
    message:
      'Phone number must start with a digit from 5 to 9 and have 10 digits total',
  })
  phoneNumber: string;

  @ApiProperty({})
  @IsOptional()
  password: string;
}
