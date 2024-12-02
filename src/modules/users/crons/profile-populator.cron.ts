import { User } from '@entities/user.entity';
import { UserDoc } from '@entities/user_docs.entity';
import { UserInfo } from '@entities/user_info.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/common/helper/encryptionService';
import ProfilePopulator from 'src/common/helper/profileUpdate/profile-populator.cron';

@Injectable()
export default class ProfilePopulatorCron {
  private readonly profilePopulator: ProfilePopulator;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserDoc)
    private readonly userDocRepository: Repository<UserDoc>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    private readonly encryptionService: EncryptionService,
  ) {
    this.profilePopulator = new ProfilePopulator(
      userRepository,
      userDocRepository,
      userInfoRepository,
      encryptionService,
    );
  }

  @Cron('*/5 * * * *')
  async populateProfile() {
    try {
      await this.profilePopulator.populateProfile();
    } catch (error) {
      Logger.error("Error in 'Profile Populator CRON': ", error);
    }
  }
}
