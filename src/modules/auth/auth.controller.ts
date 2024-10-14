import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

import { RegisterDTO } from './dto/register.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService) {}

  // users/register on keycloak and postgres both side.
  @Post('/register')
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: RegisterDTO })
  @ApiResponse({ status: 200, description: 'User registered successfully.' })
  @ApiResponse({ status: 422, description: 'Mobile number already exists.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  public async register(@Body() body: RegisterDTO, @Res() response: Response) {
    return this.authService.register(body, response);
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  login(@Req() req: Request, @Res() response: Response) {
    return this.authService.login(req, response);
  }

  //   @Post('/logout')
  //   @UsePipes(ValidationPipe)
  //   logout(@Req() req: Request, @Res() response: Response) {
  //     return this.authService.logout(req, response);
  //   }
  @Post('/refresh-token')
  @UsePipes(ValidationPipe)
  refreshToken(@Req() req: Request, @Res() response: Response) {
    return this.authService.refreshToken(req, response);
  }

  //
}
