import { Request } from "express";
import { IUser } from "../modules/users/user.model"; // Adjust the path to your User model

export interface AuthenticatedRequest extends Request {
  user: IUser; // Ensure this matches your user type
}
