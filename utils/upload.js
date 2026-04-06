const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Files are stored as <timestamp>-<originalname>
    // SECURITY NOTE: In production, use a UUID/random name to prevent filename enumeration
    // SECURITY NOTE: In production, sanitize the original filename to prevent path traversal attacks
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// SECURITY NOTE: In production, add a fileFilter to whitelist allowed MIME types
// SECURITY NOTE: In production, add a limits.fileSize to cap upload size
// SECURITY NOTE: In production, scan uploaded files for malware before storing
const upload = multer({ storage });

module.exports = upload;
