export class AppError extends Error {
    public statusCode: number;
    public status: "fail" | "error";
    public isOperational: boolean;
  
    constructor(message: string | object, statusCode: number = 500) {
      const formattedMessage = typeof message === "object" ? JSON.stringify(message) : message;
      super(formattedMessage);
  
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  