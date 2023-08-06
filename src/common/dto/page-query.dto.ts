import type { SortOrder } from 'mongoose';

import { Order } from '../../constants';
import { EnumFieldOptional, NumberFieldOptional, StringFieldOptional } from '../../decorators';

export class PageQueryDto {
    @EnumFieldOptional(() => Order, {
        default: Order.ASC
    })
    readonly createdAt: Order = Order.ASC;

    get order(): SortOrder {
        return this.createdAt === Order.DESC ? -1 : 1;
    }

    @NumberFieldOptional({
        minimum: 1,
        default: 1,
        int: true
    })
    readonly page: number = 1;

    @NumberFieldOptional({
        minimum: 1,
        maximum: 50,
        default: 10,
        int: true
    })
    readonly limit: number = 10;

    get skip(): number {
        return (this.page - 1) * this.limit;
    }

    @StringFieldOptional()
    readonly searchKey?: string;
}
