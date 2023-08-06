import { HttpService } from '@nestjs/axios';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { PageQueryDto } from '../../common/dto';
import { PageDto, PageMetaDto, ResponseDto } from '../../common/dto';
import { generateHash } from '../../common/utils';
import { SuccessCode, UserRole } from '../../constants';
import type { IFile } from '../../interfaces';
import { ApiConfigService } from '../../shared/services/api-config.service';
import type { UserRegisterDto } from '../auth/dto';

import type {
    ChangeNotificationSettingDto,
    ChangePageSettingDto,
    ChangePasswordDto,
    ResetPasswordDto
} from './dto/request';
import { Users } from './schema';

@Injectable()
export class UsersService {
    private monthsArray = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    constructor(
        @InjectModel(Users.name) private readonly usersModel: Model<Users>,
    ) {}

    async getAllUsers(query: PageQueryDto) {
        const itemCount = await this.usersModel.count();

        let queryBuilder = this.usersModel
            .find({
                role: { $ne: UserRole.ADMIN }
            })
            .skip(query.skip)
            .limit(query.limit)
            .sort({ createdAt: query.order })
            .select('-password');

        if (query.searchKey) {
            queryBuilder = queryBuilder.find({
                $or: [
                    { url: { $regex: new RegExp(query.searchKey, 'i') } },
                    { email: { $regex: new RegExp(query.searchKey, 'i') } }
                ]
            });
        }

        const tickets = await queryBuilder;

        const meta = new PageMetaDto({ query, itemCount });

        return new PageDto(tickets, meta);
    }

    async getUserCountCreatedByMonth(): Promise<Array<{ month: string; count: number; }>> {
        const result = await this.usersModel.aggregate([
            {
                $match: {
                    role: { $ne: UserRole.ADMIN }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    count: 1
                }
            }
        ]);

        const monthResult = result.map((item) => ({
            month: this.monthsArray[item.month - 1],
            count: item.count
        }));

        // return array of 12 months with count
        return this.monthsArray.map((month) => {
            const monthData = monthResult.find((item) => item.month === month);

            return {
                month,
                count: monthData ? monthData.count : 0
            };
        });
    }


    async createUser(createUserDto: UserRegisterDto): Promise<Users> {
        const user = await this.usersModel.findOne({ email: createUserDto.email });

        if (user) {
            throw new BadRequestException('User already exists');
        }

        const createdUser = new this.usersModel(createUserDto);
        createdUser.password = generateHash(createUserDto.password);

        const newUser = await createdUser.save();

        return newUser;
    }

    async findOne(query: { id?: string; email?: string; role?: string; }): Promise<Users> {
        const user = await this.usersModel.findOne(query);

        if (!user) {
            throw new NotFoundException(`USER_NOT_FOUND`);
        }

        return user;
    }

    async getUserByEmail(email: string): Promise<Users | null> {
        return this.usersModel.findOne({ email });
    }

    async findByIdOrEmail({ id, email }: { id?: string; email?: string; }) {
        const user = await this.usersModel.findOne({ $or: [{ _id: id }, { email }] });

        if (!user) {
            throw new NotFoundException(`USER_NOT_FOUND`);
        }

        return user;
    }

    async findById(id: string) {
        const user = await this.usersModel.findOne({ _id: id });

        if (!user) {
            throw new NotFoundException(`USER_NOT_FOUND`);
        }

        return user;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResponseDto> {
        const user = await this.findByIdOrEmail({
            email: resetPasswordDto.email
        });

        if (!user) {
            throw new NotFoundException(`USER_NOT_FOUND`);
        }

        await this.updatePassword(user.email, resetPasswordDto.newPassword);

        return new ResponseDto({ messageCode: SuccessCode.PASSWORD_CHANGED });
    }

    async updatePassword(email: string, password: string) {
        password = generateHash(password);

        return this.usersModel.updateOne({ email }, { password });
    }


    async updateProfile(user: Users, url: string, file: IFile) {



        await this.usersModel.updateOne(
            { email: user.email },
            {
                url,
            }
        );

    }



    async checkExistingEmail(email: string) {
        const result = await this.usersModel.exists({ email });

        if (result) {
            throw new ConflictException(`AUTH_EMAIL_EXISTED`);
        }

        return new ResponseDto({ messageCode: SuccessCode.EMAIL_VALID });
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.findByIdOrEmail({ id: userId });

        if (changePasswordDto.newPassword === changePasswordDto.newPasswordConfirmed) {
            await this.updatePassword(user.email, changePasswordDto.newPassword);

            return new ResponseDto({ messageCode: SuccessCode.PASSWORD_UPDATED });
        }

        throw new BadRequestException(`PASSWORD_NOT_UPDATED`);
    }

    getRandomUser(user: Users) {
        return this.usersModel.aggregate([
            { $match: { _id: { $ne: user._id }, role: { $ne: UserRole.ADMIN } } },
            { $sample: { size: 5 } }
        ]);
    }

}
