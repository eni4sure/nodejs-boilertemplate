const response = require("../utils/response");
const UserService = require("../services/user.service");

class UserContoller {
    async create(req, res) {
        const result = await UserService.create(req.body);
        res.status(200).send(response("User created", result));
    }

    async getAll(req, res) {
        const result = await UserService.getAll();
        res.status(200).send(response("all users", result));
    }

    async getMe(req, res) {
        const result = await UserService.getMe(req.$user._id);
        res.status(200).send(response("user data", result));
    }

    async getOne(req, res) {
        const result = await UserService.getOne(req.params.userId);
        res.status(200).send(response("user data", result));
    }

    async updateUserProfile(req, res) {
        const result = await UserService.updateUserProfile(req.body, req.$user._id);
        res.status(200).send(response("profile updated", result));
    }

    async update(req, res) {
        const result = await UserService.update(req.params.userId, req.body);
        res.status(200).send(response("user updated", result));
    }

    async delete(req, res) {
        const result = await UserService.delete(req.params.userId);
        res.status(200).send(response("user deleted", result));
    }
}

module.exports = new UserContoller();
