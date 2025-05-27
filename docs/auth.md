# Authentication Documentation

## Overview
The authentication system provides secure user registration, login, and logout functionality using JWT (JSON Web Tokens) for session management.

## Routes

### Public Routes

#### 1. Sign Up
- **Endpoint**: `POST /auth/signup`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Status: 201 (Created)
  - Body:
    ```json
    {
      "message": "User created successfully!",
      "token": "JWT_TOKEN",
      "user": {
        "id": "user_id",
        "email": "user_email",
        "firstName": "user_first_name",
        "lastName": "user_last_name",
        "role": "user_role"
      }
    }
    ```
- **Error Responses**:
  - 409: Email already exists
  - 500: Server error

#### 2. Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get access token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Status: 200 (OK)
  - Body:
    ```json
    {
      "token": "JWT_TOKEN",
      "user": {
        "id": "user_id",
        "email": "user_email",
        "firstName": "user_first_name",
        "lastName": "user_last_name",
        "role": "user_role"
      }
    }
    ```
- **Error Responses**:
  - 401: Authentication failed
  - 500: Server error

### Protected Routes

#### 1. Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: Log out the current user
- **Headers**: 
  - `Authorization: Bearer JWT_TOKEN`
- **Response**:
  - Status: 200 (OK)
  - Body:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
- **Error Responses**:
  - 401: Unauthorized
  - 500: Server error

## Security Features

1. **Password Hashing**
   - Passwords are hashed using bcrypt with a salt round of 10
   - Original passwords are never stored in the database

2. **JWT Authentication**
   - Tokens are signed using a secret key stored in environment variables
   - Tokens expire after 1 hour
   - Token payload includes user ID for identification

3. **Input Validation**
   - All authentication requests are validated using middleware
   - Email format and password requirements are enforced

## Middleware

### Auth Middleware
- Verifies JWT token in request headers
- Attaches user information to request object
- Required for protected routes

### Validation Middleware
- Validates signup and login request bodies
- Ensures required fields are present and properly formatted

## Error Handling
- Consistent error response format
- Appropriate HTTP status codes
- Descriptive error messages
- Server errors are logged but not exposed to clients 