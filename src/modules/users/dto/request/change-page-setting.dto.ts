import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

import { EnumFieldOptional, StringFieldOptional } from '../../../../decorators';
import { ColorPaletteDto } from './color-palette.dto';

export class ChangePageSettingDto {
    @StringFieldOptional()
    websiteName: string;

    @StringFieldOptional()
    font: string;

    @ApiPropertyOptional({ type: () => ColorPaletteDto })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ColorPaletteDto)
    colorPalette: ColorPaletteDto;
}
