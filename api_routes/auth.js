require('dotenv').config();
const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
    try {
        const currUserId = await request.headers.authorization.split(" ")[0];
        const token = await request.headers.authorization.split(" ")[1];
        const user = jwt.verify(token, process.env.JWT_SECRET);
        user.user_id = parseInt(user.user_id);

        if (parseInt(currUserId) !== user.user_id) {
            throw "Invalid user ID";
        }

        request.user = user;
        next();
    } catch (error) {
        response.status(401).json({
            error: new Error("Invalid request!"),
        });
    }
};
