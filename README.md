# Face Recognition Attendance System

A real-time face recognition attendance system built with Node.js, Express, MySQL, and face-api.js.

## Features

- **Real-time Face Detection**: Uses hybrid detection (TinyFaceDetector + SSD MobileNet)
- **Advanced Face Recognition**: Multi-metric matching with quality assessment
- **Student Registration**: Capture and store student face data
- **Attendance Tracking**: Automatic attendance marking with confidence scoring
- **Reports**: View attendance reports and statistics
- **Responsive UI**: Modern, user-friendly interface

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Face Recognition**: face-api.js library
- **Deployment**: Render.com

## Deployment to Render.com

### Prerequisites

1. A Render.com account
2. Your project pushed to a Git repository (GitHub, GitLab, etc.)

### Deployment Steps

1. **Fork/Clone this repository** to your Git account

2. **Connect to Render.com**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with your Git account
   - Click "New +" and select "Blueprint"

3. **Deploy using Blueprint**:
   - Connect your Git repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy all services

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Create Database**:
   - Go to Render Dashboard
   - Create a new MySQL database
   - Note down the connection details

2. **Create Backend Service**:
   - Create a new Web Service
   - Connect your Git repository
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && node server.js`
   - Add environment variables (see below)

3. **Create Frontend Service**:
   - Create a new Static Site
   - Connect your Git repository
   - Set build command: `cp -r frontend/* .`
   - Set publish directory: `.`

### Environment Variables

The following environment variables are automatically configured by the `render.yaml` file:

#### Backend Service:
- `NODE_ENV`: production
- `PORT`: 3000
- `DB_HOST`: Auto-configured from database
- `DB_USER`: Auto-configured from database
- `DB_PASSWORD`: Auto-configured from database
- `DB_NAME`: Auto-configured from database
- `DB_PORT`: Auto-configured from database

#### Frontend Service:
- `NODE_ENV`: production
- `CORS_ORIGIN`: Frontend URL

### Services Created

The `render.yaml` file creates the following services:

1. **face-recognition-backend**: Node.js API service
2. **face-recognition-frontend**: Static frontend site
3. **face-attendance-db**: MySQL database

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Git

### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd FaceRecognitionAttendanceSystem-updated
   ```

2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Set up database**:
   - Create a MySQL database named `face_attendance_system`
   - Run the SQL commands from `backend/db/schema.sql`

4. **Configure environment**:
   - Copy `backend/db/dbConnect.js` and update database credentials
   - Or set environment variables (see above)

5. **Start the server**:
   ```bash
   cd backend
   node server.js
   ```

6. **Open the application**:
   - Navigate to `http://localhost:3000`
   - Allow camera permissions for face recognition

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:usn` - Get student by USN
- `POST /api/students` - Register new student

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/summary/:sessionId` - Get attendance summary
- `GET /api/attendance/reports` - Get attendance reports

## Face Recognition Models

The system uses the following face-api.js models:
- **TinyFaceDetector**: Fast face detection
- **SSD MobileNet v1**: Accurate face detection
- **Face Landmark 68 Net**: Facial landmark detection
- **Face Recognition Net**: Face embedding generation

## Performance Optimizations

- **Hybrid Detection**: Combines speed and accuracy
- **Quality Assessment**: Filters low-quality face detections
- **Multi-metric Matching**: Uses Euclidean, Cosine, and Manhattan distances
- **Connection Pooling**: Optimized database connections
- **CORS Configuration**: Secure cross-origin requests

## Troubleshooting

### Common Issues

1. **Camera not working**:
   - Ensure HTTPS is enabled (required for camera access)
   - Check browser permissions
   - Try refreshing the page

2. **Face recognition not working**:
   - Check if face-api.js models are loading
   - Ensure good lighting conditions
   - Verify face is clearly visible

3. **Database connection issues**:
   - Verify database credentials
   - Check if database is running
   - Ensure proper network connectivity

### Logs

Check Render.com logs for:
- Backend service logs
- Database connection issues
- API endpoint errors

## Security Considerations

- **HTTPS**: Always use HTTPS in production
- **CORS**: Configured for secure cross-origin requests
- **Input Validation**: All inputs are validated
- **SQL Injection**: Uses parameterized queries
- **Face Data**: Encrypted storage recommended for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Render.com documentation
3. Create an issue in the repository 
