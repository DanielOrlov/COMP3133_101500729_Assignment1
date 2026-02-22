import mongoose from "mongoose";
import validator from "validator";

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email is already in use"],
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [1000, "Salary cannot be lower than 1000"],
    },
    date_of_joining: {
      type: Date,
      required: true,
      default: Date.now,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    employee_photo: {
      type: String,
      default:
        "https://res.cloudinary.com/dgdkqquil/image/upload/v1771701127/296fe121-5dfa-43f4-98b5-db50019738a7_p2xynb.jpg",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "employees",
  },
);

const employeeModel = mongoose.model("employee", employeeSchema);

export default employeeModel;
