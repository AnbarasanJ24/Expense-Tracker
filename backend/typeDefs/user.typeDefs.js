const userTypeDefs = `#graphql
    type User{
      _id: ID!
      username: String!
      name: String!
      password: String!
      profilePicture: String
      gender: String!
      transactions: [Transaction!]
    }
    
    type Query{
        user(userId:ID!): User
        authUser: User
    }

    type Mutation{
        signUp(input: SignupInput!):User
        login(input: LoginInput!):User
        logout: LogoutResponse
    }

    input SignupInput{
        username:String!
        name: String!
        password: String!
        gender: String!
    }
    input LoginInput{
        username: String!
        password: String!
    }

    type LogoutResponse{
        message: String!
    }

`;

export default userTypeDefs
