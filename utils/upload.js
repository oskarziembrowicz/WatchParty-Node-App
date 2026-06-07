const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Use a UUID as the stored filename so that user-controlled originalname
    // cannot introduce path-traversal characters (e.g. ../../etc/passwd).
    // The original name is preserved separately in the database.
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'application/pdf',
]);

// Wraps multer so that after saving, the actual magic-byte MIME type is verified
// using file-type (ESM, loaded via dynamic import). Files failing the check are
// deleted before the error reaches the client.
const multerInstance = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const upload = {
  single: (fieldName) => (req, res, next) => {
    multerInstance.single(fieldName)(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      try {
        const { fileTypeFromFile } = await import('file-type');
        const detected = await fileTypeFromFile(req.file.path);

        if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
          fs.unlinkSync(req.file.path);
          return next(
            new Error(
              'File type not allowed. Accepted: jpg, png, gif, mp4, pdf',
            ),
          );
        }

        // Overwrite the client-supplied mimetype with the server-detected value
        // so that controllers always store/serve the trusted magic-byte result.
        req.file.mimetype = detected.mime;

        next();
      } catch (e) {
        next(e);
      }
    });
  },
};

module.exports = upload;
