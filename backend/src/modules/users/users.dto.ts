import { IUser } from '../users/user.model';

export class UpdateUserDto implements Partial<IUser> {
  username!: string;
  email!: string;
  country!: string;
  phone!: string;
  phoneCode!: string;
}