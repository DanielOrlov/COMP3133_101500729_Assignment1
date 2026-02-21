import { gql } from "graphql-tag";

const employeeTypeDefs = gql`
  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
    created_at: String
    updated_at: String
  }

  extend type Query {
    employees: [Employee]!
    employee(id: ID!): Employee
  }

  extend type Mutation {
    createEmployee(
      first_name: String!
      last_name: String!
      email: String!
      gender: String!
      designation: String!
      salary: Float!
      department: String!
    ): Employee

    updateEmployee(
      id: ID!
      first_name: String!
      last_name: String!
      email: String!
      gender: String!
      designation: String!
      salary: Float!
      department: String!
    ): Employee

    deleteEmployee(id: ID!): Employee
  }
`;

export default employeeTypeDefs;
