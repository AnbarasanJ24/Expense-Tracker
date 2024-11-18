import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

const transactionResolver = {
  Query: {
    transactions: async (parent, args, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthroized User");
        }
        const userId = await context.getUser();
        const transactions = Transaction.find({ userId });
        return transactions;
      } catch (error) {
        console.log("Error in transaction query", error);
        throw new Error(
          "Error ocuured during fetching the transactions",
          error
        );
      }
    },
    transaction: async (parent, args, context) => {
      try {
        const { transactionId } = args;
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (error) {
        console.log("Error occured at transaction query");
        throw new Error(
          "Error ocurred while fetchinging single transaction",
          error
        );
      }
    },
  },
  Mutation: {
    createTransaction: async (parent, args, context) => {
      try {
        const { input } = args;
        const { description, paymentType, category, amount, location, date } =
          input;
        if (
          !description ||
          !paymentType ||
          !category ||
          !amount ||
          !location ||
          !date
        ) {
          throw new Error("All fields are required");
        }

        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.log("Error occured at create transaction mutation");
        throw new Error("Error ocurred while creating transaction", error);
      }
    },
    updateTransaction: async (parent, args, context) => {
      try {
        const { input } = args;
        const { transactionId } = input;
        // Even we _id in the input, Mongo DB will not update it
        const updatedTransaction = Transaction.findByIdAndUpdate(
          transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.log("Error occured at update transaction mutation");
        throw new Error("Error ocurred while updating the transaction", error);
      }
    },
    deleteTransaction: async (_, { transactionId }, context) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (error) {
        console.log("Error occured at delete transaction mutation");
        throw new Error("Error ocurred while delete the transaction", error);
      }
    },
  },
  Transaction:{
    user: async(parent)=>{
      try{
        const userId = parent.userId;
        const user = User.findById(userId);
        return user;
      }catch(error){
        console.log("Error occured at transaction.user query");
        throw new Error("Error ocurred while fetching the user for the transaction", error);
      }
    }
  }

};

export default transactionResolver;
