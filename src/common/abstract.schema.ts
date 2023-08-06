import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IAbstractSchema extends Document {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export abstract class AbstractSchema extends Document implements IAbstractSchema {
    @Prop()
    _id: string;

    @Prop({ default: Date.now() })
    createdAt: Date;

    @Prop({ default: Date.now() })
    updatedAt: Date;

    @Prop()
    deletedAt: Date;
}
