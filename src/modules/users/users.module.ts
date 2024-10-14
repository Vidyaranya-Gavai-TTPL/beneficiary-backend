import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@modules/users/users.controller';
import { UserService } from '@modules/users/users.service';
import { User } from '@entities/user.entity';
import { UserDoc } from '@entities/user_docs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDoc])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
