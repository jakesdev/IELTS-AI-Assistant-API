import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ApiConfigService } from '../../shared/services/api-config.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConfig } from './configs';
import { JwtRefreshTokenStrategy } from './strategy/jwt.refreshtoken.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PublicStrategy } from './strategy/public.strategy';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: (configService: ApiConfigService) => ({
                privateKey: configService.authConfig.privateKey,
                publicKey: configService.authConfig.publicKey,
                signOptions: {
                    algorithm: 'RS256',
                    expiresIn: configService.authConfig.jwtExpirationTime
                },
                verifyOptions: {
                    algorithms: ['RS256']
                }
            }),
            inject: [ApiConfigService]
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PublicStrategy, JwtRefreshTokenStrategy ],
    exports: [JwtModule, AuthService]
})
export class AuthModule {}
