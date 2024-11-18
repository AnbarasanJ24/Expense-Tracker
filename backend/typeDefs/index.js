import { mergeTypeDefs } from "@graphql-tools/merge";
import transactionTypeDefs from "./transaction.typeDefs.js";
import userTypeDefs from "./user.typeDefs.js";

const mergedTypeDefs = mergeTypeDefs([userTypeDefs, transactionTypeDefs]);

export default mergedTypeDefs;
