import { User } from '@entities/user.entity';
import { UserDoc } from '@entities/user_docs.entity';
import { UserInfo } from '@entities/user_info.entity';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/common/helper/encryptionService';

@Injectable()
export default class ProfilePopulatorCron {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserDoc)
    private readonly userDocRepository: Repository<UserDoc>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    private readonly encryptionService: EncryptionService,
  ) {}

  // Build Vcs in required format based on user documents
  private async buildVCs(userDocs: any) {
    const vcs = [];

    // Build VC array
    for (const doc of userDocs) {
      const docType = doc.doc_subtype;
      const content = await JSON.parse(
        this.encryptionService.decrypt(doc.doc_data),
      );

      vcs.push({ docType, content });
    }

    return vcs;
  }

  // Get users from database based on conditions
  private async getUsers() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .orderBy(
        `CASE
                  WHEN user.profileFilled IS NULL THEN 0
                  WHEN user.profileFilled = false AND user.profileFilledAt IS NOT NULL THEN 1
                  ELSE 2
              END`,
        'ASC',
      )
      .addOrderBy(
        `CASE
                  WHEN user.profileFilledAt IS NULL THEN "user"."updated_at"
                  ELSE "user"."profileFilledAt"
              END`,
        'DESC',
      )
      .take(10)
      .getMany();

    return users;
  }

  // Get user documents from database
  private async getUserDocs(user: any) {
    const userDocs = await this.userDocRepository.find({
      where: {
        user_id: user.user_id,
      },
    });

    return userDocs;
  }

  // Get value from VC following a path (pathValue)
  private getValue(vc: any, pathValue: any) {
    if (!pathValue) return null;
    return pathValue.split('.').reduce((acc, part) => acc?.[part], vc.content);
  }

  // Handle name fields which are not directcly present in aadhaar vc
  private handleNameFields(vc: any, vcPaths: any, field: any) {
    const fullname = this.getValue(vc, vcPaths['name']);
    if (!fullname) return null;
    const [firstName, middleName, lastName] = fullname.split(' ');

    switch (field) {
      case 'firstName':
        return firstName;
      case 'middleName':
        return middleName;
      case 'lastName':
        return lastName;
      case 'fatherName':
        return middleName;
      default:
        return null;
    }
  }

  // Handle value of gender field from aadhaar vc
  private handleGenderField(vc: any, pathValue: any) {
    const value = this.getValue(vc, pathValue);

    switch (value) {
      case 'M':
        return 'Male';
      case 'F':
        return 'Female';
      default:
        return null;
    }
  }

  // For a field, get its value from given vc
  private async getFieldValueFromVC(vc: any, field: any) {
    const filePath = path.join(
      __dirname,
      `../../../../src/modules/users/crons/vcPaths/${vc.docType}.json`,
    );
    const vcPaths = JSON.parse(await readFile(filePath, 'utf-8'));

    if (!vcPaths) return null;

    // If it is one of the name fields, then get values accordingly
    if (['firstName', 'lastName', 'middleName', 'fatherName'].includes(field))
      return this.handleNameFields(vc, vcPaths, field);

    // If it is gender, value will be 'M' or 'F' from aadhaar, so adjust the value accordingly
    if (field === 'gender') return this.handleGenderField(vc, vcPaths[field]);

    return this.getValue(vc, vcPaths[field]);
  }

  // Build user profile data based on array of fields and available vcs
  private async buildProfile(vcs: any, profileFields: any) {
    const userProfile = {};
    for (const field in profileFields) {
      const vcArray = profileFields[field];

      const vc = vcs.find((vc: any) => vc.docType === vcArray[0]);
      let value: any;
      if (vc) {
        value = await this.getFieldValueFromVC(vc, field);
      } else {
        value = null;
      }

      userProfile[field] = value;
    }

    return userProfile;
  }

  // Build user data and info based on built profile
  private buildUserDataAndInfo(profile: any) {
    const userData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      middleName: profile.middleName,
      dob: profile.dob,
    };

    const userInfo = {
      fatherName: profile.fatherName,
      gender: profile.gender,
      caste: profile.caste,
      annualIncome: profile.annualIncome ? Number(profile.annualIncome) : null,
      class: profile.class ? Number(profile.class) : null,
      studentType: profile.studentType,
    };

    return { userData, userInfo };
  }

  // Handle rows from 'user_info' table in database
  private async handleUserInfo(user: any, userInfo: any) {
    const userRows = await this.userInfoRepository.find({
      where: {
        user_id: user.user_id,
      },
    });

    if (userRows.length === 0) {
      const row = this.userInfoRepository.create({
        user_id: user.user_id,
        fatherName: userInfo.fatherName,
        gender: userInfo.gender,
        caste: userInfo.caste,
        annualIncome: userInfo.annualIncome,
        class: userInfo.class,
        studentType: userInfo.studentType,
      });

      return await this.userInfoRepository.save(row);
    } else {
      const row = userRows[0];
      row.fatherName = userInfo.fatherName;
      row.gender = userInfo.gender;
      row.caste = userInfo.caste;
      row.annualIncome = userInfo.annualIncome;
      row.class = userInfo.class;
      row.studentType = userInfo.studentType;

      return await this.userInfoRepository.save(row);
    }
  }

  // Update values in database based on built profile
  private async updateDatabase(profile: any, user: any) {
    const { userData, userInfo } = this.buildUserDataAndInfo(profile);

    let cnt = 0;
    for (const field in profile) {
      if (!profile[field]) cnt++;
    }
    const profFilled = cnt === 0;

    user.firstName = userData.firstName ? userData.firstName : user.firstName;
    user.lastName = userData.lastName ? userData.lastName : user.lastName;
    user.middleName = userData.middleName;
    user.dob = userData.dob;
    user.profileFilled = profFilled;
    user.profileFilledAt = new Date();

    await this.handleUserInfo(user, userInfo);
    await this.userRepository.save(user);
  }

  @Cron('*/10 * * * * *')
  async populateProfile() {
    try {
      // const userInfos = await this.getUserInfo();

      const users = await this.getUsers();

      for (const user of users) {
        // Get documents from database
        const userDocs = await this.getUserDocs(user);

        // Build VCs in required format
        const vcs = await this.buildVCs(userDocs);
        // console.log('VCs: ', vcs);

        // Get profile fields & corresponding arrays of VC names
        const profileFieldsFilePath = path.join(
          __dirname,
          '../../../../src/modules/users/crons/configFiles/vcArray.json',
        );
        const profileFields = JSON.parse(
          await readFile(profileFieldsFilePath, 'utf-8'),
        );
        // console.log('Profile Fields: ', profileFields);

        // Build user-profile data
        const profile = await this.buildProfile(vcs, profileFields);
        // console.log(profile);

        // update entries in database
        await this.updateDatabase(profile, user);
      }
    } catch (error) {
      console.log("Error in 'Profile Populator CRON': ", error);
    }
  }
}
