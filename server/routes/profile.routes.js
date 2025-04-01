import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const rootDir = process.cwd();

const uploadDir = path.join(rootDir, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File not uploaded" });

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ message: "File uploaded", url: fileUrl });
});

export default router;
