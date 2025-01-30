# CSV Phone Number Analyzer

A web-based tool for analyzing phone number frequencies across multiple CSV files and generating opt-out lists.

## Features

- Multiple CSV file upload support
- Customizable row display for previewing CSV contents
- Phone number frequency counter across all uploaded files
- Automatic opt-out list generation based on frequency threshold
- Customizable output filename for the opt-out list

## Requirements

Your input CSV files must include:
- A "Phone" column header
- A "Name" column header
- Data must be comma-separated

## How to Use

1. **Set Your Threshold**
   - Enter a number in the "Threshold for opt-outs" field
   - This number determines how many occurrences of a phone number trigger an opt-out
   - Click "Set Threshold" to confirm

2. **Set Output Filename**
   - Enter your desired filename for the output CSV
   - The .csv extension will be added automatically
   - If left blank, defaults to "OptOuts.csv"

3. **Upload CSV Files**
   - Click the file upload button
   - Select one or multiple CSV files
   - A preview of each file will appear showing the first few rows

4. **Generate Results**
   - Click "Count Phone Numbers & Generate Opt-Outs"
   - The tool will:
     - Display a table showing all phone numbers and their frequencies
     - Automatically download a CSV file containing names and phone numbers that exceeded the threshold

## Example

If you set the threshold to 3 and upload multiple CSV files:
- Phone numbers that appear 3 or more times across all files will be included in the opt-out list
- The output CSV will contain the name and phone number for each entry that exceeded the threshold
- You'll see a count table showing how many times each number appeared

## Notes

- Phone numbers must match exactly to be counted as the same number
- For numbers that appear multiple times with different names, the first occurrence's name will be used
- Invalid characters in the output filename will be replaced with underscores
- The tool processes files locally in your browser - no data is sent to any server