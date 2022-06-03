const User = require('../models/User');
const { APIError } = require('../utils/error');

module.exports.follow = async (req, res, next) => {
    try {
        const name = req.params.username;
        const userToFollow = await User.findOne({
            where: {
                username: name
            }
        });

        if (!userToFollow) {
            throw new APIError(404, 'User with this username not found');
        }

        const user = await User.findByPk(req.user.email);

        await userToFollow.addFollowers(user);
        const profile = {
            username: name,
            bio: userToFollow.dataValues.bio,
            image: userToFollow.dataValues.image,
            following: true
        };
        res.status(200).json({ profile });
    } catch (e) {
        next(e);
    }
};

module.exports.unfollow = async (req, res, next) => {
    try {
        const name = req.params.username;
        const userToFollow = await User.findOne({
            where: {
                username: name
            }
        });

        if (!userToFollow) {
            throw new APIError(404, 'User with this username not found');
        }

        const user = await User.findByPk(req.user.email);

        await userToFollow.removeFollowers(user);
        const profile = {
            username: name,
            bio: userToFollow.dataValues.bio,
            image: userToFollow.dataValues.image,
            following: false
        };
        res.status(200).json({ profile });
    } catch (e) {
        next(e);
    }
};

module.exports.getFollowers = async (req, res, next) => {
    try {
        const name = req.params.username;
        const userToFollow = await User.findOne({
            where: {
                username: name
            },
            include: ['followers']
        });

        if (!userToFollow) {
            throw new APIError(404, 'User with this username not found');
        }

        let followingUser = false;
        if (req.user) {
            for (let t of userToFollow.followers) {
                if (t.dataValues.email === req.user.email) {
                    followingUser = true;
                    break;
                }
            }
        }

        const profile = {
            username: name,
            bio: userToFollow.dataValues.bio,
            image: userToFollow.dataValues.image,
            following: followingUser
        };
        res.status(200).json({ profile });
    } catch (e) {
        next(e);
    }
};
