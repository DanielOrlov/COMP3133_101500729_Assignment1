const express = require("express");
const mongoose = require("mongoose");
// const path = require("path");
// require("dotenv").config({ path: path.join(__dirname, ".env") });

//GraphQL related imports
const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");

//Models
const UserModel = require("./model/User");
const EmployeeModel = require("./model/Employee");

const app = express();
const PORT = 4000;

console.log("ENV CHECK:", {
  DB_USER_NAME: process.env.DB_USER_NAME,
  CLUSTER_ID: process.env.CLUSTER_ID,
  DB_NAME: process.env.DB_NAME,
});

//Schema
const gqlSchema = buildSchema(`

    type User{
        _id: ID!
        username: String!
        email: String!
        created_at: String
        updated_at: String
    }

    type Employee{
        _id: ID!
        first_name: String!
        last_name: String!
        email: String!
        gender: String!
        designation: String!
        salary: Float!
        date_of_joining: String!
        department: String!
        employee_photo: String
        created_at: String
        updated_at: String
    }


    type Query{
        users: [User]!
        user(username: String!): User

        employees: [Employee]!
        employee(id: ID!): Employee
    }

    type Mutation{
        createUser(username: String!, email: String!, password: String!): User
        updateUser(id: ID!, username: String!, email: String!, password: String!): User
        deleteUser(id: ID!): User

        createEmployee(
          first_name: String!, 
          last_name: String!, 
          email: String!, 
          gender: String!, 
          designation: String!, 
          salary: Float!, 
          department: String!): Employee

        updateEmployee(
          id: ID!, 
          first_name: String!, 
          last_name: String!, 
          email: String!, 
          gender: String!, 
          designation: String!, 
          salary: Float!, 
          department: String!): Employee

        deleteEmployee(id: ID!): Employee
    }
        

    `);

//Resolver
const rootResolver = {
  users: async () => {
    try {
      const users = await UserModel.find();
      return users;
    } catch (error) {
      console.log(`Error while fetching users: ${error}`);
      return [];
    }
  },
  user: async (args) => {
    try {
      const users = await UserModel.findOne({ username: args.username });
      return users;
    } catch (error) {
      console.log(`Error while fetching user: ${error}`);
      return null;
    }
  },
  createUser: async (args) => {
    try {
      const newUser = new UserModel({
        username: args.username,
        email: args.email,
        password: args.password,
      });
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      console.log(`Error while creating user: ${error.message}`);
      return null;
    }
  },
  updateUser: async (args) => {
    try {
      const updateUser = await UserModel.findOneAndUpdate(
        args.id,
        {
          $set: {
            username: args.username,
            email: args.email,
            password: args.password,
          },
        },
        { new: true },
      );
      return updateUser;
    } catch (error) {
      console.log(`Error while updating user: ${error.message}`);
      return null;
    }
  },
  deleteUser: async (args) => {
    try {
      const deleteUser = await UserModel.findByIdAndDelete(args.id);
      return deleteUser;
    } catch (error) {
      console.log(`Error while deleting user : ${error.message}`);
      return null;
    }
  },
  employees: async () => {
    try {
      const employees = await EmployeeModel.find();
      return employees.map((emp) => ({
        ...emp._doc,
        date_of_joining: formatDate(emp.date_of_joining),
      }));
    } catch (error) {
      console.log(`Error while fetching employees: ${error}`);
      return [];
    }
  },
  employee: async (args) => {
    try {
      const employee = await EmployeeModel.findOne({
        _id: args.id,
      });

      if (!employee) return null;

      return {
        ...employee._doc,
        date_of_joining: formatDate(employee.date_of_joining),
      };
    } catch (error) {
      console.log(`Error while fetching employee: ${error}`);
      return null;
    }
  },
  createEmployee: async (args) => {
    try {
      const newEmployee = new EmployeeModel({
        first_name: args.first_name,
        last_name: args.last_name,
        email: args.email,
        gender: args.gender,
        designation: args.designation,
        salary: args.salary,
        department: args.department,
      });
      const savedEmployee = await newEmployee.save();
      return {
        ...savedEmployee._doc,
        date_of_joining: formatDate(savedEmployee.date_of_joining),
      };
    } catch (error) {
      console.log(`Error while creating employee: ${error.message}`);
      throw new Error(error.message);
    }
  },
  updateEmployee: async (args) => {
    try {
      const updatedEmployee = await EmployeeModel.findOneAndUpdate(
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

      if (!employee) return null;

      return {
        ...updatedEmployee._doc,
        date_of_joining: formatDate(updatedEmployee.date_of_joining),
      };
    } catch (error) {
      console.log(`Error while updating employee: ${error.message}`);
      throw new Error(error.message);
    }
  },
  deleteEmployee: async (args) => {
    try {
      const deletedEmployee = await EmployeeModel.findByIdAndDelete(args.id);

      if (!employee) return null;

      return {
        ...deletedEmployee._doc,
        date_of_joining: formatDate(deletedEmployee.date_of_joining),
      };
    } catch (error) {
      console.log(`Error while deleting employee : ${error.message}`);
      throw new Error(error.message);
    }
  },
};

//Create express graphql
const graphqlHttp = graphqlHTTP({
  schema: gqlSchema,
  rootValue: rootResolver,
  graphiql: true,
});

//Add graphqlHttp to express middleware
app.use("/graphql", graphqlHttp);

//helper function to connect to MongoDB asychronously
const connectDB = async () => {
  try {
    console.log(`Attempting to connect to DB`);
    const DB_NAME = "comp3133_101500729_Assigment1";
    const DB_USER_NAME = "admin";
    const DB_PASSWORD = "!password123";
    const CLUSTER_ID = "kv0ijv9";
    const DB_CONNECTION = `mongodb+srv://${DB_USER_NAME}:${DB_PASSWORD}@cluster0.${CLUSTER_ID}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

    mongoose
      .connect(DB_CONNECTION)
      .then(() => {
        console.log(`MongoDB connected`);
      })
      .catch((err) => {
        console.log(
          `Error while connecting to MongoDB : ${JSON.stringify(err)}`,
        );
      });
  } catch (error) {
    console.log(`Unable to connect to DB : ${error.message}`);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

app.listen(PORT, () => {
  connectDB();
  console.log("GraphQL Server started");
  console.log("http://localhost:4000/graphql");
});
