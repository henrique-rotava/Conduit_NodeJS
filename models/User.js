const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Article = require('./Article');
const Comment = require('./Comments');

const User = sequelize.define(
    'User',
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
);

User.hasMany(Article, {
    onDelete: 'CASCADE'
});
Article.belongsTo(User);

User.belongsToMany(User, {
    through: 'Followers',
    as: 'followers',
    timestamps: false
});

User.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(User);

User.belongsToMany(Article, { through: 'Favourites', timestamps: false });
Article.belongsToMany(User, { through: 'Favourites', timestamps: false });

module.exports = User;
