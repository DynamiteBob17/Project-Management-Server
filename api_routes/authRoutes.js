require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth');

module.exports = function (app, pool) {

    // register a new user
    app.post('/api/register', (req, res) => {
        const { username, email, password } = req.body;

        bcrypt.hash(password, 10)
            .then(hash => {
                pool.query(
                    'INSERT INTO app_user (username, email, password) VALUES ($1, $2, $3) RETURNING user_id',
                    [username, email, hash]
                )
                    .then(result => {
                        res.status(201).send({
                            message: 'User registered successfully!',
                            user_id: result.rows[0].user_id
                        });
                    })
                    .catch(error => {
                        res.status(500).send({
                            message: 'Error while registering user!',
                            error
                        });
                    });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while registering user!',
                    error
                });
            });
    });



    // login a user, return token and user info
    app.post('/api/login', (req, res) => {
        const { emailOrUsername, password } = req.body;

        pool.query(
            'SELECT * FROM app_user WHERE email = $1 OR username = $1',
            [emailOrUsername]
        )
            .then(result => {
                const user = result.rows[0];

                bcrypt.compare(password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(400).send({
                                message: 'Invalid password!',
                                error
                            });
                        }

                        const token = jwt.sign(
                            {
                                user_id: user.user_id,
                                username: user.username,
                                email: user.email
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

                        res.status(200).send({
                            message: 'Login successful!',
                            username: user.username,
                            email: user.email,
			                user_id: user.user_id,
                            token
                        });
                    })
                    .catch(error => {
                        res.status(400).send({
                            message: 'Invalid password!',
                            error
                        });
                    });
            })
            .catch(error => {
                res.status(404).send({
                    message: 'User not found!',
                    error
                });
            });
    });

	
	
    // remove a user
    app.delete('/api/user', auth, (req, res) => {
        const { user_id, username } = req.user;
        
        if (username === 'user1' || username === 'user2' || username === 'user3') {
            return res.status(500).send({
                message: 'Cannot delete test users'
            });
        }

        pool.query(
            'DELETE FROM app_user WHERE user_id = $1',
            [user_id]
        )
            .then(result => {
                res.status(200).send({
                    message: 'User deleted successfully!',
                    username: username
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: 'Error while deleting user!',
                    error
                });
            });
    });

}
