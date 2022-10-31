const mysql = require('mysql')

const db = mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'root',
    database:'front-monitor',
    port:3306
})

module.exports = db