const Tag = require('../models/Tag');

module.exports.getAllTags = async (req, res, next) => {
    try {
        const getTags = await Tag.findAll();
        const tags = [];
        if (getTags)
            for (let tag of getTags) {
                tags.push(tag.dataValues.name);
            }
        res.status(200).json({ tags });
    } catch (e) {
        next(e);
    }
};
