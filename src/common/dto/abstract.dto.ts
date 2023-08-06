import { ApiProperty } from '@nestjs/swagger';

import type { AbstractSchema } from '../abstract.schema';

export class AbstractDto {
    @ApiProperty({ example: '000000x0-00x0-0000-000x-xx0xx00x000x' })
    id: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    deletedAt: Date;

    constructor(schema: AbstractSchema, options?: { excludeFields?: boolean }) {
        if (!options?.excludeFields) {
            this.id = schema._id;
            this.createdAt = schema.createdAt;
            this.updatedAt = schema.updatedAt;
        }
    }
}
