const aws = require("aws-sdk");
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

const app = express();
aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION,
});
const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid Mime Type, only JPEG and PNG"), false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "test" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});
const singleUpload = upload.single("image");

app.post("/image-upload", (req, res) => {
  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(422).send(err);
    }
    return res.json({ imageUrl: req.file.location });
  });
});

app.listen(3000);
