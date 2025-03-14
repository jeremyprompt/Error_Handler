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
    const namesByPhone = new Map();
    
    csvDataArray.forEach((csvData, index) => {
        console.log(`Processing CSV file ${index + 1}`);
        const rows = csvData.split('\n');
        
        // Find the header row containing "Name" and "Phone"
        let headerRowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            const columns = rows[i].split(',');
            const hasName = columns.some(col => col.trim() === 'Name');
            const hasPhone = columns.some(col => col.trim() === 'Phone');
            if (hasName && hasPhone) {
                headerRowIndex = i;
                console.log(`Found headers at row ${i + 1}:`, columns);
                break;
            }
        }

        if (headerRowIndex === -1) {
            console.error('No row containing both "Name" and "Phone" found');
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
        console.log(`Phone column index: ${phoneColumnIndex}, Name column index: ${nameColumnIndex}`);

        // Process only rows after the header row
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(',');
                // Log a sample of the data being processed
                if (i === headerRowIndex + 1) {
                    console.log("Sample row:", columns);
                }
                
                const phone = columns[phoneColumnIndex]?.trim() || '';
                const name = columns[nameColumnIndex]?.trim() || '';
                
                if (phone && name) {  // Only store if both phone and name exist
                    phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;
                    namesByPhone.set(phone, name);
                }
            }
        }
    });

    const threshold = parseInt(document.getElementById('rowCount').value) || 1;
    console.log("Using threshold:", threshold);

    // Generate output
    let displayContent = '';
    let csvContent = 'Name,Phone,Count\n';
    let totalCount = 0;


    for (const [phone, count] of Object.entries(phoneCounts)) {
        if (count >= threshold) {
            const name = namesByPhone.get(phone);
            csvContent += `${name},${phone},${count}\n`;
            displayContent += `${name}: ${phone} (${count} times)\n`;
            totalCount++;
        }
    }

    // Generate and download CSV
    const outputFileName = document.getElementById('outputFileName')?.value || 'phone_numbers_above_threshold';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${outputFileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

