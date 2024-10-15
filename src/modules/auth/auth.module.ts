import { Module } from '@nestjs/common';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { KeycloakModule } from 'src/services/keycloak/keycloak.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '@services/keycloak/keycloak.service';
import { UserService } from '@modules/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { UserDoc } from '@entities/user_docs.entity';
import { UserInfo } from '@entities/user_info.entity';
import { EncryptionService } from 'src/common/helper/encryptionService';
import { Consent } from '@entities/consent.entity';

@Module({
  imports: [
    KeycloakModule,
    TypeOrmModule.forFeature([User, UserDoc, UserInfo, Consent]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    KeycloakService,
    UserService,
    EncryptionService,
  ],
  exports: [AuthService, UserService, EncryptionService],
})
export class AuthModule {}
