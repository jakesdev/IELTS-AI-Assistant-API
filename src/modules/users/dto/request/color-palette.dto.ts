import { StringField } from '../../../../decorators';

export class ColorPaletteDto {
    @StringField()
    primaryColor: string;

    @StringField()
    secondaryColor: string;

    @StringField()
    accentColor: string;

    @StringField()
    buttonColor: string;
}
