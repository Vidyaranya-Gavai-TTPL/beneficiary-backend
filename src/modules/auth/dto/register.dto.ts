import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDTO {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  last_name: string;

  @IsNotEmpty({ message: 'Mobile number is required' })
  phone_number: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
