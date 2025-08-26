// Global variables for attendance
let isAttendanceSessionActive = false;
let toggleCameraBtn;

// Initialize attendance functionality
function initAttendance() {
    // Get DOM elements
    toggleCameraBtn = document.getElementById('toggleCamera');
    const startSessionBtn = document.getElementById('startSession');
    
    // Add event listeners
    toggleCameraBtn.addEventListener('click', toggleCamera);
    startSessionBtn.addEventListener('click', startNewSession);
    
    console.log('Attendance system initialized');
}

// Toggle camera on/off
function toggleCamera() {
    if (!isAttendanceSessionActive) {
        alert('Please start a session before enabling the camera.');
        return;
    }
    
    const isCameraOn = toggleCameraBtn.textContent === 'Stop Camera';
    
    if (isCameraOn) {
        window.faceRecognition.stopCamera();
        toggleCameraBtn.textContent = 'Start Camera';
    } else {
        window.faceRecognition.startCamera();
        toggleCameraBtn.textContent = 'Stop Camera';
    }
}

// Start a new attendance session
async function startNewSession() {
    const semester = document.getElementById('sessionSemester').value;
    
    if (!semester || semester === '') {
        alert('Please select a semester before starting attendance.');
        return;
    }
    
    try {
        // Create a new session in the database
        const response = await fetch('/api/attendance/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ semester })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const sessionId = result.sessionId;
            
            // Update the UI
            document.getElementById('current-session').textContent = sessionId;
            document.getElementById('recognized-list').innerHTML = '';
            document.getElementById('present-count').textContent = '0';
            
            // Update global variables
            isAttendanceSessionActive = true;
            
            // Set the session ID for face recognition
            window.faceRecognition.setCurrentSession(sessionId);
            
            // Update status
            updateAttendanceStatus(`Session ${sessionId} started for Semester ${semester}`);
            
            // Enable camera button
            toggleCameraBtn.disabled = false;
            
            // Automatically start the camera
            toggleCamera();
        } else {
            alert(`Failed to create session: ${result.error}`);
        }
    } catch (error) {
        console.error('Error creating session:', error);
        alert('Failed to create session. Please try again.');
    }
}

// End the current attendance session
function endAttendanceSession() {
    if (!isAttendanceSessionActive) {
        return;
    }
    
    // Stop the camera if it's active
    if (toggleCameraBtn.textContent === 'Stop Camera') {
        window.faceRecognition.stopCamera();
        toggleCameraBtn.textContent = 'Start Camera';
    }
    
    // Reset session variables
    isAttendanceSessionActive = false;
    toggleCameraBtn.disabled = true;
    
    // Update status
    updateAttendanceStatus('Session ended');
}

// Update attendance status display
function updateAttendanceStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Fetch and update attendance summary for the current session
async function refreshAttendanceSummary(sessionId) {
    if (!sessionId) return;
    
    try {
        const response = await fetch(`/api/attendance/summary/${sessionId}`);
        const summary = await response.json();
        
        // Update UI elements
        document.getElementById('present-count').textContent = summary.present_count || 0;
        document.getElementById('total-count').textContent = summary.total_students || 0;
    } catch (error) {
        console.error('Error refreshing attendance summary:', error);
    }
}

// Export functions for use in other scripts
window.attendance = {
    initAttendance,
    endAttendanceSession,
    refreshAttendanceSummary
};