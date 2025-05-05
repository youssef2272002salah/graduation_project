import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
  toEmail: string;
  subject: string;
  htmlContent: string;
}

class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ toEmail, subject, htmlContent }: EmailOptions): Promise<void> {
    const mailOptions = {
      from: "careerc.me <no-reply@gradproject.com>",
      to: toEmail,
      subject,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to: ${toEmail}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  }

  generateVerificationEmail(toEmail: string, verificationLink: string): EmailOptions {
    return {
      toEmail,
      subject: "تأكيد البريد الإلكتروني من CareerC",
      htmlContent: `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تأكيد البريد الإلكتروني</title>
            <style>
                body {
                    background: linear-gradient(to bottom, #8b919e, #3487f3);
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: white;
                    direction: rtl;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    text-align: center;
                }
                .card {
                    background: white;
                    color: #333;
                    border-radius: 8px;
                    padding: 30px 20px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                h1 {
                    font-size: 28px;
                    color: #2563eb;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                a.button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                }
                .footer {
                    font-size: 12px;
                    color: #ddd;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <h1>مرحبًا بك في CareerC</h1>
                    <p>اضغط على الزر التالي لتأكيد بريدك الإلكتروني والاستفادة من خدمات المنصة.</p>
                    <a href="${verificationLink}" class="button">تأكيد البريد الإلكتروني</a>
                    <p>إذا لم تقم بالتسجيل، يمكنك تجاهل هذه الرسالة.</p>
                </div>
                <div class="footer">
                    &copy; 2025 CareerC. جميع الحقوق محفوظة.
                </div>
            </div>
        </body>
        </html>
      `
    };
  }
  
  generateResetPasswordEmail(toEmail: string, resetToken: string): EmailOptions {
    return {
      toEmail,
      subject: "إعادة تعيين كلمة المرور - CareerC",
      htmlContent: `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>إعادة تعيين كلمة المرور</title>
            <style>
                body {
                    background: linear-gradient(to bottom, #8b919e, #3487f3);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    direction: rtl;
                }
                .container {
                    background: #fff;
                    padding: 30px 20px;
                    border-radius: 8px;
                    max-width: 600px;
                    margin: 40px auto;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    text-align: center;
                }
                h1 {
                    color: #e53935;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                .token-box {
                    font-size: 20px;
                    font-weight: bold;
                    background: #f0f0f0;
                    padding: 12px 24px;
                    border-radius: 6px;
                    display: inline-block;
                    margin: 20px 0;
                    direction: ltr;
                }
                p {
                    font-size: 16px;
                    margin-bottom: 12px;
                }
                .footer {
                    font-size: 12px;
                    color: #ccc;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>إعادة تعيين كلمة المرور</h1>
                <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك في CareerC.</p>
                <p>استخدم الرمز التالي لإتمام العملية:</p>
                <div class="token-box">${resetToken}</div>
                <p>يرجى نسخ هذا الرمز واستخدامه في نموذج إعادة تعيين كلمة المرور.</p>
                <p>إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.</p>
                <div class="footer">
                    &copy; 2025 CareerC. جميع الحقوق محفوظة.
                </div>
            </div>
        </body>
        </html>
      `
    };
  }
  

}
 
export default new MailService();
