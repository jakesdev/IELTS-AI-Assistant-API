import { BooleanFieldOptional } from '../../../../decorators';

export class ChangeNotificationSettingDto {
    @BooleanFieldOptional()
    allowNotifications: boolean;

    @BooleanFieldOptional()
    allowEmails: boolean;
}
