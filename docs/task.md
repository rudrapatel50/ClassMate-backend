# Task Management Documentation

## Overview
The Task Management system provides functionality for creating, assigning, and tracking tasks within projects. It includes features for task dependencies, comments, and progress tracking.

## Task Model

### Schema

```javascript
{
  title: String,          // Required, trimmed
  description: String,    // Required, trimmed
  project: ObjectId,      // Reference to Project model
  assignee: ObjectId,     // Reference to User model
  creator: ObjectId,      // Reference to User model
  status: String,         // Enum: ['todo', 'in-progress', 'review', 'completed']
  priority: String,       // Enum: ['low', 'medium', 'high', 'urgent']
  dueDate: Date,          // Required
  startDate: Date,        // Default: current timestamp
  completedAt: Date,      // Set when task is completed
  dependencies: [ObjectId], // References to other tasks
  comments: [{
    user: ObjectId,       // Reference to User model
    content: String,      // Required
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  tags: [String],
  estimatedHours: Number,
  actualHours: Number
}
```

### Indexes
- `project` and `status`
- `assignee` and `status`
- `dueDate`
- `creator`

### Methods
- `isAssignee(userId)`: Checks if a user is assigned to the task
- `isCreator(userId)`: Checks if a user created the task
- `canBeCompleted()`: Checks if all dependencies are completed

### Statics
- `findProjectTasks(projectId)`: Finds all tasks in a project
- `findUserTasks(userId)`: Finds all tasks assigned to a user

## Routes

All routes require authentication via JWT token in the Authorization header.

### Task CRUD Routes

#### 1. Create Task
- **Endpoint**: `POST /tasks`
- **Description**: Create a new task
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "projectId": "string",
    "assigneeId": "string",
    "dueDate": "date",
    "priority": "low|medium|high|urgent",
    "dependencies": ["task_id"],
    "estimatedHours": number,
    "tags": ["string"]
  }
  ```
- **Access Control**: Project members only
- **Response**: 201 Created

#### 2. Get Project Tasks
- **Endpoint**: `GET /tasks/project/:projectId`
- **Description**: Get all tasks in a project
- **Access Control**: Project members or public project access
- **Response**: 200 OK with array of tasks

#### 3. Get User's Tasks
- **Endpoint**: `GET /tasks/my-tasks`
- **Description**: Get all tasks assigned to the current user
- **Response**: 200 OK with array of tasks

#### 4. Get Task
- **Endpoint**: `GET /tasks/:taskId`
- **Description**: Get details of a specific task
- **Access Control**: Project members or public project access
- **Response**: 200 OK

#### 5. Update Task
- **Endpoint**: `PATCH /tasks/:taskId`
- **Description**: Update task details
- **Request Body**: Any of the task fields
- **Access Control**: Task creator, assignee, or project leaders
- **Response**: 200 OK

#### 6. Delete Task
- **Endpoint**: `DELETE /tasks/:taskId`
- **Description**: Delete a task
- **Access Control**: Task creator or project owner
- **Response**: 200 OK

### Task Comment Route

#### 1. Add Comment
- **Endpoint**: `POST /tasks/:taskId/comments`
- **Description**: Add a comment to a task
- **Request Body**:
  ```json
  {
    "content": "string",
    "attachments": [{
      "name": "string",
      "url": "string",
      "type": "string"
    }]
  }
  ```
- **Access Control**: Project members only
- **Response**: 200 OK

## Task Dependencies

### Rules
1. Tasks can have multiple dependencies
2. Dependencies must be tasks within the same project
3. A task cannot be completed until all its dependencies are completed
4. Circular dependencies are prevented

### Implementation
- Dependencies are stored as an array of task references
- The `canBeCompleted()` method checks all dependencies
- Status changes to 'completed' are validated against dependencies

## Access Control

### Task Permissions
1. **Project Members**
   - Can view tasks in their projects
   - Can add comments
   - Can view task details

2. **Task Creator**
   - Can update task details
   - Can delete the task
   - Can assign the task

3. **Task Assignee**
   - Can update task status
   - Can update task progress
   - Can add comments

4. **Project Leaders/Owners**
   - Can update any task
   - Can reassign tasks
   - Can delete tasks

## Error Handling

### Common Error Responses
- 400: Bad Request (Invalid input)
- 401: Unauthorized (Missing or invalid token)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found (Task not found)
- 500: Server Error

### Specific Error Cases
- Invalid dependencies
- Attempt to complete task with incomplete dependencies
- Assignee not a project member
- Invalid task status transition
- Circular dependency detection 