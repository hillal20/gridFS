const express = require("express");
const server = express();
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methode = require("gridfs-stream");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
require("dotenv").config();
const path = require("path");
const cons = require("consolidate");
const compression = require("compression");
const morgan = require("morgan");
const { createServer } = require("http");
const crypto = require("crypto");
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
const connection = mongoose.createConnection(process.env.MONGO_URL, {
  useNewUrlParser: true
});
// .then(p => {
//   console.log("=== connected to lambdadaFinal==");
// })
// .catch(err => {
//   console.log(`err:${err}`);
// });
////////////////////////////////////////////////////////
let gfs;
connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

///////////////////////////////////// s
const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage: storage });

server.post("/uploads", upload.single("image"), (req, res) => {
  console.log("file ====>", req.file);
  res.json({ file: req.file });
});

/////////////////////////////////////////////////
server.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      res.status(404).json({ msg: "no files " });
    }
    return res.json(files);
  });
});

//////////////////////////////////////////////

server.get("/files/:filename", (req, res) => {
  const filename = req.params.filename;
  gfs.files
    .findOne({ filename: filename })
    .then(file => {
      if (file) {
        res.json(file);
      }
      res.json({ msg: "there is no file" });
    })
    .catch(err => {
      res.json({ err: err });
    });
});
///////////////////////////// desplay the image

server.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  gfs.files
    .findOne({ filename: filename })
    .then(file => {
      if (
        file.contentType === "image/jpeg" ||
        file.contentType === "image/png"
      ) {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.json({ msg: "it is not an  image" });
      }
    })
    .catch(err => {
      res.json({ err: err });
    });
});

// server.use(express.static(path.join(__dirname, "../gridfs/build")));
// server.use("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../gridfs/build", "index.html"));
// });

const SafeServer = createServer(server);

SafeServer.listen(port, () => {
  console.log(`===>server running on port${port}`);
});
