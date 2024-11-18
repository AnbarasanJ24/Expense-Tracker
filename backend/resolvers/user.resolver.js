import { transactions, users } from "../dummyData/data.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import Transaction from "../models/transaction.model.js";

const userResolver = {
  Query: {
    user: async (parent, args, context) => {
      try {
        const { userId } = args;
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log("Error occured at User query", error);
        throw new Error("Error occured while fetching the user");
      }
    },
    authUser: (parent, args, context) => {
      try {
        const user = context.getUser();
        return user;
      } catch (error) {
        console.log("Error ocurred at authUser query", error);
        throw new Error("Error ocurred while getting auth user");
      }
    },
  },
  Mutation: {
    signUp: async (parent, args, context) => {
      const { input } = args;
      const { username, name, password, gender } = input;
      if (!username || !name || !password || !gender) {
        throw new Error("All fields are required");
      }
      const existingUser = User.findOne({ username });
      if (existingUser) {
        throw new Error("users already exists");
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("HASHED PASSWORD", hashedPassword);

      const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
      const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

      const newUser = new User({
        username,
        name,
        password: hashedPassword,
        gender,
        profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
      });
      await newUser.save();
      await context.login(newUser);
      return newUser;
    },
    login: async (parent, args, context) => {
      try {
        const { input } = args;
        const { username, password } = input;
        if (!username || !password) {
          throw new Error("All fields are required");
        }
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });
        await context.login(user);
        return user;
      } catch (error) {
        console.log("Error occured while autheticating the user");
        throw new Error("Error occured while autheticating the user");
      }
    },
    logout: async (parent, args, context) => {
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          if (err) throw err;
        });
        context.req.clearCookie("connect.sid");
        return { message: "Logged Out Successfully" };
      } catch (error) {
        console.log("Error while performing logout operation");
        throw new Error(err.message || "Internal server error");
      }
    },
  },
  User: {
    transactions: async (parent) => {
      try {
        const transactions = await Transaction.find({ userId: parent._id });
        return transactions
      } catch (error) {
        console.log("Error Occurred at user.transaction resolver", error);
        throw new Error(err.message || "Internal server error");
      }
    },
  },
};

export default userResolver;
