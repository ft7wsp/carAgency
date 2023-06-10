const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aezakmi1",
  database: "car-agency",
});

const app = express();

app.use(express.json());
app.use(cors());

app.get("/cars", (req, res) => {
  db.query("SELECT * FROM cars", (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

app.get("/cars/:id", (req, res) => {
  db.query(
    `SELECT * FROM cars WHERE ID_voiture=${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      res.json(data);
    }
  );
});

app.post("/admin/addCar", (req, res) => {
  const q =
    "INSERT INTO cars (`ID_voiture`,`Matricule`, `Modele`, `Marque`, `Moteur`, `Prix`) Values (?)";
  const values = [
    req.body.ID_voiture,
    req.body.Matricule,
    req.body.Modele,
    req.body.Marque,
    req.body.Moteur,
    req.body.Prix,
  ];
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    res.json("car has been added succefully!!");
  });
});

app.listen(8000, () => {
  console.log("server is listning on port 8000");
});
