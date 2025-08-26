// Initialize reports functionality
function initReports() {
    // Get DOM elements
    const generateReportBtn = document.getElementById('generateReport');
    const exportReportBtn = document.getElementById('exportReport');
    const exportPDFBtn = document.getElementById('exportPDF');
    
    // Add event listeners
    generateReportBtn.addEventListener('click', generateAttendanceReport);
    exportReportBtn.addEventListener('click', exportReportToCSV);
    exportPDFBtn.addEventListener('click', exportReportToPDF);
    
    // Set default date to today
    document.getElementById('reportDate').valueAsDate = new Date();
    
    console.log('Reports system initialized');
}

// Generate attendance report based on selected filters
async function generateAttendanceReport() {
    const semester = document.getElementById('reportSemester').value;
    const date = document.getElementById('reportDate').value;
    
    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (semester === 'all') {
        alert('Please select a specific semester to generate the report.');
        clearReportData();
        return;
    }
    
    try {
        // 1. Get the total number of students for the semester
        const studentsCountResponse = await fetch(`/api/attendance/students/count/${semester}`);
        if (!studentsCountResponse.ok) {
            const errText = await studentsCountResponse.text();
            console.error('Error fetching student count:', errText);
            alert('Error fetching student count: ' + errText);
            clearReportData();
            return;
        }
        const studentsCount = await studentsCountResponse.json();
        const totalStudents = studentsCount.total_students || 0;

        // 2. Get the session for the selected date and semester
        const sessionsResponse = await fetch('/api/attendance/sessions/by-date', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, semester })
        });

        if (!sessionsResponse.ok) {
            const errText = await sessionsResponse.text();
            console.error('Error fetching sessions:', errText);
            alert('Error fetching sessions: ' + errText);
            clearReportData();
            return;
        }

        const sessions = await sessionsResponse.json();

        if (!Array.isArray(sessions) || sessions.length === 0) {
            alert('No attendance session found for the selected semester and date.\n\nPlease make sure you have started a session in the Take Attendance tab for this semester and date.');
            clearReportData();
            return;
        }

        // 3. Fetch attendance data for this session
        const sessionId = sessions[0].SessionID || sessions[0].sessionId;
        const attendanceResponse = await fetch(`/api/attendance/sessions/${sessionId}`);
        if (!attendanceResponse.ok) {
            const errText = await attendanceResponse.text();
            console.error('Error fetching attendance:', errText);
            alert('Error fetching attendance: ' + errText);
            clearReportData();
            return;
        }
        const attendanceData = await attendanceResponse.json();

        // 4. Fetch summary for this session
        const summaryResponse = await fetch(`/api/attendance/summary/${sessionId}`);
        if (!summaryResponse.ok) {
            const errText = await summaryResponse.text();
            console.error('Error fetching summary:', errText);
            alert('Error fetching summary: ' + errText);
            clearReportData();
            return;
        }
        const summary = await summaryResponse.json();

        // 5. Update the report UI with the fetched data
        updateReportUI(attendanceData, summary, sessions[0], totalStudents);
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please try again. See console for details.');
        clearReportData();
    }
}

