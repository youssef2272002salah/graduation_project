import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AuthService } from "./auth.service";
import { LoginDto, ResetPasswordDto, SignupDto } from "./auth.dto";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest.interface";

const authService = new AuthService();

export class AuthController {
  signup = expressAsyncHandler(async (req: Request, res: Response) => {
    const user = await authService.signup(req.body as SignupDto, res);
    res.status(201).json({
      status: "success",
      message: "Signup successful! Please verify your email.",
      data: user,
    });
  });

  login = expressAsyncHandler(async (req: Request, res: Response) => {
    const user = await authService.login(req.body as LoginDto, res);
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: user,
    });
  });

  logout = expressAsyncHandler(async (req: Request, res: Response) => {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ message: "Logout successful" });
  });

  verifyEmail = expressAsyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    await authService.verifyEmail(token);
    res.status(200).json({ message: "Email verified successfully" });
  });

  resendVerificationEmail = expressAsyncHandler(async (req: Request, res: Response) => {
    await authService.resendVerificationEmail(req.body.email);
    res.status(200).json({ message: "Verification email sent successfully" });
  });

  forgotPassword = expressAsyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json({ status: "success", data: result });
  });

  resetPassword = expressAsyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body as ResetPasswordDto, res);
    res.status(200).json({ status: "success", data: result });
  });

  // todo : promise<any> should be replaced with a proper type
  updatePassword = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await authService.updatePassword(user.id, req.body, res);
    res.status(200).json({ status: "success", data: result });
  });
}
