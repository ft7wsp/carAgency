const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aezakmi1",
  database: "car-agency",
});

exports.db = db;
