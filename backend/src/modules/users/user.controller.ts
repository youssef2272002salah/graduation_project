import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { UserService } from "./user.service";
import { AuthenticatedRequest } from "interfaces/AuthenticatedRequest.interface";
import { AppError } from "../../utils/appError";
import {log,logger} from "../../utils/logging";
const userService = new UserService();

export class UserController {
    getMe = expressAsyncHandler(async (req: Request, res: Response) => {
        const user = (req as AuthenticatedRequest).user;
        if (!user) {
            log("warn", "User not found in getMe", { ip: req.ip });
            throw new AppError("User not found", 404);
        }

        const me = await userService.getUserById(user._id);
        log("info", "User profile retrieved", { userId: user._id, ip: req.ip });

        res.status(200).json({
            status: "success",
            data: me,
        });
    });

    updateMe = expressAsyncHandler(async (req: Request, res: Response) => {
        const user = (req as AuthenticatedRequest).user;
        if (!user) {
            log("warn", "User not found in updateMe", { ip: req.ip });
            throw new AppError("User not found", 404);
        }

        const updatedUser = await userService.updateUser(user._id, req.body);
        log("info", "User profile updated", { userId: user._id, ip: req.ip });

        res.status(200).json({
            status: "success",
            data: updatedUser,
        });
    });

    deleteMe = expressAsyncHandler(async (req: Request, res: Response) => {
        const user = (req as AuthenticatedRequest).user;
        if (!user) {
            log("warn", "User not found in deleteMe", { ip: req.ip });
            throw new AppError("User not found", 404);
        }

        await userService.deleteUser(user._id);
        log("info", "User account deleted", { userId: user._id, ip: req.ip });

        res.status(204).json({
            status: "success",
            data: null,
        });
    });
}