// Update the report UI with the fetched data
function updateReportUI(attendanceData, summary, session, totalStudents) {
    // Show session ID in the report summary
    let reportSummaryDiv = document.querySelector('.report-summary');
    let sessionIdSpan = document.getElementById('report-session-id');
    if (!sessionIdSpan) {
        sessionIdSpan = document.createElement('span');
        sessionIdSpan.id = 'report-session-id';
        sessionIdSpan.style.marginLeft = '20px';
        sessionIdSpan.style.fontWeight = 'bold';
        reportSummaryDiv.appendChild(sessionIdSpan);
    }
    sessionIdSpan.textContent = `Session ID: ${session.SessionID || session.sessionId || ''}`;

    // Calculate present and absent
    const presentCount = summary.present_count || 0;
    const absentCount = Math.max(totalStudents - presentCount, 0);

    // Update summary information
    document.getElementById('report-total').textContent = totalStudents;
    document.getElementById('report-present').textContent = presentCount;
    document.getElementById('report-absent').textContent = absentCount;
    
    // Calculate attendance rate based on total students
    const attendanceRate = totalStudents > 0 
        ? ((presentCount / totalStudents) * 100).toFixed(1) 
        : '0.0';
    document.getElementById('report-rate').textContent = `${attendanceRate}%`;
    
    // Update table data
    const tableBody = document.getElementById('report-data');
    tableBody.innerHTML = '';
    
    if (attendanceData && attendanceData.length > 0) {
        attendanceData.forEach(student => {
            const row = document.createElement('tr');
            // USN cell
            const usnCell = document.createElement('td');
            usnCell.textContent = student.USN || student.usn || '';
            row.appendChild(usnCell);
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = student.Name || student.name || '';
            row.appendChild(nameCell);
            // Status cell
            const statusCell = document.createElement('td');
            statusCell.textContent = student.AttendanceStatus || student.attendanceStatus || 'Absent';
            statusCell.className = (student.AttendanceStatus || student.attendanceStatus) === 'Present' ? 'present' : 'absent';
            row.appendChild(statusCell);
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.textContent = 'No students found for this session.';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
}

// Export the current report to PDF
function exportReportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
    });

    // Light and formal color palette
    const mainColor = "#3498db"; // Light blue
    const borderColor = "#e0e6ed"; // Light gray
    const headerBg = "#f5f7fa"; // Very light gray
    const textColor = "#2c3e50"; // Dark blue-gray
    const tableHeaderBg = [52, 152, 219]; // RGB for #3498db
    const tableAltRow = [245, 247, 250]; // RGB for #f5f7fa

    // Header bar
    doc.setFillColor(headerBg);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 80, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(mainColor);
    doc.text("Attendance Report", doc.internal.pageSize.getWidth() / 2, 52, { align: "center" });

    // Summary box
    const boxX = 80;
    const boxY = 100;
    const boxW = doc.internal.pageSize.getWidth() - 160;
    const boxH = 110;
    doc.setFillColor("#fff");
    doc.roundedRect(boxX, boxY, boxW, boxH, 14, 14, "F");
    doc.setDrawColor(borderColor);
    doc.roundedRect(boxX, boxY, boxW, boxH, 14, 14, "S");

    // Summary fields in 2 rows, 3 columns
    const date = document.getElementById('reportDate').value;
    const semester = document.getElementById('reportSemester').value;
    const totalStudents = document.getElementById('report-total').textContent;
    const presentCount = document.getElementById('report-present').textContent;
    const absentCount = document.getElementById('report-absent').textContent;
    const attendanceRate = document.getElementById('report-rate').textContent;

    const labels = [
        "Date:", "Semester:", "Total Students:",
        "Present:", "Absent:", "Attendance Rate:"
    ];
    const values = [
        date,
        semester === 'all' ? 'All Semesters' : 'Semester ' + semester,
        totalStudents,
        presentCount,
        absentCount,
        attendanceRate
    ];

    // Grid layout
    const colW = boxW / 3;
    const row1Y = boxY + 38;
    const row2Y = boxY + 80;

    doc.setFontSize(13);
    for (let i = 0; i < 3; i++) {
        // Labels
        doc.setFont("helvetica", "bold");
        doc.setTextColor(mainColor);
        doc.text(labels[i], boxX + 18 + i * colW, row1Y);
        // Values
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor);
        doc.text(String(values[i]), boxX + 18 + i * colW, row1Y + 22);
    }
    for (let i = 0; i < 3; i++) {
        // Labels
        doc.setFont("helvetica", "bold");
        doc.setTextColor(mainColor);
        doc.text(labels[i + 3], boxX + 18 + i * colW, row2Y);
        // Values
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor);
        doc.text(String(values[i + 3]), boxX + 18 + i * colW, row2Y + 22);
    }

    // Table data
    const table = document.getElementById('report-table');
    const headers = [["USN", "Name", "Status"]];
    const body = [];
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        body.push([
            row.cells[0].textContent,
            row.cells[1].textContent,
            row.cells[2].textContent
        ]);
    }

    // Table with custom styles
    doc.autoTable({
        startY: boxY + boxH + 40,
        head: headers,
        body: body,
        theme: "striped",
        headStyles: {
            fillColor: tableHeaderBg,
            textColor: textColor,
            fontStyle: "bold",
            fontSize: 13,
            halign: "center"
        },
        bodyStyles: {
            fontSize: 12,
            textColor: textColor,
            halign: "center"
        },
        alternateRowStyles: {
            fillColor: tableAltRow
        },
        styles: {
            cellPadding: 8,
            minCellHeight: 22,
            lineColor: borderColor,
            lineWidth: 0.5,
        },
        tableLineColor: borderColor,
        tableLineWidth: 0.5,
        margin: { left: boxX, right: boxX }
    });

    // Save the PDF
    const fileName = `attendance_report_${semester !== 'all' ? 'sem_' + semester + '_' : ''}${date}.pdf`;
    doc.save(fileName);
}

// Export the current report to CSV
function exportReportToCSV() {
    const table = document.getElementById('report-table');
    if (!table || table.rows.length <= 1) {
        alert('No data to export.');
        return;
    }
    
    // Get the date from the report filter
    const date = document.getElementById('reportDate').value;
    const semester = document.getElementById('reportSemester').value;
    
    // Create CSV content
    let csv = 'USN,Name,Status\n';
    
    // Skip header row (index 0)
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const usn = row.cells[0].textContent;
        const name = row.cells[1].textContent;
        const status = row.cells[2].textContent;
        
        csv += `"${usn}","${name}","${status}"\n`;
    }
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${semester !== 'all' ? 'sem_' + semester + '_' : ''}${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear report data
function clearReportData() {
    document.getElementById('report-total').textContent = '0';
    document.getElementById('report-present').textContent = '0';
    document.getElementById('report-absent').textContent = '0';
    document.getElementById('report-rate').textContent = '0%';
    document.getElementById('report-data').innerHTML = '';
}

// Initialize reports when the page loads
document.addEventListener('DOMContentLoaded', initReports);

// Export functions for use in other scripts
window.reports = {
    initReports
};