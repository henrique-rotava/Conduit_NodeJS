const Article = require('../models/Article');
const User = require('../models/User');
const Tag = require('../models/Tag');
const { slugify } = require('../utils/stringUtil');
const sequelize = require('../database');
const { QueryTypes } = require('sequelize');
const { APIError } = require('../utils/error');

function sanitizeOutput(article, user) {
    const newTagList = [];
    for (let t of article.dataValues.Tags) {
        newTagList.push(t.name);
    }
    delete article.dataValues.Tags;
    article.dataValues.tagList = newTagList;

    if (article) {
        delete user.dataValues.password;
        delete user.dataValues.email;
        delete user.dataValues.following;
        article.dataValues.author = user;
        return article;
    }
}

function sanitizeOutputMultiple(article) {
    const newTagList = [];
    for (let t of article.dataValues.Tags) {
        newTagList.push(t.name);
    }
    delete article.dataValues.Tags;
    article.dataValues.tagList = newTagList;

    let user = {
        username: article.dataValues.User.username,
        email: article.dataValues.User.email,
        bio: article.dataValues.User.bio,
        image: article.dataValues.User.image
    };

    delete article.dataValues.User;
    article.dataValues.author = user;

    return article;
}

module.exports.createArticle = async (req, res, next) => {
    try {
        const data = req.body.article;
        if (!data) throw new APIError(422, 'No articles data');
        if (!data.title) throw new APIError(422, 'Article title is required');
        if (!data.body) throw new APIError(422, 'Article body is required');
        if (!data.description) throw new APIError(422, 'Article description is required');

        //Find out author object
        const user = await User.findByPk(req.user.email);
        if (!user) throw new Error('User does not exist');
        const slug = slugify(data.title);
        let article = await Article.create({
            slug: slug,
            title: data.title,
            description: data.description,
            body: data.body,
            isMatureContent: data.isMatureContent,
            UserEmail: user.email
        });

        if (data.tagList) {
            for (let t of data.tagList) {
                let tagExists = await Tag.findByPk(t);
                let newTag;
                if (!tagExists) {
                    newTag = await Tag.create({ name: t });
                    await article.addTag(newTag);
                } else {
                    await article.addTag(tagExists);
                }
            }
        }

        article = await Article.findByPk(slug, { include: Tag });
        article = sanitizeOutput(article, user);
        res.status(201).json({ article });
    } catch (e) {
        next(e);
    }
};

module.exports.getSingleArticleBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        let article = await Article.findByPk(slug, { include: Tag });
        if (!article) {
            throw new APIError(404, 'Article not found');
        }

        const user = await article.getUser();

        article = sanitizeOutput(article, user);

        res.status(200).json({ article });
    } catch (e) {
        next(e);
    }
};

module.exports.updateArticle = async (req, res, next) => {
    try {
        if (!req.body.article) throw new Error('No articles data');
        const data = req.body.article;
        const slugInfo = req.params.slug;
        let article = await Article.findByPk(slugInfo, { include: Tag });

        if (!article) {
            throw new APIError(404, 'Article not found');
        }

        const user = await User.findByPk(req.user.email);

        if (user.email != article.UserEmail) {
            throw new APIError(403, 'You must be the author to modify this article');
        }

        const title = data.title ? data.title : article.title;
        const description = data.description ? data.description : article.description;
        const body = data.body ? data.body : article.body;
        const slug = data.title ? slugify(title) : slugInfo;
        const isMatureContent = data.isMatureContent ?? article.isMatureContent;

        const updatedArticle = await article.update({
            slug,
            title,
            description,
            body,
            isMatureContent
        });

        article = sanitizeOutput(updatedArticle, user);
        res.status(200).json({ article });
    } catch (e) {
        next(e);
    }
};

module.exports.deleteArticle = async (req, res, next) => {
    try {
        const slugInfo = req.params.slug;
        let article = await Article.findByPk(slugInfo, { include: Tag });

        if (!article) {
            throw new APIError(404, 'Article not found');
        }

        const user = await User.findByPk(req.user.email);

        if (user.email != article.UserEmail) {
            throw new APIError(403, 'You must be the author to modify this article');
        }

        await Article.destroy({ where: { slug: slugInfo } });
        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (e) {
        next(e);
    }
};

module.exports.getAllArticles = async (req, res, next) => {
    try {
        //Get all articles:
        const { tag, author, limit = 20, offset = 0 } = req.query;
        let article;
        if (!author && tag) {
            article = await Article.findAll({
                include: [
                    {
                        model: Tag,
                        attributes: ['name'],
                        where: { name: tag }
                    },
                    {
                        model: User,
                        attributes: ['email', 'username', 'bio', 'image']
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } else if (author && !tag) {
            article = await Article.findAll({
                include: [
                    {
                        model: Tag,
                        attributes: ['name']
                    },
                    {
                        model: User,
                        attributes: ['email', 'username', 'bio', 'image'],
                        where: { username: author }
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } else if (author && tag) {
            article = await Article.findAll({
                include: [
                    {
                        model: Tag,
                        attributes: ['name'],
                        where: { name: tag }
                    },
                    {
                        model: User,
                        attributes: ['email', 'username', 'bio', 'image'],
                        where: { username: author }
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } else {
            article = await Article.findAll({
                include: [
                    {
                        model: Tag,
                        attributes: ['name']
                    },
                    {
                        model: User,
                        attributes: ['email', 'username', 'bio', 'image']
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        }
        let articles = article.map(sanitizeOutputMultiple);
        res.json({ articles });
    } catch (e) {
        next(e);
    }
};

module.exports.getMatureNews = async (req, res, next) => {
    try {
        const articles = await Article.findAll({
            where: { isMatureContent: true },
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.json({ articles });
    } catch (e) {
        next(e);
    }
};

module.exports.getFeed = async (req, res, next) => {
    try {
        const query = `
            SELECT UserEmail
            FROM followers
            WHERE followerEmail = :email`;
        const followingUsers = await sequelize.query(query, {
            replacements: { email: req.user.email },
            type: QueryTypes.SELECT
        });

        if (followingUsers[0].length === 0) {
            return res.json({ articles: [] });
        }

        let followingUserEmail = followingUsers[0].map((follow) => follow.UserEmail);

        let article = await Article.findAll({
            where: {
                UserEmail: followingUserEmail
            },
            include: [Tag, User]
        });

        let articles = article.map(sanitizeOutputMultiple);
        res.json({ articles });
    } catch (e) {
        next(e);
    }
};
