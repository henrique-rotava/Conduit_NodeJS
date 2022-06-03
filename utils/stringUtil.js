module.exports.slugify = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/--{1,}/g, '-');
};
