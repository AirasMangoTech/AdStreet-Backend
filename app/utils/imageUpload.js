const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, cb) {
          const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
          const filePath = '/uploads/' + fileName;
          req.filepath = filePath; // Add the file path to req object
          cb(null, fileName);
        },
      });

// Initialize upload
const upload = multer({ storage: storage })


// Check file type
function checkFileType(file, cb) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}

module.exports = {upload};
