import { RequestHandler, Router } from "express";

import { UserController } from "./user.controller";
import { protect, restrictTo } from "../auth/auth.middleware";
import { validateDto } from "../../utils/validateDto";
import { UpdateUserDto } from "./users.dto";
const userController = new UserController();
const userRouter = Router();


// User Profile
userRouter.get("/me", protect, userController.getMe);
userRouter.patch("/update-me", protect,validateDto(UpdateUserDto), userController.updateMe);
userRouter.delete("/delete-me", protect, userController.deleteMe);

// Admin Routes
// userRouter.get("", protect, restrictTo("admin"), userController.getAllUsers);
// userRouter.get("/:id", protect, restrictTo("admin"), userController.getUserById);
// userRouter.delete("/:id", protect, restrictTo("admin"), userController.deleteUserById);
// userRouter.patch("/:id", protect, restrictTo("admin"),validateDto(UpdateUserDto), userController.updateUserById);

export {  userRouter };
