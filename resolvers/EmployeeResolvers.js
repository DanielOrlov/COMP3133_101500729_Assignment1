import employeeModel from "../models/Employee.js";

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
        return null;
      }
    },
  },

  Mutation: {
    createEmployee: async (_, args) => {
      try {
        const newEmployee = new employeeModel({
          first_name: args.first_name,
          last_name: args.last_name,
          email: args.email,
          gender: args.gender,
          designation: args.designation,
          salary: args.salary,
          department: args.department,
          // date_of_joining will be whatever your Mongoose default is (or undefined)
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

    updateEmployee: async (_, args) => {
      try {
        const updatedEmployee = await employeeModel.findOneAndUpdate(
          { _id: args.id },
          {
            $set: {
              first_name: args.first_name,
              last_name: args.last_name,
              email: args.email,
              gender: args.gender,
              designation: args.designation,
              salary: args.salary,
              department: args.department,
            },
          },
          { new: true },
        );

        if (!updatedEmployee) return null;

        return {
          ...updatedEmployee._doc,
          date_of_joining: updatedEmployee.date_of_joining
            ? formatDate(updatedEmployee.date_of_joining)
            : null,
        };
      } catch (error) {
        console.log(`Error while updating employee: ${error.message}`);
        throw new Error(error.message);
      }
    },

    deleteEmployee: async (_, args) => {
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

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default employeeResolvers;
