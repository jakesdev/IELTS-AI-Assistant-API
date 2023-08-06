/* eslint-disable unicorn/no-empty-file */
import type { Request } from 'express';

import type { Users } from '../../users/schema';
interface IRequestWithUser extends Request {
    user: Users;
}

export default IRequestWithUser;
