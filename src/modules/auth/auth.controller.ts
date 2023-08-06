import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Patch, Post, Query, Req } from '@nestjs/common';
import {
    ApiAcceptedResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { ResponseDto } from '../../common/dto';
import { UserRole } from '../../constants';
import { Auth, RefreshToken } from '../../decorators';
import { ResetPasswordDto } from '../users/dto/request';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import type { TokenPayloadDto } from './dto';
import { LoginPayloadDto, OTPDto, UserLoginDto, UserRegisterDto, ValidateEmailDto } from './dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import IRequestWithUser from './strategy/request-with-user.interface';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private usersService: UsersService, private authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: 'User info with access token'
    })
    @ApiOperation({ summary: 'Login with credentials' })
    async userLogin(@Body() userLoginDto: UserLoginDto, @Ip() ip: string): Promise<LoginPayloadDto> {
        const userEntity = await this.authService.validateUser(userLoginDto, ip);

        const token = await this.authService.createAccessToken({
            userId: userEntity.id,
            role: userEntity.role
        });

        return new LoginPayloadDto(userEntity, token);
    }

    @Throttle(3, 60)
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Generate OTP send to user email'
    })
    @ApiOperation({ summary: 'Forgot password' })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'OTP verification successfully!'
    })
    @ApiOperation({ summary: 'Verify OTP' })
    async verifyOtp(@Body() dto: OTPDto): Promise<TokenPayloadDto> {
        const user = await this.authService.verifyOTP(dto);

        return this.authService.createAccessToken({
            userId: user.id,
            role: user.role
        });
    }

    @Patch('reset-password')
    @HttpCode(HttpStatus.ACCEPTED)
    @Auth([UserRole.USER, UserRole.ADMIN])
    @ApiAcceptedResponse({
        description: 'Reset password successfully'
    })
    @ApiOperation({ summary: 'Reset password' })
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({
        type: ResponseDto,
        description: 'Successfully Registered'
    })
    @ApiOperation({ summary: 'Register with Email/Password' })
    async userRegister(@Body() dto: UserRegisterDto) {
        return this.usersService.createUser(dto);
    }

    @RefreshToken()
    @Post('refresh-token')
    @ApiOperation({ summary: 'Generate new access token' })
    async refreshToken(@Req() req: IRequestWithUser) {
        if (req?.user) {
            return this.authService.createAccessToken({
                userId: req.user.id,
                role: req.user.role
            });
        }
    }

    @Get('email-validation')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: ResponseDto })
    @ApiOperation({ summary: 'Check if email is already taken' })
    checkExistingEmail(@Query() dto: ValidateEmailDto) {
        return this.usersService.checkExistingEmail(dto.email);
    }
}
