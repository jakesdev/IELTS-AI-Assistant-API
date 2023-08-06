import { HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseDto {
    @ApiPropertyOptional({ example: HttpStatus.OK })
    readonly statusCode?: number;

    @ApiPropertyOptional({ example: 'OK' })
    readonly messageCode: string;

    constructor(response: ResponseDto) {
        this.messageCode = response.messageCode;
    }
}
