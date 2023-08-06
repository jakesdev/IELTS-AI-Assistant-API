import { ApiProperty } from '@nestjs/swagger';

import { Users } from '../../users/schema';
import { TokenPayloadDto } from '.';

export class LoginPayloadDto {
    @ApiProperty({ type: () => Users })
    user: Users;

    @ApiProperty({ type: () => TokenPayloadDto })
    token: TokenPayloadDto;

    constructor(user: Users, token: TokenPayloadDto) {
        this.user = user;
        this.token = token;
    }
}
