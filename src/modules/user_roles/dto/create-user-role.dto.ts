import { IsUUID, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRoleDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'The UUID of the user',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    example: 'b2c7489e-6109-4c53-8b09-cc7c3b48dcd1',
    description: 'The UUID of the role',
  })
  @IsUUID()
  @IsNotEmpty()
  role_id: string;

  @ApiProperty({
    example: 'admin',
    description: 'The slug for the role (e.g., admin, user, editor)',
  })
  @IsString()
  @IsNotEmpty()
  role_slug: string;

  @ApiProperty({
    example: true,
    description: 'The status of the user role',
  })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
