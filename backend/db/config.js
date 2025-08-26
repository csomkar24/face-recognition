/**
 * Application Configuration
 * This file contains all the configuration settings for the face recognition attendance system
 */

// Server configuration
const serverConfig = {
    port: process.env.PORT || 3000,
    corsOptions: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  };
  
  // Face recognition configuration
  const faceRecognitionConfig = {
    // Confidence threshold for face recognition (0-1)
    minConfidence: 0.5,
    // Distance threshold for face matching (lower is stricter)
    distanceThreshold: 0.6,
    // Face detection options
    detectionOptions: {
      // SSD Mobilenet v1 options
      scoreThreshold: 0.5,
      inputSize: 224,
      scale: 0.8
    },
    // Models path relative to frontend
    modelsPath: './models'
  };
  
  // Attendance settings
  const attendanceConfig = {
    // How often to check for faces (in milliseconds)
    recognitionInterval: 1000,
    // How many successful recognitions needed to mark attendance
    requiredRecognitions: 3,
    // Default attendance status
    defaultStatus: 'Present'
  };
  
  // Export all configurations
  module.exports = {
    serverConfig,
    faceRecognitionConfig,
    attendanceConfig
  };