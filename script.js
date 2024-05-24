// Function to fetch the CSV file
async function fetchCSV() {
    const response = await fetch('path/to/your/addresses.csv');
    const data = await response.text();
    return data;
}

// Call the function and log the result to verify
fetchCSV().then(data => console.log(data)).catch(error => console.error(error));
