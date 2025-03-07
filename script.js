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
    console.log("Function started");
    const phoneCounts = {};
    const optOuts = new Set();
    const optOutDetails = new Map();
    const namesByPhone = new Map();
    
    // Get threshold value first to ensure it exists
    const thresholdInput = document.getElementById('threshold');
    if (!thresholdInput) {
        console.error("Threshold input not found");
        return;
    }
    const threshold = parseInt(thresholdInput.value) || 1;
    console.log("Threshold:", threshold);

    if (!csvDataArray || csvDataArray.length === 0) {
        console.error("No CSV data found");
        return;
    }
    console.log("Processing CSV data");
    
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
                    namesByPhone.set(phone, name);
                    if (phone.toLowerCase().includes('opt')) {
                        optOuts.add(phone);
                        optOutDetails.set(phone, name);
                    }
                }
            }
        }
    });

    // Generate output for browser display and CSV
    let displayContent = '';
    let csvContent = 'Name,Phone,Count\n';
    let totalCount = 0;

    console.log("Generating output");
    for (const [phone, count] of Object.entries(phoneCounts)) {
        if (count >= threshold) {
            const name = namesByPhone.get(phone) || '';
            csvContent += `${name},${phone},${count}\n`;
            displayContent += `${name}: ${phone} (${count} times)\n`;
            totalCount++;
        }
    }
    console.log("Total matches found:", totalCount);

    // Try to find the container element
    const container = document.querySelector('.container');
    if (!container) {
        console.error("Container not found, creating one");
        const newContainer = document.createElement('div');
        newContainer.className = 'container';
        document.body.appendChild(newContainer);
    }

    // Create or get the result div
    let resultDiv = document.getElementById('result');
    if (!resultDiv) {
        console.log("Creating new result div");
        resultDiv = document.createElement('div');
        resultDiv.id = 'result';
        const container = document.querySelector('.container') || document.body;
        container.appendChild(resultDiv);
    }
    
    console.log("Displaying results");
    // Display results in browser
    resultDiv.innerHTML = `Total contacts meeting or exceeding threshold: ${totalCount}\n\n${displayContent}`;
    resultDiv.style.whiteSpace = 'pre-line';

    // Get custom filename or use default
    const outputFileName = document.getElementById('outputFileName')?.value || 'phone_numbers_above_threshold';
    
    // Create and download the CSV file
    console.log("Creating CSV file");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${outputFileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("Function completed");
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
