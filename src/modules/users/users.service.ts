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
import { UserWithInfo } from './interfaces/user-with-info.interface';
import { Consent } from '@entities/consent.entity';
import { CreateConsentDto } from './dto/create-consent.dto';
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
    @InjectRepository(Consent)
    private readonly consentRepository: Repository<Consent>,
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

  async findOne(sso_id: string, decryptData?: boolean): Promise<UserWithInfo> {
    let user = await this.userRepository.findOne({ where: { sso_id } });
    if (!user) {
      throw new NotFoundException(`User with ID '${sso_id}' not found`);
    }
    const userInfo = await this.findOneUserInfo(user.user_id, decryptData);
    const final: UserWithInfo = {
      user,
      userInfo: userInfo,
    };
    return final;
  }

  async findOneUserInfo(
    user_id: string,
    decryptData: boolean,
  ): Promise<UserInfo> {
    let userInfo = await this.userInfoRepository.findOne({
      where: { user_id },
    });
    if (decryptData) {
      const decrypted = this.encryptionService.decrypt(userInfo.aadhar);
      userInfo.aadhar = decrypted;
    }

    if (!userInfo) {
      throw new NotFoundException(`User Info with ID '${user_id}' not found`);
    }

    return userInfo;
  }

  async remove(user_id: string): Promise<void> {
    const userWithInfo = await this.findOne(user_id);

    const user = userWithInfo.user;

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
    if (
      createUserDocDto.doc_data &&
      typeof createUserDocDto.doc_data !== 'string'
    ) {
      const jsonDataString = JSON.stringify(createUserDocDto.doc_data);

      // Encrypt the JSON string
      createUserDocDto.doc_data =
        this.encryptionService.encrypt(jsonDataString);
    }

    // Ensure doc_data is always a string when calling create
    const newUserDoc = this.userDocsRepository.create({
      ...createUserDocDto,
      doc_data: createUserDocDto.doc_data as string,
    });

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
    const userInfo = await this.findOneUserInfo(user_id, true); // Fetch UserInfo directly

    Object.assign(userInfo, updateUserInfoDto);

    return await this.userInfoRepository.save(userInfo);
  }
  // Create a new consent record
  async createUserConsent(
    createConsentDto: CreateConsentDto,
  ): Promise<Consent> {
    const consent = this.consentRepository.create(createConsentDto);
    return await this.consentRepository.save(consent);
  }
}
