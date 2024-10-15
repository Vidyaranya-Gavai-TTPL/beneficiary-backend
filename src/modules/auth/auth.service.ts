import { UserService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KeycloakService } from 'src/services/keycloak/keycloak.service';

const crypto = require('crypto');
const axios = require('axios');

const jwt = require('jwt-decode');
@Injectable()
export class AuthService {
  public smsKey = this.configService.get<string>('SMS_KEY');
  public keycloak_admin_cli_client_secret = this.configService.get<string>(
    'KEYCLOAK_ADMIN_CLI_CLIENT_SECRET',
  );

  constructor(
    private configService: ConfigService,
    private readonly keycloakService: KeycloakService,
    private userService: UserService,
  ) {}

  public async login(req, response) {
    const data = {
      username: req.body.phone_number,
      password: req.body.password,
      type: 'login',
    };

    const token = await this.keycloakService.getUserKeycloakToken(data);

    if (token) {
      return response.status(200).send({
        success: true,
        message: 'LOGGEDIN_SUCCESSFULLY',
        data: token,
      });
    } else {
      return response.status(401).send({
        success: false,
        message: 'INVALID_USERNAME_PASSWORD_MESSAGE',
        data: null,
      });
    }
  }

  public async register(body, response) {
    // Step 1: Check if the mobile number already exists in the 'users' table using TypeORM
    let isMobileExist = await this.userService.findByMobile(body?.phone_number);
    console.log('isMobileExist', isMobileExist);

    if (isMobileExist) {
      return response.status(422).send({
        success: false,
        message: 'Mobile Number Already Exists',
        data: {},
      });
    }

    let username = body.phone_number;

    let data_to_create_user = {
      enabled: 'true',
      firstName: body?.first_name,
      lastName: body?.last_name,
      username: username,
      credentials: [
        {
          type: 'password',
          value: body?.password,
          temporary: false,
        },
      ],
    };

    // Step 3: Get Keycloak admin token
    const token = await this.keycloakService.getAdminKeycloakToken();

    if (token?.access_token) {
      try {
        // Step 4: Register user in Keycloak
        const registerUserRes = await this.keycloakService.registerUser(
          data_to_create_user,
          token.access_token,
        );

        if (registerUserRes.error) {
          if (
            registerUserRes.error.message ==
            'Request failed with status code 409'
          ) {
            return response.status(409).json({
              success: false,
              message: 'User already exists!',
              data: {},
            });
          } else {
            return response.status(200).json({
              success: false,
              message: registerUserRes.error.message,
              data: {},
            });
          }
        } else if (registerUserRes.headers.location) {
          const split = registerUserRes.headers.location.split('/');
          const keycloak_id = split[split.length - 1];
          body.keycloak_id = keycloak_id;
          body.username = data_to_create_user.username;

          // Step 5: Try to create user in PostgreSQL
          const result = await this.userService.createKeycloakData(body);

          // If successful, return success response
          return response.status(200).send({
            success: true,
            message: 'User created successfully',
            data: {
              user: result,
              keycloak_id: keycloak_id,
              username: data_to_create_user.username,
            },
          });
        } else {
          return response.status(200).json({
            success: false,
            message: 'Unable to create user in Keycloak',
            data: {},
          });
        }
      } catch (error) {
        console.error('Error during user registration:', error);

        // Step 6: Rollback - delete user from Keycloak if PostgreSQL insertion fails
        if (body?.keycloak_id) {
          await this.keycloakService.deleteUser(body.keycloak_id);
          console.log(
            'Keycloak user deleted due to failure in PostgreSQL creation',
          );
        }

        return response.status(500).json({
          success: false,
          message:
            'Error during user registration. Keycloak user has been rolled back.',
          data: {},
        });
      }
    } else {
      return response.status(200).json({
        success: false,
        message: 'Unable to get Keycloak token',
        data: {},
      });
    }
  }

  public async logout(req, response) {
    const accessToken = req.body.access_token;
    const refreshToken = req.body.refresh_token; // Optional: if provided

    try {
      // Revoke the access token
      await this.keycloakService.revokeToken(accessToken);

      // Optionally, revoke the refresh token if provided
      if (refreshToken) {
        await this.keycloakService.revokeToken(refreshToken, 'refresh_token');
      }

      // Return successful logout response
      return response.status(200).send({
        success: true,
        message: 'LOGGED OUT SUCCESSFULLY',
      });
    } catch (error) {
      console.error('Error during logout:', error.message);
      return response.status(500).send({
        success: false,
        message: 'LOGOUT_FAILED',
      });
    }
  }
}
