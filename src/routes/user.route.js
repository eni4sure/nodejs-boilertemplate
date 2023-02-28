const { role } = require("../config");
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");
const AuthCtrl = require("../controllers/auth.controller");
const UserCtrl = require("../controllers/user.controller");

/**
 * @apiVersion 0.1.0
 * @api {post} /users/ 1. Create user
 * @apiPermission admin
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiBody {string} firstName The user first name.
 * @apiBody {string} lastName The user last name.
 * @apiBody {string} email The user unique email.
 * @apiBody {string} password The user password.
 * @apiBody {string} [role The=user] user role. only admin can create an new admin user role.
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "id": "5d9f1140f10a81216cfd4408",
 *      "firstname": "John",
 *      "lastname": "Doe",
 *      "email": "email@gmail.com",
 *      "role": "user", // default role is user unless admin creates a new admin user
 *      "createdAt": "2019-10-08T13:25:36.000Z",
 *      "updatedAt": "2019-10-08T13:25:36.000Z"
 *  }
 */
router.post("/", auth(role.ADMIN), upload("image"), UserCtrl.create);

/**
 * @apiVersion 0.1.0
 * @api {get} /users/ 2. Get all users
 * @apiPermission admin
 * @apiName GetAllUsers
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *  [
 *      {
 *          "id": "5d9f1140f10a81216cfd4408",
 *          "firstname": "John",
 *          "lastname": "Doe",
 *          "email": "email@gmail.com",
 *          "role": "user",
 *          "createdAt": "2019-10-08T13:25:36.000Z",
 *          "updatedAt": "2019-10-08T13:25:36.000Z",
 *          // ...
 *      }
 *      // ...
 *  ]
 */
router.get("/", auth(role.ADMIN), UserCtrl.getAll);

/**
 * @apiVersion 0.1.0
 * @api {get} /users/me 3. Get logged-in user info
 * @apiPermission user
 * @apiName GetCurrentUser
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "id": "5d9f1140f10a81216cfd4408",
 *      "firstname": "John",
 *      "lastname": "Doe",
 *      "email": "email@gmail.com",
 *      "role": "user",
 *      "createdAt": "2019-10-08T13:25:36.000Z",
 *      "updatedAt": "2019-10-08T13:25:36.000Z"
 *  }
 */
router.get("/me", auth(role.USER), UserCtrl.getMe);

/**
 * @apiVersion 0.1.0
 * @api {get} /users/:userId 4. Get a user info
 * @apiPermission admin
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {string} userId The User ID.
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "id": "5d9f1140f10a81216cfd4408",
 *      "firstname": "John",
 *      "lastname": "Doe",
 *      "email": "email@gmail.com",
 *      "role": "user",
 *      "createdAt": "2019-10-08T13:25:36.000Z",
 *      "updatedAt": "2019-10-08T13:25:36.000Z"
 *  }
 */
router.get("/:userId", auth(role.ADMIN), UserCtrl.getOne);

/**
 * @apiVersion 0.1.0
 * @api {patch} /users/update-password 5. Update user password
 * @apiPermission user
 * @apiName UpdateUserPassword
 * @apiGroup User
 *
 * @apiBody {string} currentPassword The user old password.
 * @apiBody {string} newPassword The user new password.
 *
 * @apiSuccessExample {json} Success-Response:
 *  null
 */
router.patch("/update-password", auth(role.USER), AuthCtrl.updatePassword);

/**
 * @apiVersion 0.1.0
 * @api {patch} /users/update-profile 6. Update user profile
 * @apiPermission user
 * @apiName UpdateUserProfile
 * @apiGroup User
 *
 * @apiBody {string} [firstName] The user first name.
 * @apiBody {string} [lastName] The user last name.
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "id": "5d9f1140f10a81216cfd4408",
 *      "firstname": "John", // updated
 *      "lastname": "Doe", // updated
 *      "email": "email@gmail.com",
 *      "role": "user",
 *      "createdAt": "2019-10-08T13:25:36.000Z",
 *      "updatedAt": "2019-10-08T13:25:36.000Z"
 *  }
 */
router.patch("/update-profile", auth(role.USER), upload("image"), UserCtrl.updateUserProfile);

/**
 * @apiIgnore Not to be used directly
 * 
 * @apiVersion 0.1.0
 * @api {patch} /users/:userId 7. Update user info
 * @apiPermission admin
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {string} userId The User ID.
 */
router.put("/:userId", auth(role.ADMIN), upload("image"), UserCtrl.update);

/**
 * @apiIgnore Not to be used
 *
 * @apiVersion 0.1.0
 * @api {delete} /users/:userid 8. Delete user
 * @apiPermission admin
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {string} userId The User ID.
 */
router.delete("/:userId", auth(role.ADMIN), UserCtrl.delete);

module.exports = router;
