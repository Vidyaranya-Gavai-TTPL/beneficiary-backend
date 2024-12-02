import { User } from '@entities/user.entity';
import { UserDoc } from '@entities/user_docs.entity';
import { UserInfo } from '@entities/user_info.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/common/helper/encryptionService';
import ProfilePopulator from 'src/common/helper/profileUpdate/profile-update';

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

  // Get users from database based on conditions
  private async getUsers() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .orderBy(
        `CASE
                  WHEN user.fieldsVerified IS NULL THEN 0
                  WHEN user.fieldsVerified = false AND user.fieldsVerifiedAt IS NOT NULL THEN 1
                  ELSE 2
              END`,
        'ASC',
      )
      .addOrderBy(
        `CASE
                  WHEN user.fieldsVerifiedAt IS NULL THEN "user"."updated_at"
                  ELSE "user"."fieldsVerifiedAt"
              END`,
        'ASC',
      )
      .take(10)
      .getMany();

    return users;
  }

  @Cron('*/5 * * * *')
  async populateProfile() {
    try {
      const users = await this.getUsers();
      await this.profilePopulator.populateProfile(users);
    } catch (error) {
      Logger.error("Error in 'Profile Populator CRON': ", error);
    }
  }
}
