const port = process.env.PORT || 5000;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.get('/', (req, res) => {
    res.status(200).send({ message: 'health check: api is up and running' });
});

const corsOptions = {
    origin: 'https://pm-pej33.firebaseapp.com',
    optionsSuccessStatus: 200
}
app.get('/secure', cors(corsOptions), (req, res) => {
    res.status(200).send({ message: 'secure route' });
});

const routes = require('./api_routes/routes');
routes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
