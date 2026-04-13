import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import userSchema from "./schemas/UserSchema.js";
import userResolvers from "./resolvers/UserResolvers.js";
import employeeSchema from "./schemas/EmployeeSchema.js";
import employeeResolvers from "./resolvers/EmployeeResolvers.js";
import uploadRoutes from "./routes/upload.js";
import { connectDB } from "./config/db.js";

import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();
  console.log("Connected to MongoDB Atlas");

  const server = new ApolloServer({
    typeDefs: [userSchema, employeeSchema],
    resolvers: [userResolvers, employeeResolvers],
  });

  await server.start();

  app.use(
    cors({
      origin: [
        'http://localhost:4200',
        'https://101500729-comp3133-assignment2.vercel.app',
      ],
      // origin: 'http://localhost:4200',
      credentials: true,
    })
  );

  app.use(express.json());

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || "";
        let user = null;

        if (authHeader.startsWith("Bearer ")) {
          const token = authHeader.replace("Bearer ", "");

          try {
            user = jwt.verify(token, process.env.JWT_SECRET);
          } catch (error) {
            user = null;
          }
        }

        return { user };
      },
    }),
  );
  app.use("/api", uploadRoutes);

  app.get("/", (req, res) => {
    res.json({
      message: "Employee Management API is running",
      graphql: "/graphql",
      upload: "/api/upload",
    });
  });

  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});