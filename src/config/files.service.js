import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    if (file.fieldname === 'imageURL') {
      callback(null, path.join(__dirname, '../uploads/productImages'));
    } else if (file.fieldname === 'avatar') {
      callback(null, path.join(__dirname, '../uploads/avatarImages'));
    }
  }
});

const fileFilter = (req, file, callback) => {
  const allowedTypes = ['image/jpg', 'image/png', 'image/jpeg'];
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.pow(1024, 2) * 2 // 2MB
  }
});
