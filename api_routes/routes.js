const pool = require('../database/pgPoolInit');
const testDbRoutes = require('./testDbRoutes');
const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const auth = require('./auth');

module.exports = function (app) {
    // testDbRoutes(app, pool);
    authRoutes(app, pool);
    app.use(auth);
    projectRoutes(app, pool);
    taskRoutes(app, pool);
}
