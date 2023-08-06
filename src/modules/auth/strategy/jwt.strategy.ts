import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { ObjectId } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { TokenType, UserRole } from '../../../constants';
import { Token } from '../../../constants';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import type { Users } from '../../users/schema';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ApiConfigService, private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.authConfig.publicKey
        });
    }

    async validate(args: { userId: ObjectId; role: UserRole; type: TokenType }): Promise<Users> {
        if (args.type !== Token.ACCESS_TOKEN) {
            throw new UnauthorizedException(`UNAUTHORIZED`);
        }

        const user = await this.usersService.findByIdOrEmail({ id: args.userId.toString() });

        if (!user) {
            throw new UnauthorizedException(`UNAUTHORIZED`);
        }

        return user;
    }
}
