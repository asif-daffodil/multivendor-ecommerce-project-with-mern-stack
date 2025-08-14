const upload = require('../middleware/uploadImage');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const addUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User added successfully", user });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "Error adding user", error });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const name = req.body.name ?? null;
    const email = req.body.email ?? null;
    const password = req.body.password ?? null;
    try {
        // check user is available or not
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // update user details
        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }
        if (password) {
            user.password = bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
};

const updateUserProfilePicture = async (req, res) => {
    const { id } = req.params;
    req.folderName = 'profile_pictures';
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        upload.single('profilePicture')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: "Error uploading file", error: err.message });
            } else {
                // delete previous file if the file name is not profile_picture/default.jpg
                const previousFile = user.profilePicture;
                if (previousFile && previousFile !== 'profile_pictures/default.jpg') {
                    fs.unlinkSync(path.join('public', previousFile));
                }
            }
            user.profilePicture = path.join(req.folderName, req.file.filename);
            await user.save();
            res.status(200).json({ message: "Profile picture updated successfully", user });
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile picture", error });
    }
};

module.exports = {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser,
    updateUserProfilePicture
};