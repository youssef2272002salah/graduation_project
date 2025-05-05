import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AuthService } from "./auth.service";
import { LoginDto, ResetPasswordDto, SignupDto } from "./auth.dto";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest.interface";

const authService = new AuthService();

export class AuthController {
  signup = expressAsyncHandler(async (req: Request, res: Response) => {
    console.log("req.body", req.body);
    const user = await authService.signup(req.body as SignupDto, res);
    // res.status(201).json({
    //   status: "success",
    //   message: "Signup successful! Please verify your email.",
    //   data: user,
    // });
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
  
    res.send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>تم التحقق من البريد الإلكتروني</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(to bottom, #8b919e, #3487f3);
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
          }
          .container {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 40px 24px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            max-width: 500px;
            width: 90%;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 20px;
          }
          p {
            font-size: 1.1rem;
            margin-bottom: 30px;
          }
          a.button {
            display: inline-block;
            background-color: #2563eb;
            color: #fff;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            transition: background-color 0.3s ease;
          }
          a.button:hover {
            background-color: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>تم التحقق من بريدك الإلكتروني بنجاح</h1>
          <p>يمكنك الآن الانتقال إلى الموقع لمتابعة استخدام CareerC.</p>
          <a class="button" href="https://careerc.me">الذهاب إلى الموقع</a>
        </div>
      </body>
      </html>
    `);
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
