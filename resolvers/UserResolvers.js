import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const SALT_ROUNDS = 10;

const userResolvers = {
  Query: {
    users: async () => {
      try {
        const users = await userModel.find();
        // if password exists in DB, avoid returning it
        return users.map((u) => {
          const { password, ...safe } = u._doc ?? u;
          return safe;
        });
      } catch (error) {
        console.log(`Error while fetching users: ${error}`);
        return [];
      }
    },

    user: async (_, args) => {
      try {
        const user = await userModel.findOne({ username: args.username });
        if (!user) return null;

        const { password, ...safe } = user._doc ?? user;
        return safe;
      } catch (error) {
        console.log(`Error while fetching user: ${error}`);
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    createUser: async (_, args) => {
      try {
        const hashed = await bcrypt.hash(args.password, SALT_ROUNDS);

        const newUser = new userModel({
          username: args.username,
          email: args.email,
          password: hashed,
        });

        const savedUser = await newUser.save();
        const { password, ...safe } = savedUser._doc ?? savedUser;
        return safe;
      } catch (error) {
        console.log(`Error while creating user: ${error.message}`);
        throw new Error(error.message);
      }
    },

    updateUser: async (_, args) => {
      try {
        const updateFields = {};
        if (args.username !== undefined) updateFields.username = args.username;
        if (args.email !== undefined) updateFields.email = args.email;

        if (
          args.password !== undefined &&
          args.password !== null &&
          args.password !== ""
        ) {
          updateFields.password = await bcrypt.hash(args.password, SALT_ROUNDS);
        }

        const updatedUser = await userModel.findOneAndUpdate(
          { _id: args.id },
          {
            $set: updateFields,
          },
          { new: true },
        );

        if (!updatedUser) return null;

        const { password, ...safe } = updatedUser._doc ?? updatedUser;
        return safe;
      } catch (error) {
        console.log(`Error while updating user: ${error.message}`);
        throw new Error(error.message);
      }
    },

    deleteUser: async (_, args) => {
      try {
        const deletedUser = await userModel.findByIdAndDelete(args.id);
        if (!deletedUser) return null;

        const { password, ...safe } = deletedUser._doc ?? deletedUser;
        return safe;
      } catch (error) {
        console.log(`Error while deleting user : ${error.message}`);
        throw new Error(error.message);
      }
    },

    login: async (_, args) => {
      try {
        const user = await userModel.findOne({ username: args.username });
        if (!user) throw new Error("Invalid credentials");

        const isMatch = await bcrypt.compare(args.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        const payload = { id: user._id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES,
        });

        const { password, ...safe } = user._doc ?? user;

        return { token, user: safe };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  User: {
    created_at: (parent) =>
      parent.created_at ? new Date(parent.created_at).toISOString() : null,

    updated_at: (parent) =>
      parent.updated_at ? new Date(parent.updated_at).toISOString() : null,
  },
};

export default userResolvers;
