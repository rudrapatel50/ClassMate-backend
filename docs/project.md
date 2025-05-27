# Project Documentation

## Overview
The Project system manages academic projects, including project creation, member management, and project lifecycle tracking. All project routes require authentication.

## Project Model

### Schema

```javascript
{
  name: String,          // Required, trimmed
  description: String,   // Required, trimmed
  course: {
    name: String,        // Required, trimmed
    code: String         // Required, trimmed
  },
  dueDate: Date,         // Required
  status: String,        // Enum: ['planning', 'in-progress', 'review', 'completed']
  members: [{
    user: ObjectId,      // Reference to User model
    role: String,        // Enum: ['owner', 'leader', 'member']
    joinedAt: Date       // Default: current timestamp
  }],
  settings: {
    isPublic: Boolean,   // Default: false
    maxMembers: Number,  // Default: 5
    allowJoinRequests: Boolean  // Default: true
  }
}
```

### Indexes
- `course.code`
- `status`
- `members.user`

### Virtual Fields
- `groups`: References to associated Group documents

### Methods
- `isMember(userId)`: Checks if a user is a member of the project
- `getMemberRole(userId)`: Returns the role of a member in the project

### Statics
- `findUserProjects(userId)`: Finds all projects where the user is a member

## Routes

All routes require authentication via JWT token in the Authorization header.

### Project CRUD Routes

#### 1. Create Project
- **Endpoint**: `POST /projects`
- **Description**: Create a new project
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "course": {
      "name": "string",
      "code": "string"
    },
    "dueDate": "date",
    "settings": {
      "isPublic": boolean,
      "maxMembers": number,
      "allowJoinRequests": boolean
    }
  }
  ```
- **Response**: 201 Created
- **Note**: Creator becomes project owner

#### 2. Get User's Projects
- **Endpoint**: `GET /projects/my-projects`
- **Description**: Get all projects where the user is a member
- **Response**: 200 OK with array of projects

#### 3. Get Project
- **Endpoint**: `GET /projects/:projectId`
- **Description**: Get details of a specific project
- **Response**: 200 OK
- **Access Control**: 
  - Project members can access
  - Public projects are accessible to all authenticated users

#### 4. Update Project
- **Endpoint**: `PATCH /projects/:projectId`
- **Description**: Update project details
- **Request Body**: Any of the project fields
- **Access Control**: Only owners and leaders can update
- **Response**: 200 OK

#### 5. Delete Project
- **Endpoint**: `DELETE /projects/:projectId`
- **Description**: Delete a project
- **Access Control**: Only project owner can delete
- **Response**: 200 OK

### Member Management Routes

#### 1. Add Member
- **Endpoint**: `POST /projects/:projectId/members`
- **Description**: Add a new member to the project
- **Request Body**:
  ```json
  {
    "userId": "string",
    "role": "member" | "leader"
  }
  ```
- **Access Control**: 
  - Owners and leaders can add members
  - Only owners can add leaders
- **Response**: 200 OK

#### 2. Remove Member
- **Endpoint**: `DELETE /projects/:projectId/members`
- **Description**: Remove a member from the project
- **Request Body**:
  ```json
  {
    "userId": "string"
  }
  ```
- **Access Control**:
  - Owners and leaders can remove members
  - Leaders cannot remove other leaders or owners
  - Owner cannot be removed
- **Response**: 200 OK

## Error Handling

### Common Error Responses
- 400: Bad Request (Invalid input)
- 401: Unauthorized (Missing or invalid token)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found (Project not found)
- 500: Server Error

### Specific Error Cases
- Member limit exceeded
- User already a member
- Invalid member role
- Attempt to remove project owner
- Attempt to add leader by non-owner

## Access Control

### Project Roles
1. **Owner**
   - Full control over project
   - Can add/remove any member
   - Can add leaders
   - Can delete project
   - Cannot be removed

2. **Leader**
   - Can update project details
   - Can add/remove regular members
   - Cannot remove other leaders or owner
   - Cannot add other leaders

3. **Member**
   - Can view project details
   - No administrative privileges

### Project Visibility
- Private projects are only accessible to members
- Public projects are accessible to all authenticated users
- Project settings can be updated by owners and leaders 