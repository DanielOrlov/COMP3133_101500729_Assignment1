const express = require("express");
const mongoose = require("mongoose");
// const path = require("path");
// require("dotenv").config({ path: path.join(__dirname, ".env") });

//GraphQL related imports
const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");

//Models
const UserModel = require("./model/User");

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


    type Query{
        users: [User]
        user(username: String!): User
    }

    type Mutation{
        createUser(username: String!, email: String!, password: String!): User
        updateUser(id: ID!, username: String!, email: String!, password: String!): User
        deleteUser(id: ID!): User
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

app.listen(PORT, () => {
  connectDB();
  console.log("GraphQL Server started");
  console.log("http://localhost:4000/graphql");
});
