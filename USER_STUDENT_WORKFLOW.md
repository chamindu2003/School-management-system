# User-Student Workflow Documentation

## Architecture Overview

The system now properly separates **User** (authentication/login) from **Student** (academic data).

### Models

#### 1. UserModel
- **Purpose**: Handles authentication and role management
- **Fields**:
  - `name`: String (required)
  - `email`: String (required)
  - `password`: String (required)
  - `role`: Enum ['student', 'teacher', 'admin'] (default: 'student')

#### 2. StudentModel
- **Purpose**: Stores academic information
- **Fields**:
  - `userId`: ObjectId reference to UserModel (required, unique)
  - `name`: String (required)
  - `email`: String (required)
  - `rollNumber`: String (required, unique)
  - `class`: String (required)
  - `phone`: String
  - `dateOfBirth`: String
  - `address`: String

#### 3. ClassModel
- **Purpose**: Manages class structure and student assignments
- **Fields**:
  - `name`: String (required, unique)
  - `section`: String
  - `subjects`: Array of Strings
  - `students`: Array of ObjectId references to Student
  - `teacher`: ObjectId reference to Teacher

---

## Complete Workflow

### Step 1: Admin Creates User Account (Login Credentials)
**Endpoint**: `POST /api/users`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@school.com",
  "password": "password123",
  "role": "student"
}
```

**Response**:
```json
{
  "user": {
    "_id": "userId123",
    "name": "John Doe",
    "email": "john@school.com",
    "role": "student"
  }
}
```

---

### Step 2: Admin Creates Student Profile (Academic Data)
**Endpoint**: `POST /api/students`

**Request Body**:
```json
{
  "userId": "userId123",
  "name": "John Doe",
  "email": "john@school.com",
  "rollNumber": "2025001",
  "class": "10-A",
  "phone": "1234567890",
  "dateOfBirth": "2010-05-15",
  "address": "123 Main St"
}
```

**Validations**:
- `userId` must exist in UserModel
- User must have `role: 'student'`
- One user can only have ONE student profile (unique userId)
- Roll number must be unique

**Response**:
```json
{
  "student": {
    "_id": "studentId456",
    "userId": "userId123",
    "name": "John Doe",
    "rollNumber": "2025001",
    "class": "10-A"
  }
}
```

---

### Step 3: Admin Assigns Student to Class
**Endpoint**: `POST /api/classes/assign-student`

**Request Body**:
```json
{
  "classId": "classId789",
  "studentId": "studentId456"
}
```

**What Happens**:
1. Validates class exists
2. Validates student exists
3. Adds student to class's `students` array
4. Updates student's `class` field with class name

**Response**:
```json
{
  "message": "Student assigned to class",
  "cls": {
    "_id": "classId789",
    "name": "10-A",
    "students": ["studentId456"]
  },
  "student": {
    "_id": "studentId456",
    "class": "10-A"
  }
}
```

---

## Student Login Flow

### Student Logs In
**Endpoint**: `POST /api/users/login`

**Request**:
```json
{
  "email": "john@school.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "user": {
    "_id": "userId123",
    "name": "John Doe",
    "email": "john@school.com",
    "role": "student"
  }
}
```

### Get Student Academic Profile
**Endpoint**: `GET /api/students/by-user/:userId`

**Example**: `GET /api/students/by-user/userId123`

**Response**:
```json
{
  "student": {
    "_id": "studentId456",
    "userId": {
      "_id": "userId123",
      "name": "John Doe",
      "email": "john@school.com",
      "role": "student"
    },
    "rollNumber": "2025001",
    "class": "10-A",
    "phone": "1234567890"
  }
}
```

---

## Additional Endpoints

### Get Student by ID (with User info populated)
**Endpoint**: `GET /api/students/:id`
- Returns student with populated userId field

### Get Class with Students
**Endpoint**: `GET /api/classes/:id`
- Returns class with populated students array

### Remove Student from Class
**Endpoint**: `POST /api/classes/remove-student`

**Request**:
```json
{
  "classId": "classId789",
  "studentId": "studentId456"
}
```

---

## Key Benefits

1. **Separation of Concerns**: Login credentials (User) separate from academic data (Student)
2. **Security**: User passwords and roles managed independently
3. **Flexibility**: Same user system for students, teachers, and admins
4. **Data Integrity**: 
   - One-to-one relationship between User and Student (enforced by unique userId)
   - Unique roll numbers
   - Proper referential integrity with ObjectId references

---

## Error Handling

- **404**: User/Student/Class not found
- **400**: Invalid role, missing required fields
- **409**: Duplicate email, duplicate roll number, student profile already exists
- **500**: Server errors
