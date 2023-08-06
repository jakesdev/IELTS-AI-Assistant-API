import { StringField } from '../../../../decorators';

export class CreateUserDto {
    @StringField()
    email: string;

    @StringField()
    password: string;
}
