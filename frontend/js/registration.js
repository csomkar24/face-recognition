// Global variables for registration
let regVideo;
let regCanvas;
let regCtx;
let capturedFaceDescriptor = null;
let regVideoStream = null;

// Initialize the registration components
async function initRegistration() {
    try {
        // Initialize video and canvas elements
        regVideo = document.getElementById('reg-video');
        regCanvas = document.getElementById('reg-overlay');
        regCtx = regCanvas.getContext('2d');
        
        // Make sure face-api models are loaded
        if (!window.faceRecognition || !isModelLoaded) {
            await window.faceRecognition.initFaceRecognition();
        }
        
        // Setup capture button
        document.getElementById('captureBtn').addEventListener('click', captureFace);
        
        // Setup registration form
        document.getElementById('registration-form').addEventListener('submit', registerStudent);
        
        console.log('Registration system initialized');
    } catch (error) {
        console.error('Error initializing registration system:', error);
        updateCaptureStatus('Failed to initialize registration system');
    }
}

// Start the camera for face capture
async function startRegistrationCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        
        regVideo.srcObject = stream;
        regVideoStream = stream;
        
        // Resize canvas to match video dimensions
        regCanvas.width = regVideo.clientWidth;
        regCanvas.height = regVideo.clientHeight;
        
        updateCaptureStatus('Camera started. Position your face in the frame.');
    } catch (error) {
        console.error('Error accessing camera for registration:', error);
        updateCaptureStatus('Failed to access camera. Please check permissions.');
    }
}

// Stop the registration camera
function stopRegistrationCamera() {
    if (regVideoStream) {
        const tracks = regVideoStream.getTracks();
        tracks.forEach(track => track.stop());
        regVideo.srcObject = null;
        regVideoStream = null;
        
        // Clear canvas
        if (regCtx) {
            regCtx.clearRect(0, 0, regCanvas.width, regCanvas.height);
        }
    }
}

// Capture face for registration
async function captureFace() {
    if (!regVideo || !regVideo.srcObject) {
        updateCaptureStatus('Camera is not active. Please start the camera first.');
        return;
    }
    
    try {
        updateCaptureStatus('Capturing face...');
        
        // Detect face with landmarks and descriptor
        const detection = await faceapi
            .detectSingleFace(regVideo)
            .withFaceLandmarks()
            .withFaceDescriptor();
        
        if (!detection) {
            updateCaptureStatus('No face detected. Please position your face clearly in the frame.');
            return;
        }
        
        // Draw detection on canvas
        regCtx.clearRect(0, 0, regCanvas.width, regCanvas.height);
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { 
            label: 'Face Detected' 
        });
        drawBox.draw(regCanvas);
        
        // Store face descriptor
        capturedFaceDescriptor = Array.from(detection.descriptor);
        
        // Enable registration button
        document.getElementById('registerBtn').disabled = false;
        
        updateCaptureStatus('Face captured successfully! You can now register.');
    } catch (error) {
        console.error('Error capturing face:', error);
        updateCaptureStatus('Error capturing face. Please try again.');
    }
}

// Register a new student
async function registerStudent(event) {
    event.preventDefault();
    
    const usn = document.getElementById('studentUSN').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const semester = document.getElementById('studentSemester').value;
    
    if (!usn || !name || !semester) {
        updateCaptureStatus('Please fill in all fields');
        return;
    }
    
    if (!capturedFaceDescriptor) {
        updateCaptureStatus('No face captured. Please capture a face first.');
        return;
    }
    
    try {
        updateCaptureStatus('Registering student...');
        
        const response = await fetch('/api/students/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                USN: usn,
                Name: name,
                FaceData: JSON.stringify(capturedFaceDescriptor),
                Semester: semester
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            updateCaptureStatus('Student registered successfully!');
            
            // Reset form
            document.getElementById('registration-form').reset();
            capturedFaceDescriptor = null;
            regCtx.clearRect(0, 0, regCanvas.width, regCanvas.height);
            document.getElementById('registerBtn').disabled = true;
            
            // Reload student face data for recognition
            await window.faceRecognition.initFaceRecognition();
        } else {
            updateCaptureStatus(`Registration failed: ${result.error}`);
        }
    } catch (error) {
        console.error('Error registering student:', error);
        updateCaptureStatus('Registration failed. Please try again.');
    }
}

// Update registration status
function updateCaptureStatus(message) {
    const statusElement = document.getElementById('capture-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Export functions for use in other scripts
window.registration = {
    initRegistration,
    startRegistrationCamera,
    stopRegistrationCamera
};