import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('roles')
export class Role {
  @ApiProperty({
    example: 1,
    description: 'Primary key, auto-generated ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'UUID for the role, generated automatically',
  })
  @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  role_id: string;

  @ApiProperty({
    example: 'Admin',
    description: 'The name of the role',
  })
  @Column({ type: 'varchar', length: 100 })
  role_name: string;

  @ApiProperty({
    example: 'admin',
    description: 'The slug for the role, a unique identifier',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @ApiProperty({
    example: '{}',
    description: 'A JSON object defining the actions allowed for the role',
  })
  @Column({ type: 'jsonb' })
  actions: Record<string, any>;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time the role was created',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time the role was last updated',
  })
  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at: Date;
}
