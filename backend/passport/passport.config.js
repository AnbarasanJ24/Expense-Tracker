import passport from "passport";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { GraphQLLocalStrategy } from "graphql-passport";

export const configurePassport = async () => {
  // process to store the user id in the session
  passport.serializeUser((user, done) => {
    console.log("Serialize the User Using ID");
    done(null, user.id);
  });
  //   process to identify the user using id
  passport.deserializeUser(async (id, done) => {
    try {
      const user = User.findById(id);
      done(null, user);
    } catch (error) {}
  });

  //   Validate both username and password (More like a Login)
  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("Invalid username or password");
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error("Invalid username or password");
        }
        return done(null, user);
      } catch (err) {
        return done(err)
      }
    })
  );
};
