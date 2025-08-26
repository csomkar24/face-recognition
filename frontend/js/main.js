// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize face recognition system
    window.faceRecognition.initFaceRecognition().then(() => {
        console.log('Face recognition system initialized');
    }).catch(error => {
        console.error('Failed to initialize face recognition:', error);
    });
    
    // Initialize tab navigation
    initTabs();
    
    // Initialize module functionality
    window.attendance.initAttendance();
    window.registration.initRegistration();
    window.reports.initReports();
});

// Initialize tab navigation
function initTabs() {
    const tabs = document.querySelectorAll('nav ul li a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target tab
            const targetTab = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab and content
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Handle specific tab actions
            handleTabChange(targetTab);
        });
    });
}

// Handle specific actions when changing tabs
function handleTabChange(tabId) {
    switch (tabId) {
        case 'register':
            // Start registration camera when switching to registration tab
            window.registration.startRegistrationCamera();
            break;
            
        case 'attendance':
            // Nothing special needed yet
            break;
            
        case 'reports':
            // Nothing special needed yet
            break;
            
        default:
            break;
    }
    
    // Stop registration camera when leaving registration tab
    if (tabId !== 'register') {
        window.registration.stopRegistrationCamera();
    }
    
    // Optional: End attendance session when leaving attendance tab
    if (tabId !== 'attendance') {
        // Only end if there's an active session you want to terminate
        // window.attendance.endAttendanceSession();
    }
}

// Handle application errors
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    alert(`An error occurred in ${context}. Please check the console for details.`);
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
});