const router = require("express").Router();
const AuthCtrl = require("../controllers/auth.controller");
const upload = require("../middlewares/multer.middleware");

/**
 * @apiVersion 0.1.0
 * @api {post} /auth/register 1. Register a new user
 * @apiPermission none
 * @apiName Register
 * @apiGroup Authentication
 *
 * @apiBody {string} firstName The user first name.
 * @apiBody {string} lastName The user last name.
 * @apiBody {string} email The user unique email.
 * @apiBody {string} password The user password.
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "token": "auth-token",
 *      "user": {
 *          "id": "5d9f1140f10a81216cfd4408",
 *          "firstname": "John",
 *          "lastname": "Doe",
 *          "email": "email@gmail.com",
 *          "role": "user",
 *          "createdAt": "2019-10-08T13:25:36.000Z",
 *          "updatedAt": "2019-10-08T13:25:36.000Z"
 *     },
 *  }
 */
router.post("/register", upload("image"), AuthCtrl.register);

/**
 * @apiVersion 0.1.0
 * @api {post} /auth/login 2. Login a new user
 * @apiPermission none
 * @apiName Login
 * @apiGroup Authentication
 *
 * @apiBody {string} email The user email.
 * @apiBody {string} password The user password.
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "token": "auth-token",
 *      "user": {
 *          "id": "5d9f1140f10a81216cfd4408",
 *          "firstname": "John",
 *          "lastname": "Doe",
 *          "email": "email@gmail.com",
 *          "role": "user",
 *          "createdAt": "2019-10-08T13:25:36.000Z",
 *          "updatedAt": "2019-10-08T13:25:36.000Z"
 *     },
 *  }
 */
router.post("/login", AuthCtrl.login);

/**
 * @apiVersion 0.1.0
 * @api {post} /auth/verify-email 3. Verify a user email
 * @apiPermission none
 * @apiName VerifyEmail
 * @apiGroup Authentication
 *
 * @apiBody {string} userId The user id.
 * @apiBody {string} verifyToken verification token.
 *
 * @apiSuccessExample {json} Success-Response:
 *  null
 */
router.post("/verify-email", AuthCtrl.verifyEmail);

/**
 * @apiVersion 0.1.0
 * @api {post} /auth/request-email-verification 4. Request a user email verification
 * @apiPermission none
 * @apiName RequestEmailVerification
 * @apiGroup Authentication
 *
 * @apiBody {string} email The user email.
 *
 * @apiSuccessExample {json} Success-Response:
 *  null
 */
router.post("/request-email-verification", AuthCtrl.requestEmailVerification);

/**
 * @apiVersion 0.1.0
 * @api {post} /auth/request-password-reset 5. Request a user password reset
 * @apiPermission none
 * @apiName RequestPasswordReset
 * @apiGroup Authentication
 *
 * @apiBody {string} email The user email.
 *
 * @apiSuccessExample {json} Success-Response:
 *  null
 */
router.post("/request-password-reset", AuthCtrl.requestPasswordReset);

/**
 * @apiVersion 0.1.0
 * @api {post} /auth/reset-password 6. Reset a user password
 * @apiPermission none
 * @apiName ResetPassword
 * @apiGroup Authentication
 *
 * @apiBody {string} userId The user id.
 * @apiBody {string} password The user new password.
 * @apiBody {string} resetToken user reset-password token.
 *
 * @apiSuccessExample {json} Success-Response:
 *  null
 */
router.post("/reset-password", AuthCtrl.resetPassword);

module.exports = router;
