import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDocDTO } from './dto/user_docs.dto';
import { UserDoc } from '@entities/user_docs.entity';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UserInfo } from '@entities/user_info.entity';
import { EncryptionService } from 'src/common/helper/encryptionService';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserDoc)
    private readonly userDocsRepository: Repository<UserDoc>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    private readonly encryptionService: EncryptionService,
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

  async findOne(sso_id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { sso_id } });
    if (!user) {
      throw new NotFoundException(`User with ID '${sso_id}' not found`);
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
  // User docs save
  async createUserDoc(createUserDocDto: CreateUserDocDTO): Promise<UserDoc> {
    const encrypted = this.encryptionService.encrypt(createUserDocDto.doc_data);
    createUserDocDto.doc_data = encrypted;
    const newUserDoc = this.userDocsRepository.create(createUserDocDto);
    return await this.userDocsRepository.save(newUserDoc);
  }
  // User info
  async createUserInfo(
    createUserInfoDto: CreateUserInfoDto,
  ): Promise<UserInfo> {
    const encrypted = this.encryptionService.encrypt(createUserInfoDto.aadhar);
    createUserInfoDto.aadhar = encrypted;
    const userInfo = this.userInfoRepository.create(createUserInfoDto);
    return await this.userInfoRepository.save(userInfo);
  }

  async updateUserInfo(
    user_id: string,
    updateUserInfoDto: CreateUserInfoDto,
  ): Promise<UserInfo> {
    const userInfo = await this.findOne(user_id); // Check if the user info record exists
    Object.assign(userInfo, updateUserInfoDto); // Update the record with new values
    return await this.userInfoRepository.save(userInfo); // Save the updated record
  }
}
