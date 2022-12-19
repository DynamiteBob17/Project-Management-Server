module.exports = function (app, pool) {

    // create a new task
    app.post('/api/task', (req, res) => {
        const { 
            task_name,
            task_description,
            task_priority,
            task_due_date,
            project_id,
            user_id
         } = req.body;

        const insertQuery = `WITH ins1 AS (
            INSERT INTO task (task_name, task_description, task_priority, task_due_date, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING task_id
            ),
            ins2 AS (
                INSERT INTO task_member (task_id, user_id) VALUES ((SELECT task_id FROM ins1), $6)
            )
            SELECT * FROM ins1;`;
        
        pool.query(
            insertQuery,
            [task_name, task_description, task_priority, task_due_date, project_id, user_id]
        )
            .then(result => {
                res.status(201).send({
                    message: 'Task created successfully!',
                    task: result.rows[0]
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while creating task!',
                    error
                });
            });
    });



    // get all tasks for a project
    app.get('/api/tasks/:project_id', (req, res) => {
        const project_id = req.params.project_id;

        pool.query(
            'SELECT * FROM task WHERE project_id = $1',
            [project_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Tasks retrieved successfully!',
                    tasks: result.rows
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while retrieving tasks!',
                    error
                });
            });
    });



    // get all tasks for a user
    app.get('/api/user/tasks/:user_id/:project_id', (req, res) => {
        const { user_id, project_id } = req.params;

        pool.query(
            'SELECT * FROM task INNER JOIN task_member ON task.task_id = task_member.task_id WHERE task_member.user_id = $1 AND task.project_id = $2',
            [user_id, project_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Tasks retrieved successfully!',
                    tasks: result.rows
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while retrieving tasks!',
                    error
                });
            });
    });



    // get a task
    app.get('/api/task/:task_id', (req, res) => {
        const task_id = req.params.task_id;

        pool.query(
            'SELECT * FROM task WHERE task_id = $1',
            [task_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Task retrieved successfully!',
                    task: result.rows[0]
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while retrieving task!',
                    error
                });
            });
    });



    // complete a task
    app.put('/api/task/complete', (req, res) => {
        const { task_id } = req.body;

        pool.query(
            'UPDATE task SET task_completed_date = CURRENT_TIMESTAMP, task_status = $1 WHERE task_id = $2 RETURNING *',
            ['Completed', task_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Task completed successfully!',
                    task: result.rows[0]
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while completing task!',
                    error
                });
            });
    });



    // add a member to a task
    app.put('/api/task/member', (req, res) => {
        const { task_id, user_id } = req.body;

        pool.query(
            'INSERT INTO task_member (task_id, user_id) VALUES ($1, $2) RETURNING *',
            [task_id, user_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Member added to task successfully!',
                    task_member: result.rows[0]
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while adding member to task!',
                    error
                });
            });
    });



    // remove a member from a task
    app.delete('/api/task/member/:task_id/:user_id', (req, res) => {
        const { task_id, user_id } = req.params;

        pool.query(
            'DELETE FROM task_member WHERE task_id = $1 AND user_id = $2 RETURNING user_id',
            [task_id, user_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Member removed from task successfully!',
                    user_id: result.rows[0].user_id
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while removing member from task!',
                    error
                });
            });
    });



    // post a comment on a task
    app.post('/api/task/comment', (req, res) => {
        const { task_id, user_id, comment_text } = req.body;

        pool.query(
            'INSERT INTO task_comment (task_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
            [task_id, user_id, comment_text]
        )
            .then(result => {
                res.status(201).send({
                    message: 'Comment posted successfully!',
                    task_comment: result.rows[0]
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while posting comment!',
                    error
                });
            });
    });



    // get all comments for a task
    app.post('/api/task/comments', (req, res) => {
        const { task_id } = req.body;
        
        pool.query(
            'SELECT * FROM task_comment WHERE task_id = $1',
            [task_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Comments retrieved successfully!',
                    task_comments: result.rows
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while retrieving comments!',
                    error
                });
            });
    });



    // remove a comment from a task
    app.delete('/api/task/comment/:comment_id', (req, res) => {
        const comment_id = req.params.comment_id;
        
        pool.query(
            'DELETE FROM task_comment WHERE comment_id = $1 RETURNING comment_id',
            [comment_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Comment deleted successfully!',
                    comment_id: result.rows[0].comment_id
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while deleting comment!',
                    error
                });
            });
    });



    // remove a task
    app.delete('/api/task/:task_id', (req, res) => {
        const task_id = req.params;

        pool.query(
            'DELETE FROM task WHERE task_id = $1 RETURNING task_id',
            [task_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Task deleted successfully!',
                    task_id: result.rows[0].task_id
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while deleting task!',
                    error
                });
            });
    });

}
