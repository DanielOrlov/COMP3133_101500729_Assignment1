import { gql } from "graphql-tag";

const userTypeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    created_at: String
    updated_at: String
  }

  type Query {
    users: [User]!
    user(username: String!): User
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): User

    updateUser(
      id: ID!
      username: String!
      email: String!
      password: String!
    ): User

    deleteUser(id: ID!): User

    login(username: String!, password: String!): AuthPayload
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

export default userTypeDefs;
