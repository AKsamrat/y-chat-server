import { UserRole } from "../user/user.interface";

export interface IAuth {
  email: string;
  password: string;

}

export interface IJwtPayload {
  userId: string;
  name: string;
  email: string;
  hasShop?: boolean;
  role: UserRole;
  isActive: boolean;
}
