/* eslint-disable no-invalid-this */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { UserRole } from '../../../constants';
import { AbstractSchema } from '../../../common/abstract.schema';

@Schema()
export class Users extends AbstractSchema {
    @Prop({ type: String })
    firstName: string;

    @Prop({ type: String })
    lastName: string;

    @Prop({ type: String, unique: true })
    email: string;

    @Prop({ type: String })
    password: string;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
