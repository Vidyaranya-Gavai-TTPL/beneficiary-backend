import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }
    Object.assign(existingUser, updateUserDto);
    return await this.userRepository.save(existingUser);
  }

  async findOne(user_id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID '${user_id}' not found`);
    }
    return user;
  }

  async remove(user_id: string): Promise<void> {
    const user = await this.findOne(user_id);
    await this.userRepository.remove(user);
  }
  // Method to check if mobile number exists
  async findByMobile(mobile: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { phone_number: mobile },
    });
  }

  async createKeycloakData(body): Promise<User> {
    const user = this.userRepository.create({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone_number: body.mobile,
      sso_provider: 'keycloak',
      sso_id: body.keycloak_id,
      created_at: new Date(),
    });
    return await this.userRepository.save(user);
  }
}
