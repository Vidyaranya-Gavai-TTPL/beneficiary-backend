import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from '../users/users.service';
import { User } from '../../entity/user.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDocDTO } from './dto/user_docs.dto';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UserWithInfo } from './interfaces/user-with-info.interface';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UserApplication } from '@entities/user_applications.entity';
import { CreateUserApplicationDto } from './dto/create-user-application-dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Put('/update/:userId')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(userId, updateUserDto);
  }

  @Get('/get_one/:userId')
  @ApiOperation({ summary: 'Get a user by userId' })
  @ApiResponse({ status: 200, description: 'User data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('userId') userId: string,
    @Query('decryptData') decryptData?: boolean,
  ): Promise<UserWithInfo> {
    return this.userService.findOne(userId, decryptData); // Returns UserWithInfo
  }
  @Delete('/delete/:userId')
  @ApiOperation({ summary: 'Delete a user by userId' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('userId') userId: string): Promise<void> {
    return this.userService.remove(userId);
  }

  @Post('/user_docs')
  @ApiOperation({ summary: 'Save user docs' })
  @ApiResponse({ status: 200, description: 'User docs saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createUserDoc(@Body() createUserDocDto: CreateUserDocDTO) {
    return this.userService.createUserDoc(createUserDocDto);
  }

  @Post('/user_info')
  async createUSerInfo(@Body() createUserInfoDto: CreateUserInfoDto) {
    return await this.userService.createUserInfo(createUserInfoDto);
  }

  @Put('/user_info/:user_id')
  async updateUserInfo(
    @Param('user_id') user_id: string,
    @Body() updateUserInfoDto: CreateUserInfoDto,
  ) {
    return await this.userService.updateUserInfo(user_id, updateUserInfoDto);
  }

  @Post('/consent')
  async createUserConsent(@Body() createConsentDto: CreateConsentDto) {
    return this.userService.createUserConsent(createConsentDto);
  }

  @Post('/user_application')
  @ApiOperation({ summary: 'Create a new user application' })
  @ApiResponse({
    status: 201,
    description: 'User application created successfully',
    type: UserApplication,
  })
  async createUserApplication(
    @Body() createUserApplicationDto: CreateUserApplicationDto,
  ): Promise<UserApplication> {
    return this.userService.createUserApplication(createUserApplicationDto);
  }

  @Get('/user_application/:internal_application_id')
  @ApiOperation({ summary: 'Get user application by ID' })
  @ApiResponse({
    status: 200,
    description: 'User application data',
    type: UserApplication,
  })
  @ApiResponse({ status: 404, description: 'User application not found' })
  async findOneUserApplication(
    @Param('internal_application_id') internal_application_id: string,
  ): Promise<UserApplication> {
    return this.userService.findOneUserApplication(internal_application_id);
  }

  @Get('/user_applications_list/:userId')
  @ApiOperation({ summary: 'Get all applications for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of user applications',
    type: [UserApplication],
  })
  async findAllApplicationsByUserId(
    @Param('userId') userId: string,
  ): Promise<UserApplication[]> {
    return this.userService.findAllApplicationsByUserId(userId);
  }
}
