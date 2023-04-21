require('dotenv').config();
const { Pool } = require('pg');

{ /* when initializing a pool with no arguments,
    it will use the default environment variables
    PGHOST, PGUSER, PGDATABASE, PGPASSWORD, and PGPORT */}
const pool = new Pool();

// use parameterized queries when using pool because they will
// be automatically sanitized by pg;
// e.g. pool.query('SELECT column FROM table WHERE id=$1', [someId])
module.exports = pool;
