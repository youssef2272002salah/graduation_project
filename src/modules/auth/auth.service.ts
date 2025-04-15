import crypto from 'crypto';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel, IUser } from '../users/user.model';
import MailService from "../../utils/mailer";
import { LoginDto, SignupDto, ResetPasswordDto } from '../auth/auth.dto';
import {AppError} from '../../utils/appError';
import { Response } from "express";

export class AuthService {


 createSendToken(user: IUser, res: Response) {
    const token = this.signToken(user._id.toString(), user.fullname);

    // Set cookie options
    const cookieOptions = {
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === "production", // Only HTTPS in production
        sameSite: 'strict' as const, // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    // Set token in cookies
    res.cookie("jwt", token, cookieOptions);

return res.status(200).json({
        status: "success",
        token,
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
        },
    });
}


     signToken(id: string,fullname: string): string {
      console.log("Signing JWT with secret:", process.env.JWT_SECRET);
      return jwt.sign({ id, fullname }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN as string, 10000) || "100000d", 
      });
    }

  async signup(userDto: SignupDto, res: Response) {
    // const hashedPassword = await this.hashPassword(userDto.password);
    
    const newUser = await UserModel.create({
      ...userDto,
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    newUser.verificationToken = verificationToken;
    await newUser.save({ validateBeforeSave: false });

    // Send verification email
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
    const emailData = MailService.generateVerificationEmail(newUser.email, verificationLink);
    await MailService.sendEmail(emailData);
    return this.createSendToken(newUser,res);
  }

  async login({ email, password }: LoginDto , res: Response) {
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      // Resend verification email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      await user.save({ validateBeforeSave: false });

      const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
      const emailData = MailService.generateVerificationEmail(user.email, verificationLink);
      await MailService.sendEmail(emailData);
      
      throw new AppError('Email not verified. Verification email sent', 401);
  }

    return this.createSendToken(user,res);
  }

  async logout(): Promise<void> {
    // Logout logic is simple in a stateless JWT system
  }

  async verifyEmail(token: string) {
    const user = await UserModel.findOne({ verificationToken: token });
    if (!user) throw new AppError('Invalid verification token', 400);

    user.verificationToken = undefined;
    user.isVerified = true;
    await user.save();

    return { message: 'Email successfully verified' };
  }


    async resendVerificationEmail(email: string) {
        const user = await UserModel.findOne({
          email,
          isVerified: false,
        });

        if (!user) {
          throw new AppError('User not found or already verified', 404);
        }
    
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save({ validateBeforeSave: false });
    
        // Send verification email
        const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
        const emailData = MailService.generateVerificationEmail(user.email, verificationLink);
        await MailService.sendEmail(emailData);
            }

      async forgotPassword(email: string) {
        const user = await UserModel.findOne({ email });
        if (!user) throw new AppError('User not found', 404);
    
        const resetToken = crypto.randomBytes(8).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
    
        const emailData = MailService.generateResetPasswordEmail(user.email, resetToken);
        await MailService.sendEmail(emailData);   
             return { message: 'Password reset token sent' };
      }
    
      async resetPassword(dto: ResetPasswordDto, res: Response) {
        const hashedToken = crypto.createHash('sha256').update(dto.resetToken).digest('hex');
        const user = await UserModel.findOne({
          passwordResetToken: hashedToken,
          passwordResetExpires: { $gt: new Date() },
        });
    
        if (!user) throw new AppError('Invalid or expired reset token', 400);
    
        user.password = dto.password;
        user.passwordConfirm = dto.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
    
        return this.createSendToken(user,res);
      }
    

      async updatePassword(userId: string, dto: ResetPasswordDto, res: Response) {
        const user = await UserModel.findById(userId).select('+password');
        if (!user) throw new AppError('User not found', 404);
    
        if (!user.password || !(await bcrypt.compare(dto.password, user.password)))
          throw new AppError('Incorrect current password', 400);
    
        user.password = dto.password;
        user.passwordConfirm = dto.passwordConfirm;
        await user.save();
    
        return this.createSendToken(user,res);
      }
}
