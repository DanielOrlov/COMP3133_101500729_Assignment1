import mongoose from "mongoose";
const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: Number,
      required: true,
      min: [1000, "Salary cannot be lower than 1000"],
    },
    date_of_joining: {
      type: Date,
      required: true,
      default: Date.now,
    },
    department: {
      type: String,
      required: true,
    },
    employee_photo: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "employees",
  },
);

const employeeModel = mongoose.model("employee", employeeSchema);

export default employeeModel;
