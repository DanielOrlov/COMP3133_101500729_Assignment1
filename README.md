# Comp3133 - Full Stack

## Assignment 1 - building Employee Management API using GraphQL

## Student name: Daniil Orlov

## Student id: 101500729

### How to run the project:

1. Download the project or clone this repo to your machine
2. Run `npm i` to install all dependencies
3. **_IMPORTANT:_** make sure to create your own `.env` file in the project root, <br> with the following environment variables, otherwise the project won't run:
   - DB_NAME = ""
   - DB_USER_NAME = ""
   - DB_PASSWORD = ""
   - CLUSTER_ID = ""
   - PORT = 4000
   - CLOUDINARY_CLOUD_NAME = ""
   - CLOUDINARY_API_KEY = ""
   - CLOUDINARY_API_SECRET = ""
   - CLOUDINARY_URL = ""
   - JWT_EXPIRES = "5m"
   - JWT_SECRET = ""
4. Start the server by running `npm start`
   - **_Note:_** the server will start in the developer mode, so it will restart on saving the file
5. Open `http://localhost:4000/graphql` in your browser to play with it on the **_Apollo Server_**
6. Use the attached **Postman collection** to test pre-made requests
   - **_Note:_** to test login, use `admin` as both login and password

### Implemented:

1. User CRUD
   - passwords are stored as hashed strings
2. User Login using JWT
3. Employee CRUD
   - default avatar assigned at creation
   - new one can be uploaded and updated (use Postman Collection)
   - employee can be searched by `designation` or `department`
