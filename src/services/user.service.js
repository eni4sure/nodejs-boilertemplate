const User = require("./../models/user.model");
const CustomError = require("./../utils/custom-error");

class UserService {
    async create(data) {
        if (!data.firstName) throw new CustomError("first name is required");
        if (!data.lastName) throw new CustomError("last name is required");
        if (!data.email) throw new CustomError("email is required");
        if (!data.password) throw new CustomError("password is required");

        const user = await User.findOne({ email: data.email });
        if (user) throw new CustomError("email already exists");

        const context = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: "user"
        };

        return await new User(context).save();
    }

    async getAll() {
        return await User.find({ role: { $ne: "admin" } });
    }

    async getMe(userId) {
        return await this.getOne(userId);
    }

    async getOne(userId) {
        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("user does not exist", 404);

        return user;
    }

    async getOneByEmail(email) {
        const user = await User.findOne({ email });
        if (!user) throw new CustomError("user does not exist", 404);

        return user;
    }

    async updateUserProfile(data, userId) {
        if (!data.firstName) throw new CustomError("first name is required");
        if (!data.lastName) throw new CustomError("last name is required");

        const context = {
            firstName: data.firstName,
            lastName: data.lastName
        };

        return await this.update(userId, context);
    }

    async update(userId, data) {
        const user = await User.findByIdAndUpdate({ _id: userId }, { $set: data }, { new: true });
        if (!user) throw new CustomError("user does not exist", 404);

        return user;
    }

    async delete(userId) {
        const user = await User.findOne({ _id: userId });
        user.remove();
        return user;
    }
}

module.exports = new UserService();
