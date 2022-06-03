const User = require('../models/User');
const { hashPassword, matchPassword } = require('../utils/password');
const { sign } = require('../utils/jwt');
const { APIError } = require('../utils/error');

module.exports.createUser = async (req, res, next) => {
    try {
        if (!req.body.user.username) throw new APIError(422, 'Username is Required');
        if (!req.body.user.email) throw new APIError(422, 'Email is Required');
        if (!req.body.user.password) throw new APIError(422, 'Password is Required');

        const existingUser = await User.findByPk(req.body.user.email);
        if (existingUser) throw new APIError(422, 'User aldready exists with this email id');

        const password = await hashPassword(req.body.user.password);
        const user = await User.create({
            username: req.body.user.username,
            password: password,
            email: req.body.user.email
        });

        if (user) {
            if (user.dataValues.password) delete user.dataValues.password;
            user.dataValues.token = await sign(user);
            user.dataValues.bio = null;
            user.dataValues.image = null;
            res.status(201).json({ user });
        }
    } catch (e) {
        next(e);
    }
};

module.exports.loginUser = async (req, res, next) => {
    try {
        if (!req.body.user.email) throw new APIError(422, 'Email is Required');
        if (!req.body.user.password) throw new APIError(422, 'Password is Required');

        const user = await User.findByPk(req.body.user.email);

        if (!user) {
            throw new APIError(401, 'No User with this email id');
        }

        //Check if password matches
        const passwordMatch = await matchPassword(user.password, req.body.user.password);

        if (!passwordMatch) {
            throw new APIError(401, 'Invalid password or email id');
        }

        delete user.dataValues.password;
        user.dataValues.token = await sign({
            email: user.dataValues.email,
            username: user.dataValues.username
        });

        res.status(200).json({ user });
    } catch (e) {
        next(e);
    }
};

module.exports.getUserByEmail = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.email);
        if (!user) {
            throw new APIError(404, 'No such user found');
        }
        delete user.dataValues.password;
        user.dataValues.token = req.header('Authorization').split(' ')[1];
        return res.status(200).json({ user });
    } catch (e) {
        next(e);
    }
};

module.exports.updateUserDetails = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.email);

        if (!user) {
            throw new APIError(401, 'No user with this email id');
        }

        if (req.body.user) {
            const username = req.body.user.username ? req.body.user.username : user.username;
            const bio = req.body.user.bio ? req.body.user.bio : user.bio;
            const image = req.body.user.image ? req.body.user.image : user.image;
            let password = user.password;
            if (req.body.user.password) password = await hashPassword(req.body.user.password);

            const updatedUser = await user.update({ username, bio, image, password });
            delete updatedUser.dataValues.password;
            updatedUser.dataValues.token = req.header('Authorization').split(' ')[1];
            res.json(updatedUser);
        } else {
            delete user.dataValues.password;
            user.dataValues.token = req.header('Authorization').split(' ')[1];
            res.json(user);
        }
    } catch (e) {
        next(e);
    }
};
