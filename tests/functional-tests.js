// when testing, we will be using an AWS database

// when deploying, we will be using the Render.com database

/* 
    Ugh, there is just way too much to test for all the routes
    and all the edge cases like invalid data, missing data, etc.

    I will leave it at this for now and maybe add more later
    because it will take too long just for a personal project.
*/

require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const app = require('../index');
const auth = { 'Authorization': `Bearer ${process.env.AUTH0_TOKEN}`};

chai.use(chaiHttp);

let user_id1, user_id2, user_id3;
let project_id1, project_id2;
let task_id1, task_id2;
let comment_id1, comment_id2;

suite('Functional Tests', function () {
    this.timeout(60000);
    test('Health check', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.message, 'health check: api is up and running');
                done();
        });
    });
    test('Delete data from test db', (done) => {
        chai.request(app)
            .delete('/api/delete_data_from_test_db')
            .set(auth)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.message, 'Data deleted from test db successfully!');
                done();
        });
    });



    suite('Test authentication routes', () => {
        test('Register user1', done => {
            chai.request(app)
                .post('/api/register')
                .set(auth)
                .send({
                    username: 'user1',
                    email: 'user1@mail.org',
                    password: 'pwd1'
                })
                .end((err, res) => {
                    assert.equal(res.status, 201);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'user_id');
                    user_id1 = res.body.user_id;
                    done();
                });
        });
        test('Try registering as user1 again', done => {
            chai.request(app)
                .post('/api/register')
                .set(auth)
                .send({
                    username: 'user1',
                    email: 'user1@mail.org',
                    password: 'pwd1'
                })
                .end((err, res) => {
                    assert.equal(res.status, 500);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'message');
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error.detail, "Key (username)=(user1) already exists.");
                    done();
                });
        });
        test('Register user2', done => {
            chai.request(app)
                .post('/api/register')
                .set(auth)
                .send({
                    username: 'user2',
                    email: 'user2@mail.org',
                    password: 'pwd1'
                })
                .end((err, res) => {
                    assert.equal(res.status, 201);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'user_id');
                    user_id2 = res.body.user_id;
                    done();
                });
        });
        test('Register user3', done => {
            chai.request(app)
                .post('/api/register')
                .set(auth)
                .send({
                    username: 'user3',
                    email: 'user3@mail.org',
                    password: 'pwd3'
                })
                .end((err, res) => {
                    assert.equal(res.status, 201);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'user_id');
                    user_id3 = res.body.user_id;
                    done();
                });
        });
        test('Login as user1', done => {
            chai.request(app)
                .post('/api/login')
                .set(auth)
                .send({
                    emailOrUsername: 'user1',
                    password: 'pwd1'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'token');
                    done();
                });
        });
        test('Login as user1 with wrong password', done => {
            chai.request(app)
                .post('/api/login')
                .set(auth)
                .send({
                    emailOrUsername: 'user1',
                    password: 'wrongpwd'
                })
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.message, 'Invalid password!');
                    done();
                });
        });
        test('Delete user3', done => {
            chai.request(app)
                .delete('/api/user')
                .set(auth)
                .send({
                    user_id: user_id3
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'message');
                    assert.property(res.body, 'username');
                    assert.equal(res.body.message, 'User deleted successfully!');
                    assert.equal(res.body.username, 'user3');
                    done();
                });
        });
        test('Try deleting user3 that does not exist anymore', done => {
            chai.request(app)
                .delete('/api/user')
                .set(auth)
                .send({
                    user_id: user_id3
                })
                .end((err, res) => {
                    assert.equal(res.status, 500);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'message');
                    assert.notProperty(res.body, 'username');
                    assert.equal(res.body.message, 'Error while deleting user!');
                    done();
                });
        });
    });



    suite('Test project routes', () => {
        test('', done => {
            chai.request(app)
                .get('')
                .set(auth)
                .send({

                })
                .end((err, res) => {
                    
                    done();
                });
        });
    });



    suite('Test task routes', () => {
        test('', done => {
            chai.request(app)
                .get('')
                .set(auth)
                .send({

                })
                .end((err, res) => {
                    
                    done();
                });
        });
    });



    suite('Delete data from test db again', () => {
        test('Delete data from test db again', (done) => {
            chai.request(app)
                .delete('/api/delete_data_from_test_db')
                .set(auth)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.message, 'Data deleted from test db successfully!');
                    done();
            });
        });
    });
});
