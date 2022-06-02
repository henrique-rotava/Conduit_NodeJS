const Article = require('../models/Article');
const User = require('../models/User');
const Comment = require('../models/Comments');
const { APIError } = require('../utils/error');

module.exports.postNewComment = async (req, res, next) => {
    try {
        const slugInfo = req.params.slug;
        const data = req.body.comment;
        //Throw error if no data
        if (!data) {
            throw new APIError(422, 'Comment is required');
        }

        if (!data.body) {
            throw new APIError(422, 'Comment body is required');
        }

        //Find for article
        const article = await Article.findByPk(slugInfo);
        if (!article) {
            throw new APIError(404, 'Article not found');
        }

        //Checking whthter this user has aldready posted a comment
        const existingComment = await Comment.findAll({ where: { UserEmail: req.user.email } });
        if (existingComment.length > 0) {
            throw new Error('You aldready added a review');
        }

        //Create new Comment
        const newComment = await Comment.create({ body: data.body });

        //Find user
        const user = await User.findByPk(req.user.email);

        //assosiations
        user.addComments(newComment);
        article.addComments(newComment);

        //Send output
        newComment.dataValues.author = {
            username: user.dataValues.username,
            bio: user.dataValues.bio,
            image: user.dataValues.image
        };

        res.status(201).json({ newComment });
    } catch (e) {
        next(e);
    }
};

module.exports.getAllComments = async (req, res, next) => {
    try {
        const slugInfo = req.params.slug;

        //Find for article
        const article = await Article.findByPk(slugInfo);
        if (!article) {
            throw new APIError(404, 'Article slug not valid');
        }

        const comments = await Comment.findAll({
            where: {
                ArticleSlug: slugInfo
            },
            include: [
                {
                    model: User,
                    attributes: ['username', 'bio', 'image']
                }
            ]
        });

        res.status(200).json({ comments });
    } catch (e) {
        next(e);
    }
};

module.exports.deleteComment = async (req, res, next) => {
    try {
        const slugInfo = req.params.slug;
        const idInfo = req.params.id;
        //Find for article
        const article = await Article.findByPk(slugInfo);
        if (!article) {
            throw new APIError(404, 'Article not found');
        }

        //Find for comment
        const comment = await Comment.findByPk(idInfo);
        if (!comment) {
            throw new APIError(404, 'Comment not found');
        }

        //Check whether logged in user is the author of that comment
        if (req.user.email != comment.UserEmail) {
            throw new APIError(403, 'You must be the author to modify this comment');
        }

        //Delete comment
        await Comment.destroy({ where: { id: idInfo } });
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (e) {
        next(e);
    }
};
