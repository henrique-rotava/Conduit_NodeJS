const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const userRoute = require('./routes/users');
const articleRoute = require('./routes/articles');
const commentRoute = require('./routes/comments');
const tagRoute = require('./routes/tags');
const profileRoute = require('./routes/profile');
const favouriteRoute = require('./routes/favourites');

const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(morgan('tiny'));

app.get('/', (req, res) => {
    res.json({ status: 'API is running' });
});
app.use('/api', userRoute);
app.use('/api/articles', articleRoute);
app.use('/api/articles', commentRoute);
app.use('/api/tags', tagRoute);
app.use('/api/profiles', profileRoute);
app.use('/api/articles', favouriteRoute);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
