import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import {AppError} from "./appError";

export const validateDto = (DtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(DtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      return next(new AppError(errors.map(e => Object.values(e.constraints || {})).flat(), 400));
    }

    req.body = dtoInstance; // Override with validated DTO instance
    next();
  };
};
