/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { totp } from 'otplib';

import { Cache } from 'cache-manager';
import { validateHash } from '../../common/utils';
import { TimeExpression, Token, UserRole } from '../../constants';
import { ApiConfigService } from '../../shared/services/api-config.service';
import type { ResetPasswordDto } from '../users/dto/request';
import type { Users } from '../users/schema';
// import { MailGunService } from '../../shared/services/mail-gun.service';
// import type { ResetPasswordDto } from '../users/dto';
// import type { User } from '../users/entities';
import { UsersService } from '../users/users.service';
import type { OTPDto, UserLoginDto } from './dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ApiConfigService,
        private readonly usersService: UsersService,
    ) {}

    async createAccessToken(data: { role: UserRole; userId: string }): Promise<TokenPayloadDto> {
        return new TokenPayloadDto({
            expiresIn: this.configService.authConfig.jwtExpirationTime,
            accessToken: await this.jwtService.signAsync({
                userId: data.userId,
                type: Token.ACCESS_TOKEN,
                role: data.role
            }),
            refreshToken: await this.jwtService.signAsync(
                {
                    userId: data.userId,
                    type: Token.REFRESH_TOKEN,
                    role: data.role
                },
                {
                    // set expired date refresh token
                    expiresIn: TimeExpression.ONE_WEEK
                }
            )
        });
    }

    async refreshToken(token: string): Promise<TokenPayloadDto> {
        const payload = await this.jwtService.verifyAsync(token);

        const userId = payload.sub;

        const userRole= payload.role;

        if (userId) {
            const user = await this.usersService.findById(userId);

            if (!user) {
                throw new NotFoundException(`USER_NOT_FOUND`);
            }

            return this.createAccessToken({
                userId,
                role: userRole
            });
        }
        else{
            throw new BadRequestException(`AUTH_INVALID_TOKEN`);
        }
    }

    async validateUser(userLoginDto: UserLoginDto, ip: string): Promise<Users> {
        const user = await this.usersService.getUserByEmail(userLoginDto.email);

        if (!user) {
            throw new NotFoundException(`AUTH_EMAIL_NOT_FOUND`);
        }

        const isPasswordValid = await validateHash(userLoginDto.password, user?.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException(`AUTH_INCORRECT_PASSWORD`);
        }

        return user;
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByIdOrEmail({
            email
        });

        if (!user) {
            throw new NotFoundException(`USER_NOT_FOUND`);
        }

        totp.options = {
            digits: 6,
            step: 600
        };

        const otpCode = totp.generate(email);
        const username = user.email;
        // await this.mailService.sendEmailOTP(user.email, 'Change Password', { username, otpCode });
        // return otpCode
    }

    async verifyOTP(dto: OTPDto): Promise<Users> {
        const user = await this.usersService.findByIdOrEmail({
            email: dto.email
        });

        if (!totp.check(dto.otpCode, dto.email)) {
            throw new BadRequestException(`AUTH_INVALID_OTP`);
        }

        return user;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        return this.usersService.resetPassword(resetPasswordDto);
    }

    public async getUserFromAuthenticationToken(token: string) {
        const payload = await this.jwtService.verifyAsync(token);

        const userId = payload.sub;

        if (userId) {
            return this.usersService.findById(userId);
        }
    }
}
