import userModel from "../models/User.js";

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
        return null;
      }
    },
  },

  Mutation: {
    createUser: async (_, args) => {
      try {
        const newUser = new userModel({
          username: args.username,
          email: args.email,
          password: args.password,
        });

        const savedUser = await newUser.save();
        const { password, ...safe } = savedUser._doc ?? savedUser;
        return safe;
      } catch (error) {
        console.log(`Error while creating user: ${error.message}`);
        return null;
      }
    },

    updateUser: async (_, args) => {
      try {
        const updatedUser = await userModel.findOneAndUpdate(
          { _id: args.id },
          {
            $set: {
              username: args.username,
              email: args.email,
              password: args.password,
            },
          },
          { new: true },
        );

        if (!updatedUser) return null;

        const { password, ...safe } = updatedUser._doc ?? updatedUser;
        return safe;
      } catch (error) {
        console.log(`Error while updating user: ${error.message}`);
        return null;
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
        return null;
      }
    },
  },
};

export default userResolvers;
