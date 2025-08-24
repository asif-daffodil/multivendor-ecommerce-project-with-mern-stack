const jwt = require('jsonwebtoken');
const User = require('../model/user'); // Assuming you have a User model defined

const matchJWTwithId = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const paramsId = req.params.id;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user._id.toString() !== paramsId) {
            return res.status(403).json({ message: "Forbidden: User ID does not match token" });
        }
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Decode without verifying to get the user ID
            const decoded = jwt.decode(token);
            if (!decoded) {
                return res.status(401).json({ message: "Invalid token" });
            }

            // Generate new token
            const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

            // Attach user & continue
            req.user = await User.findById(decoded.id);
            res.setHeader('Authorization', `Bearer ${newToken}`);
            next();
            return;
        }
        return res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = matchJWTwithId;