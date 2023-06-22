const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aezakmi1",
  database: "car-agency",
});

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(cookieParser());

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("you are not verifyed");
  } else {
    jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        return res.json("token is not correct");
      } else {
        req.username = decoded.username;
        next();
      }
    });
  }
};

app.get("/", verifyUser, (req, res) => {
  res.json({ Status: "Success" });
});

app.get("/cars", (req, res) => {
  db.query("SELECT * FROM cars", (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

app.get("/client", (req, res) => {
  db.query("SELECT * FROM client", (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

app.get("/car/:id", (req, res) => {
  db.query(
    `SELECT * FROM cars WHERE ID_voiture=${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      res.json(data);
    }
  );
});

app.post("/client/req", (req, res) => {
  const q =
    "UPDATE client SET demandes = CONCAT(demandes, ?) WHERE Adresse = ?";
  console.log(req.body.msg);

  db.query(q, [req.body.msg + "end", req.body.id], (err, data) => {
    if (err) return res.json(err);
    res.json("client request has been added succefully!!");
  });
});

app.get("/client/:id", (req, res) => {
  const username = req.params.id.replace(/hey|hoo/g, "") + "@gmail.com";
  console.log(req.params.id, username);

  db.query(`SELECT * FROM client WHERE Adresse='${username}'`, (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
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

const salt = 10;

// sign up

app.post("/signup", (req, res) => {
  const q =
    "INSERT INTO client (`ID_client`,`Nom`,`Prenom`,`Cin`,`Adresse`,`Tel`,`Password`,`Age`,`Genre`) Values (?,?,?,?,?,?,?,?,?)";
  bcrypt.hash(req.body.Password.toString(), salt, (err, hash) => {
    if (err) return res.json(err);

    const values = [
      Math.random() * (999999 - 8 + 1) + 8,
      req.body.Nom,
      req.body.Prenom,
      req.body.Cin,
      req.body.Adresse,
      req.body.Tel,
      hash,
      req.body.Age,
      req.body.Genre,
    ];

    db.query(q, values, (err, rst) => {
      if (err) return res.json(err);
      res.json({ Status: "Success" });
    });
  });
});

app.post("/client", (req, res) => {
  const q = "SELECT * FROM client WHERE Adresse = (?)";
  db.query(q, [req.body.username], (err, data) => {
    console.log(data[0]);
    if (err) return res.json("Error finding you account");
    if (data.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        data[0].Password,
        (err, response) => {
          if (err) return res.json("Error finding you account");
          if (response) {
            const username = data[0].Adresse;
            const token = jwt.sign({ username }, "secret", { expiresIn: "7d" });
            res.cookie("token", token);
            res.json({ Status: "Success" });
          } else {
            res.json("Error finding you account");
          }
        }
      );
    } else {
      res.json("Error finding you account");
    }
  });
});

// app.get("/clients/reqs", (req, res) => {
//   db.query("SELECT * FROM client", (err, rst) => {
//     if (err) return res.json("error in getting the clients reqs");

//     const clients = rst.map((client) => {
//       // const demandeArray = JSON.parse(client.demandes); // Assuming 'demande' is stored as a JSON string
//       return client.demandes;
//       // return client.demandes.filter((value) => value !== null);
//       // Perform desired actions with the demande data
//     });
//     const clientsF = clients.filter((value) => value !== null);

//     res.json(clientsF);
//   });
// });

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

app.listen(8000, () => {
  console.log("server is listning on port 8000");
});
