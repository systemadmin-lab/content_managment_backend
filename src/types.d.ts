import { IUser } from './schemas/userSchema';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
