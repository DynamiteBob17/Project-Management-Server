const pool = require('../database/pgPoolInit');
const testDbRoutes = require('./testDbRoutes');
const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');

module.exports = function (app) {
    // testDbRoutes(app, pool);
    authRoutes(app, pool);
    projectRoutes(app, pool);
    taskRoutes(app, pool);
}
