// Function to fetch the CSV file
async function fetchCSV() {
    const response = await fetch('path/to/your/addresses.csv');
    const data = await response.text();
    return data;
}

// Call the function and log the result to verify
fetchCSV().then(data => console.log(data)).catch(error => console.error(error));
// Function to parse CSV data
function parseCSV(data) {
    const lines = data.split('\n');
    const headers = lines[0].split(',');

    const result = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        return obj;
    });

    return result;
}

// Fetch and parse the CSV data
fetchCSV()
    .then(data => {
        const parsedData = parseCSV(data);
        console.log(parsedData);
    })
    .catch(error => console.error(error));
