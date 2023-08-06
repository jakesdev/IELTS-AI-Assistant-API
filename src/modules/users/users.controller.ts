import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
    UploadedFile
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';

import { PageQueryDto, ResponseDto } from '../../common/dto';
import { UserRole } from '../../constants';
import { Auth, AuthUser, FileLimits } from '../../decorators';
import { IFile } from '../../interfaces';
import { ChangeNotificationSettingDto, ChangePageSettingDto, ChangePasswordDto } from './dto/request';
import { Users } from './schema';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(
        @InjectConnection() private readonly mongoConnection: Connection,
        private usersService: UsersService
    ) {}

    @Get()
    @Auth([UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get all users',
        type: [Users]
    })
    @ApiOperation({ summary: 'Get all users' })
    getAllUsers(@Query() query: PageQueryDto) {
        return this.usersService.getAllUsers(query);
    }

    @Get('me')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get current user',
        type: Users
    })
    @ApiOperation({ summary: 'Get current user' })
    async getCurrentUser(@AuthUser() user: Users) {
        return this.usersService.findByIdOrEmail({ email: user.email });
    }

    @Get('by-month')
    @Auth([UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get user by month',
        type: ResponseDto
    })
    @ApiOperation({ summary: 'Get user by month' })
    getUserByMonth() {
        return this.usersService.getUserCountCreatedByMonth();
    }

    @Get('random')
    @HttpCode(HttpStatus.OK)
    @Auth([UserRole.USER, UserRole.ADMIN])
    @ApiOkResponse({
        description: 'Get random user',
        type: Users
    })
    @ApiOperation({ summary: 'Get random user' })
    getRandomUser(@AuthUser() user: Users) {
        return this.usersService.getRandomUser(user);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get user by id',
        type: Users
    })
    @ApiOperation({ summary: 'Get user by id' })
    async getUser(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch('profile')
    @Auth([UserRole.USER])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Update profile successfully',
        type: ResponseDto
    })
    @FileLimits()
    updateProfile(@AuthUser() user: Users, @Body() body: { url: string }, @UploadedFile() file: IFile) {
        return this.usersService.updateProfile(user, body.url, file);
    }


    @Patch('change-password')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: ResponseDto,
        description: 'Change password successfully'
    })
    @ApiOperation({ summary: 'Change password' })
    changePassword(@Body() changePasswordDto: ChangePasswordDto, @AuthUser() user: Users) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this.usersService.changePassword(user.id, changePasswordDto);
    }

}
