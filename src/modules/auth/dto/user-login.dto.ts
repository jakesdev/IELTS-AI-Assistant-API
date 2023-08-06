import { StringField } from '../../../decorators';

export class UserLoginDto {
    @StringField({ toLowerCase: true })
    readonly email: string;

    @StringField()
    readonly password: string;
}
