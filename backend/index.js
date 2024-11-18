import { ApolloServer } from "@apollo/server";
import mergeResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import cors from "cors";
import connectMongo from "connect-mongodb-session";
import passport from "passport";
import session from "express-session";
import { buildContext } from "graphql-passport";

dotenv.config();
const app = express();


const httpServer = http.createServer(app);

// const MongoDBStore = connectMongo(session);
// const store = new MongoDBStore({
// 	uri: process.env.MONGO_URI,
// 	collection: "sessions",
// });
// store.on("error", (err) => console.log(err));

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergeResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();
console.log("Starting connection with Mongo DB")
await connectDB();


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Keeping true will multiple session for the same user, so keep always as false
    saveUninitialized: false, // Keeping true will save
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    // store
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use(
  "/",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
