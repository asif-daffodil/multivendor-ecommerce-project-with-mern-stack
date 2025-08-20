const express = require('express');
const router = express.Router();
const { addUser, getAllUsers, updateUser, deleteUser, updateUserProfilePicture, getUserById, changePassword } = require('../controller/userController');
const { banUser, unbanUser } = require('../controller/userController');
const { checkAdmin, checkAuth } = require('../middleware/checkAuth');
const matchJWTwithId = require('../middleware/matchJWTwithId');

router.post("/add", checkAdmin, addUser);
router.get("/all", checkAdmin, getAllUsers);
router.patch('/ban/:id', checkAdmin, banUser);
router.patch('/unban/:id', checkAdmin, unbanUser);
router.get("/:id", matchJWTwithId, getUserById);
router.put("/update/:id", matchJWTwithId, updateUser);
router.delete("/delete/:id", matchJWTwithId, deleteUser);
router.patch("/profile-picture/:id", matchJWTwithId, updateUserProfilePicture);
// change password: users can change their own password (must provide currentPassword), admins can change any user's password without currentPassword
router.post("/change-password/:id", matchJWTwithId, changePassword);
router.post("/admin/change-password/:id", checkAdmin, changePassword);

module.exports = router;