require('dotenv').config();
const port = process.env.PORT || 5000;
const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./api_routes/routes');

app.use(helmet);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
    res.status(200).send({ message: 'health check: api is up and running' });
});

routes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
