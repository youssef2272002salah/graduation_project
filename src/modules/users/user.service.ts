import { AppError } from "../../utils/appError";
import { UserModel } from "./user.model";
import { log } from "../../utils/logging";

export class UserService {
    async getUserById(id: string) {
        const user = await UserModel.findById(id);
        if (!user) {
            log("warn", "User not found in DB", { userId: id });
            throw new AppError("User not found", 404);
        }

        log("info", "User retrieved from DB", { userId: id });
        return user;
    }

    async updateUser(id: string, update: any) {
        const user = await UserModel.findByIdAndUpdate(id, update, { new: true });
        if (!user) {
            log("warn", "User not found for update", { userId: id });
            throw new AppError("User not found", 404);
        }

        log("info", "User updated in DB", { userId: id, update });
        return user;
    }

    async deleteUser(id: string) {
        const user = await UserModel.findByIdAndDelete(id);
        if (!user) {
            log("warn", "User not found for deletion", { userId: id });
            throw new AppError("User not found", 404);
        }

        log("info", "User deleted from DB", { userId: id });
        return user;
    }
}