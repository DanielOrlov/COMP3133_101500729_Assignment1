import employeeModel from "../models/Employee.js";
import mongoose from "mongoose";

const employeeResolvers = {
  Query: {
    employees: async () => {
      try {
        const employees = await employeeModel.find();
        return employees.map((emp) => ({
          ...emp._doc,
          date_of_joining: emp.date_of_joining
            ? formatDate(emp.date_of_joining)
            : null,
        }));
      } catch (error) {
        console.log(`Error while fetching employees: ${error}`);
        return [];
      }
    },

    employee: async (_, args) => {
      try {
        const employee = await employeeModel.findOne({ _id: args.id });
        if (!employee) return null;

        return {
          ...employee._doc,
          date_of_joining: employee.date_of_joining
            ? formatDate(employee.date_of_joining)
            : null,
        };
      } catch (error) {
        console.log(`Error while fetching employee: ${error}`);
        throw new Error(error.message);
      }
    },

    findEmployeesByDesignationOrDepartment: async (_, args) => {
      try {
        const q = (args.search ?? "").trim();
        if (!q) return [];

        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(escaped, "i");

        const docs = await employeeModel
          .find({
            $or: [{ department: re }, { designation: re }],
          })
          .lean();

        return docs.map((d) => ({
          ...d,
          date_of_joining: d.date_of_joining
            ? formatDate(d.date_of_joining)
            : null,
        }));
      } catch (error) {
        console.log(`Error while fetching employees: ${error}`);
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    createEmployee: async (_, args, context) => {
      requireAuth(context);
      try {
        const newEmployee = new employeeModel({
          first_name: args.first_name,
          last_name: args.last_name,
          email: args.email,
          gender: args.gender,
          designation: args.designation,
          salary: args.salary,
          department: args.department,
          employee_photo: args.employee_photo,
          date_of_joining: args.date_of_joining ? args.date_of_joining : Date.now()
        });

        const savedEmployee = await newEmployee.save();

        return {
          ...savedEmployee._doc,
          date_of_joining: savedEmployee.date_of_joining
            ? formatDate(savedEmployee.date_of_joining)
            : null,
        };
      } catch (error) {
        console.log(`Error while creating employee: ${error.message}`);
        throw new Error(error.message);
      }
    },

    updateEmployee: async (_, args, context) => {
      requireAuth(context);
      try {
        const { id, ...rest } = args;

        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        const updateFields = {};

        Object.keys(rest).forEach((key) => {
          const val = rest[key];
          if (val !== undefined) {
            if (key === "date_of_joining" && val) {
              updateFields[key] = new Date(val);
            } else {
              updateFields[key] = val;
            }
          }
        });

        if (Object.keys(updateFields).length === 0) {
          const emp = await employeeModel.findById(id);
          if (!emp) return null;

          const doc = emp._doc ?? emp;
          return {
            ...doc,
            date_of_joining: doc.date_of_joining
              ? formatDate(doc.date_of_joining)
              : null,
          };
        }


        console.log("updateEmployee args:", args);
        console.log("updateFields before DB update:", updateFields);
        const updatedEmployee = await employeeModel.findOneAndUpdate(
          { _id: id },
          { $set: updateFields },
          { new: true, runValidators: true },
        );

        if (!updatedEmployee) return null;

        const doc = updatedEmployee._doc ?? updatedEmployee;
        return {
          ...doc,
          date_of_joining: doc.date_of_joining
            ? formatDate(doc.date_of_joining)
            : null,
        };
      } catch (error) {
        console.log(`Error while updating employee: ${error.message}`);
        throw new Error(error.message);
      }
    },

    deleteEmployee: async (_, args, context) => {
      requireAuth(context);
      try {
        const deletedEmployee = await employeeModel.findByIdAndDelete(args.id);
        if (!deletedEmployee) return null;

        return {
          ...deletedEmployee._doc,
          date_of_joining: deletedEmployee.date_of_joining
            ? formatDate(deletedEmployee.date_of_joining)
            : null,
        };
      } catch (error) {
        console.log(`Error while deleting employee : ${error.message}`);
        throw new Error(error.message);
      }
    },
  },
};

// const formatDate = (date) =>
//   new Date(date).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
}

function requireAuth(context) {
  if (!context.user) {
    throw new Error("Unauthorized");
  }
}

export default employeeResolvers;
