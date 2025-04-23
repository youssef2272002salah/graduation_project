import jwt from "jsonwebtoken";
import { IUser } from "modules/users/user.model";

export const  signToken= (id: string): string => {
      return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN as string, 10000) || "100000d", 
      });
    }

