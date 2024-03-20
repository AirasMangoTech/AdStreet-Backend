const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: "./uploadFiles/",
  filename: function (req, file, cb) {
    const fileName =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    const filePath = "/uploadFiles/" + fileName;
    req.filepath = filePath; // Add the file path to req object
    cb(null, fileName);
  },
});

const uploadFiles = multer({ storage: storage });

function checkFileType(file, cb) {
  const filetypes = /pdf|docx?|xlsx?|pptx?/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype =
    /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation/.test(
      file.mimetype
    );

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Only PDF, PPT, Excel, and Word documents are allowed!");
  }
}

module.exports = { uploadFiles };
