
var mysql = require('mysql');

function connectionDBonnection() {
    return mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'payfast'
    });
}

module.exports = function () {
    return connectionDBonnection;
}
