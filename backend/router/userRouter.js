const express = require('express');
const router = express.Router();
const { addUser, getAllUsers, updateUser, deleteUser, updateUserProfilePicture, getUserById } = require('../controller/userController');
const { checkAdmin, checkAuth } = require('../middleware/checkAuth');
const matchJWTwithId = require('../middleware/matchJWTwithId');

router.post("/add", checkAdmin, addUser);
router.get("/all", checkAdmin, getAllUsers);
router.get("/:id", matchJWTwithId, getUserById);
router.put("/update/:id", matchJWTwithId, updateUser);
router.delete("/delete/:id", matchJWTwithId, deleteUser);
router.patch("/profile-picture/:id", matchJWTwithId, updateUserProfilePicture);

module.exports = router;