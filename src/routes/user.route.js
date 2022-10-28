const { role } = require("../config");
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");
const AuthCtrl = require("../controllers/auth.controller");
const UserCtrl = require("../controllers/user.controller");

router.post("/", auth(role.ADMIN), upload("image"), UserCtrl.create);

router.get("/", auth(role.ADMIN), UserCtrl.getAll);

router.get("/me", auth(role.USER), UserCtrl.getMe);

router.get("/:userId", auth(role.ADMIN), UserCtrl.getOne);

router.patch("/update-password", auth(role.USER), AuthCtrl.updatePassword);

router.patch("/update-profile", auth(role.USER), upload("image"), UserCtrl.updateUserProfile);

router.put("/:userId", auth(role.ADMIN), upload("image"), UserCtrl.update);

router.delete("/:userId", auth(role.ADMIN), UserCtrl.delete);

module.exports = router;
