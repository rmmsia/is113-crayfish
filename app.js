const express = require('express');

const server = express();
const port = 3000;
const path = require("path");

const authRoutes = require('./routes/auth')
const indexRoutes = require('./routes/index')
const inviteRoutes = require('./routes/invite')

server.set("view engine", "ejs")

server.use("/", express.static(path.join(__dirname, "public")));

server.use('/', authRoutes);
server.use('/', indexRoutes);
server.use('/', inviteRoutes);

server.get('/', (req, res) => {
  res.send(`Hello world!`);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});