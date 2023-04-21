/*
    Inserted in Bash with the following command:
    PGPASSWORD=<password> psql -h <remote_host> -U <username> -d <database_name> -a -f ./database/sample_db.sql
*/

CREATE TABLE IF NOT EXISTS app_user (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(320) UNIQUE NOT NULL,
  password VARCHAR(512) NOT NULL
);

CREATE TABLE IF NOT EXISTS project (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_member (
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_user (user_id) ON DELETE CASCADE,
    is_owner BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- task_status is a varchar instead of a boolean because it's easier to add new statuses later on if needed 
CREATE TABLE IF NOT EXISTS task (
    task_id SERIAL PRIMARY KEY,
    task_name VARCHAR(32) NOT NULL,
    task_description VARCHAR(256) NOT NULL,
    task_status VARCHAR(32) NOT NULL DEFAULT 'Open',
    task_priority VARCHAR(32) NOT NULL,
    task_due_date TIMESTAMP,
    task_created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    task_completed_date TIMESTAMPTZ ,
    project_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_member (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task (task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_user (user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_comment (
    comment_id SERIAL PRIMARY KEY,
    comment_text VARCHAR(512) NOT NULL,
    comment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task (task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_user (user_id) ON DELETE CASCADE
);
