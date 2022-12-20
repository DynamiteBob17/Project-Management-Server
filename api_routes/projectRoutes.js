module.exports = function (app, pool) {

    // create a new project
    app.post('/api/project', (req, res) => {
        const project_name = req.body.project_name;
        const user_id = req.user.user_id;

        const insertQuery = `WITH ins1 AS (
            INSERT INTO project (project_name) VALUES ($1) RETURNING project_id, project_name
            ),
            ins2 AS (
                INSERT INTO project_member (project_id, user_id, is_owner, is_admin) VALUES ((SELECT project_id FROM ins1), $2, true, true)
            ) 
            SELECT * FROM ins1;`;

        pool.query(
            insertQuery,
            [project_name, user_id]
        )
            .then(result => {
                res.status(201).send({
                    message: 'Project created successfully!',
                    project: result.rows[0]
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while creating project!',
                    error
                });
            });
    });



    // get all projects for a user
    app.get('/api/projects', (req, res) => {
        const user_id = req.user.user_id;

        pool.query(
            'SELECT project_name, project.project_id FROM project INNER JOIN project_member ON project.project_id = project_member.project_id WHERE project_member.user_id = $1',
            [user_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Projects retrieved successfully!',
                    projects: result.rows
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while retrieving projects!',
                    error
                });
            });
    });



    // get all users for a project
    app.get('/api/project/members/:project_id', (req, res) => {
        const project_id = req.params.project_id;

        pool.query(
            'SELECT app_user.user_id, email, username, is_owner, is_admin FROM app_user INNER JOIN project_member ON app_user.user_id = project_member.user_id WHERE project_id = $1',
            [project_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'Users retrieved successfully!',
                    users: result.rows
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while retrieving users!',
                    error
                });
            });
    });



    // add a user to a project
    app.put('/api/project/member', (req, res) => {
        const { project_id, username } = req.body;

        pool.query(
            'SELECT is_admin FROM project_member WHERE project_id = $1 AND user_id = $2',
            [project_id, req.user.user_id]
        )
            .then(result => {
                if (result.rows.length === 0) {
                    res.status(400).send({
                        message: 'You are not a member of this project!'
                    });
                } else if (!result.rows[0].is_admin) {
                    res.status(400).send({
                        message: 'You are not an admin of this project!'
                    });
                } else {
                    pool.query(
                        'SELECT user_id FROM app_user WHERE username = $1',
                        [username]
                    )
                        .then(result => {
                            pool.query(
                                'INSERT INTO project_member (project_id, user_id) VALUES ($1, $2)',
                                [project_id, result.rows[0].user_id]
                            )
                                .then(result => {
                                    res.status(201).send({
                                        message: 'User added to project successfully!'
                                    });
                                })
                                .catch(error => {
                                    res.status(500).send({
                                        message: 'Error while adding user to project!',
                                        error
                                    });
                                });
                        })
                        .catch(error => {
                            res.status(500).send({
                                message: 'Error while adding user to project!',
                                error
                            });
                        });
                }
            });
    });



    // make a user an admin
    app.put('/api/project/member/admin', (req, res) => {
        const { project_id, user_id } = req.body;

        pool.query(
            'SELECT is_admin FROM project_member WHERE project_id = $1 AND user_id = $2',
            [project_id, req.user.user_id]
        )
            .then(result => {
                if (result.rows.length === 0) {
                    res.status(400).send({
                        message: 'You are not a member of this project!'
                    });
                } else if (!result.rows[0].is_admin) {
                    res.status(400).send({
                        message: 'You are not an admin of this project!'
                    });
                } else {
                    pool.query(
                        'UPDATE project_member SET is_admin = true WHERE project_id = $1 AND user_id = $2',
                        [project_id, user_id]
                    )
                        .then(result => {
                            res.status(200).send({
                                message: 'User made admin successfully!'
                            });
                        })
                        .catch(error => {
                            res.status(500).send({
                                message: 'Error while making user admin!',
                                error
                            });
                        });
                }
            });
    });



    // check if a user is an admin and owner of a project
    app.get('/api/project/member/admin/:project_id/:user_id', (req, res) => {
        const { project_id, user_id } = req.params;

        pool.query(
            'SELECT is_admin, is_owner FROM project_member WHERE project_id = $1 AND user_id = $2',
            [project_id, user_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'User admin status retrieved successfully!',
                    is_admin: result.rows[0].is_admin,
                    is_owner: result.rows[0].is_owner
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while retrieving user admin status!',
                    error
                });
            });
    });



    // remove a user from a project
    app.delete('/api/project/member/:project_id/:user_id', (req, res) => {
        const { project_id, user_id } = req.params;

        pool.query(
            'SELECT is_owner, is_admin, user_id FROM project_member WHERE project_id = $1',
            [project_id]
        )
            .then(result => {
                const owner = result.rows.find(member => member.is_owner);
                const userMakingRequest = result.rows.find(member => member.user_id === req.user.user_id);
                const userToRemove = result.rows.find(member => member.user_id === user_id);

                if (owner.user_id === user_id) {
                    res.status(400).send({
                        message: 'Cannot remove owner of project!'
                    });
                } else if (userMakingRequest.is_owner // already checked if owner is trying to remove themselves, owner can remove anyone
                    || (userMakingRequest.is_admin && !userToRemove.is_admin && !userToRemove.is_owner)) {
                    pool.query(
                        'DELETE FROM project_member WHERE project_id = $1 AND user_id = $2 AND is_owner = false RETURNING user_id',
                        [project_id, user_id]
                    )
                        .then(result => {
                            res.status(200).send({
                                message: 'User removed from project successfully!',
                                user_id: result.rows[0].user_id
                            });
                        })
                        .catch(error => {
                            res.status(500).send({
                                message: 'Error while removing user from project!',
                                error
                            });
                        });
                } else {
                    res.status(400).send({
                        message: 'Error while removing user from project!'
                    });
                }
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while removing user from project!',
                    error
                });
            });
    });



    // delete a project
    app.delete('/api/project/:project_id', (req, res) => {
        const project_id = req.params.project_id;

        pool.query(
            'SELECT is_owner FROM project_member WHERE project_id = $1 AND user_id = $2',
            [project_id, req.user.user_id]
        )
            .then(result => {
                if (result.rows.length === 0) {
                    res.status(400).send({
                        message: 'You are not a member of this project!'
                    });
                } else if (!result.rows[0].is_owner) {
                    res.status(400).send({
                        message: 'You are not the owner of this project!'
                    });
                } else {
                    pool.query(
                        'DELETE FROM project WHERE project_id = $1 RETURNING project_id',
                        [project_id]
                    )
                        .then(result => {
                            res.status(200).send({
                                message: 'Project deleted successfully!',
                                project_id: result.rows[0].project_id
                            });
                        })
                        .catch(error => {
                            res.status(500).send({
                                message: 'Error while deleting project!',
                                error
                            });
                        });
                }
            });
    });

}
