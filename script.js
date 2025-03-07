let displayRowCount = 3;  // Now used as threshold for opt-outs
let csvDataArray = [];  // Store all CSV data

// Add this at the beginning to ensure the collapsible is initialized
document.addEventListener('DOMContentLoaded', function() {
    const coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
});

function validateRowCount() {
    const rowInput = document.getElementById('rowCount');
    const thresholdButton = document.getElementById('thresholdButton');
    const value = parseInt(rowInput.value);
    
    if (Number.isInteger(value) && value > 0) {
        displayRowCount = value;
        thresholdButton.textContent = "Threshold set! ✓";
        thresholdButton.classList.add('set');
    } else {
        alert('Please enter a valid positive integer');
        rowInput.value = displayRowCount;  // Reset to last valid value
        thresholdButton.textContent = "Set Threshold";
        thresholdButton.classList.remove('set');
    }
}

document.getElementById('csvFile').addEventListener('change', function(e) {
    csvDataArray = [];  // Reset the array when new files are uploaded
    const files = e.target.files;
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';  // Clear previous displays

    for (let file of files) {
        const reader = new FileReader();
        const preview = document.createElement('div');
        preview.className = 'csv-preview';
        preview.innerHTML = `<h3>${file.name}</h3>`;
        fileList.appendChild(preview);

        reader.onload = function(event) {
            const csvData = event.target.result;
            csvDataArray.push(csvData);  // Store the CSV data
            const rows = csvData.split('\n');
            const headers = rows[0].split(',');
            
            let table = '<table><thead><tr>';
            headers.forEach(header => {
                table += `<th>${header}</th>`;
            });
            table += '</tr></thead><tbody>';

            for (let i = 1; i < Math.min(rows.length, displayRowCount + 1); i++) {
                const cells = rows[i].split(',');
                table += '<tr>';
                cells.forEach(cell => {
                    table += `<td>${cell}</td>`;
                });
                table += '</tr>';
            }
            table += '</tbody></table>';
            
            if (rows.length > displayRowCount + 1) {
                table += `<p>... (showing first ${displayRowCount} rows)</p>`;
            }
            
            preview.innerHTML += table;
        };

        reader.readAsText(file);
    }
});

function countPhoneNumbers() {
    const phoneCounts = {};
    const optOuts = new Set();
    const optOutDetails = new Map();
    
    csvDataArray.forEach(csvData => {
        const rows = csvData.split('\n');
        
        // Find the header row containing "Name" and "Phone"
        let headerRowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            const columns = rows[i].split(',');
            const hasName = columns.some(col => col.trim() === 'Name');
            const hasPhone = columns.some(col => col.trim() === 'Phone');
            if (hasName && hasPhone) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
            alert('No row containing both "Name" and "Phone" found in one or more CSV files');
            return;
        }

        // Get headers from the identified header row
        const headers = rows[headerRowIndex].split(',');
        const phoneColumnIndex = headers.findIndex(header => 
            header.trim() === 'Phone'
        );
        const nameColumnIndex = headers.findIndex(header => 
            header.trim() === 'Name'
        );

        // Process only rows after the header row
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {  // Skip empty rows
                const columns = row.split(',');
                const phone = columns[phoneColumnIndex]?.trim() || '';
                const name = columns[nameColumnIndex]?.trim() || '';
                
                if (phone) {
                    phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;
                    if (phone.toLowerCase().includes('opt')) {
                        optOuts.add(phone);
                        optOutDetails.set(phone, name);
                    }
                }
            }
        }
    });

    // Display results
    const phoneCountDiv = document.getElementById('phoneCount');
    const countResults = document.getElementById('countResults');
    
    if (Object.keys(phoneCounts).length === 0) {
        phoneCountDiv.innerHTML = '<p>No phone numbers found or no files uploaded.</p>';
        return;
    }

    let resultHtml = '<table>';
    resultHtml += '<tr><th>Phone Number</th><th>Count</th></tr>';
    
    Object.entries(phoneCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([phone, count]) => {
            resultHtml += `<tr><td>${phone}</td><td>${count}</td></tr>`;
        });
    
    resultHtml += '</table>';
    phoneCountDiv.innerHTML = resultHtml;
    
    // Update the collapsible button text to show count
    const totalNumbers = Object.keys(phoneCounts).length;
    countResults.textContent = `View Phone Number Counts (${totalNumbers} total)`;
    
    // Generate CSV with custom filename
    if (optOuts.size > 0) {
        let csvContent = "Name,Phone\n";
        optOuts.forEach(phone => {
            csvContent += `${optOutDetails.get(phone)},${phone}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Get custom filename or use default
        let fileName = document.getElementById('outputFileName').value.trim();
        fileName = fileName || 'OptOuts'; // Use 'OptOuts' if input is empty
        fileName = fileName.replace(/[^a-z0-9]/gi, '_'); // Replace invalid characters
        
        a.setAttribute('href', url);
        a.setAttribute('download', `${fileName}.csv`);
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Modal functions
function openModal() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('helpModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
