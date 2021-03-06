const router = require("express").Router();
const { otpMailer, checkToken } = require("../../auth");
const {
  createUser,
  login,
  getUserByUserId,
  getUsers,
  updateUsers,
  deleteUser
} = require("./controller");


router.get("/", checkToken, getUsers);
router.post("/hi", createUser); 
router.post("/login", login);

router.get("/:id", checkToken, getUserByUserId);

router.patch("/", checkToken, updateUsers);
router.delete("/", checkToken, deleteUser);

module.exports = router;

/*mark*/
