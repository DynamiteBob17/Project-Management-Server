require('dotenv').config();
const { Pool } = require('pg');

{ /* when initializing a pool with no arguments,
    it will use the default environment variables
    PGHOST, PGUSER, PGDATABASE, PGPASSWORD, and PGPORT */}
const pool = new Pool();

module.exports = pool;
