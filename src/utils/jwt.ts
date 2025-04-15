import jwt from "jsonwebtoken";
import { IUser } from "modules/users/user.model";

export const  signToken= (id: string): string => {
      console.log("Signing JWT with secret:", process.env.JWT_SECRET);
      return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN as string, 10000) || "100000d", 
      });
    }


// export const createSendToken= (user: IUser, res: Response)=> {
//     const token = this.signToken(user._id.toString());

//     // Set cookie options
//     const cookieOptions = {
//         httpOnly: true, // Prevent XSS attacks
//         secure: process.env.NODE_ENV === "production", // Only HTTPS in production
//         sameSite: "strict", // Prevent CSRF attacks
//         maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     };

//     // Set token in cookies
//     res.cookie("jwt", token, cookieOptions);

//     return {
//         token,
//         user: {
//             id: user._id,
//             fullname: user.fullname,
//             email: user.email,
//             role: user.role,
//         },
//     };
// }