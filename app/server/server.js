const express = require("express");
const server = express();
const mongoose = require("mongoose");
const multer = require("multer");
const gridFsStorage = require("multer-gridfs");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
require("dotenv").config();
const path = require("path");
const cons = require("consolidate");
const compression = require("compression");
const morgan = require("morgan");
const { createServer } = require("http");
server.use(cors());
server.use(helmet());
server.use(bodyParser.json());

const dev = server.get("env") !== "production";

if (!dev) {
  server.disable("x-powered-by");
  server.use(compression());
  server.use(morgan("common"));
}

const port = process.env.PORT || 4005;
mongoose
  .connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true }
  )
  .then(p => {
    console.log("=== connected to lambdadaFinal==");
  })
  .catch(err => {
    console.log(`err:${err}`);
  });

server.use(express.static(path.join(__dirname, "../gridfs/build")));
server.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../gridfs/build", "index.html"));
});

const SafeServer = createServer(server);

SafeServer.listen(port, () => {
  console.log(`===>server running on port${port}`);
});
