import { ApiProperty } from '@nestjs/swagger';

import type { PageQueryDto } from './page-query.dto';

interface IPageMetaDtoParameters {
    query: PageQueryDto;
    itemCount: number;
}

export class PageMetaDto {
    @ApiProperty()
    readonly page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    readonly itemCount: number;

    @ApiProperty()
    readonly pageCount: number;

    @ApiProperty()
    readonly hasPreviousPage: boolean;

    @ApiProperty()
    readonly hasNextPage: boolean;

    constructor({ query, itemCount }: IPageMetaDtoParameters) {
        this.page = query.page;
        this.limit = query.limit;
        this.itemCount = itemCount;
        this.pageCount = Math.ceil(this.itemCount / this.limit);
        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.pageCount;
    }
}
