import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Employee from "../models/Employee.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/employees/:id/photo", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "employees", resource_type: "image" },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded)),
      );
      stream.end(req.file.buffer);
    });

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { employee_photo: result.secure_url },
      { new: true },
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.json({
      message: "Profile picture updated successfully",
      employee: updatedEmployee,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

export default router;
