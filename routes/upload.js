import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "employees", resource_type: "image" },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded)),
      );
      stream.end(req.file.buffer);
    });

    return res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

export default router;
