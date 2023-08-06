import { Request } from "express";
import { Users } from '../users/schema';

export default interface RequestWithUser extends Request {
  user: Users;
}
