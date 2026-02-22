import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userSchema from "./schemas/UserSchema.js";
import userResolvers from "./resolvers/UserResolvers.js";

import employeeSchema from "./schemas/EmployeeSchema.js";
import employeeResolvers from "./resolvers/EmployeeResolvers.js";

import mongoose from "mongoose";

//import ApolloServer
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import uploadRoutes from "./routes/upload.js";

const app = express();
dotenv.config();

//mongoDB Atlas Connection String
const DB_CONNECTION = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.${process.env.CLUSTER_ID}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

//helper function to connect to MongoDB asychronously
const connectDB = async () => {
  await mongoose.connect(DB_CONNECTION);
};

async function startServer() {
  //Define Apollo Server
  const server = new ApolloServer({
    typeDefs: [userSchema, employeeSchema],
    resolvers: [userResolvers, employeeResolvers],
  });

  //Start the Apollo Server
  await server.start();

  //Apply middleware to the Express app
  app.use("/graphql", cors(), express.json(), expressMiddleware(server));
  app.use("/api", uploadRoutes);

  //Start Express server
  app.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT}/graphql`,
    );
    //Connect to MongoDB Atlas
    try {
      connectDB();
      console.log("Connected to MongoDB Atlas");
    } catch (error) {
      console.log(`Unable to connect to DB : ${error.message}`);
    }
  });
}

startServer();
