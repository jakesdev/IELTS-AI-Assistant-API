import { StringField } from '../../../../decorators';

export class ChangePasswordDto {
    @StringField({ trim: false })
    newPassword: string;

    @StringField({ trim: false })
    newPasswordConfirmed: string;
}
