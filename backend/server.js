const path = require('path');
const PORT = 5000;
const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();

const { createTemplate, getTemplates, deleteTemplate, updateTemplate, dummy, getSingleTemplate } = require("./crud");
const { sendMail } = require("./send_mail");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/hi", (req, res) => {
  res.send("SQLite DB is connected!");
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get("/dummy", dummy);
app.post("/create-template", createTemplate);
app.put("/update-template/:id", updateTemplate);
app.get("/get-templates", getTemplates);
app.delete("/delete-template/:id", deleteTemplate);
app.get("/single-template/:id", getSingleTemplate);

app.post("/sending_mail", sendMail);

app.get("/", (req, res) => {
  res.send("Hello world from Express and Node.js!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});