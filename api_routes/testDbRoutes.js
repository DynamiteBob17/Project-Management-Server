// module.exports = function (app, pool) {
//     app.delete('/api/delete_data_from_test_db', (req, res) => {
//         pool.query(
//             'DELETE FROM project; DELETE FROM app_user;' // the cascade deletes data from all other tables
//         )
//             .then(result => {
//                 res.status(200).send({
//                     message: 'Data deleted from test db successfully!'
//                 });
//             })
//             .catch(error => {  
//                 res.status(500).send({
//                     message: 'Error while deleting data from test db!',
//                     error
//                 });
//             });
//     });
// }
