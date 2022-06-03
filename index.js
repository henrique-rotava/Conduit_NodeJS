const app = require('./app');
const startDatabase = require('./database/startDatabase');

const PORT = process.env.PORT || 8080;

startDatabase();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:8080`);
});
