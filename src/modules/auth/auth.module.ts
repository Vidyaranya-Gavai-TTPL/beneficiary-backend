import { Module } from '@nestjs/common';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { KeycloakModule } from 'src/services/keycloak/keycloak.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '@services/keycloak/keycloak.service';
import { UserService } from '@modules/users/users.service';
import { UserModule } from '@modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';

@Module({
  imports: [KeycloakModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, KeycloakService, UserService],
  exports: [AuthService],
})
export class AuthModule {}
