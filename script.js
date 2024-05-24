// Function to fetch the CSV file
async function fetchCSV() {
    const response = await fetch('addresses.csv');
    const data = await response.text();
    return data;
}

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

// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 5); // Centered in the US

// Add a tile layer to the map (OpenStreetMap tiles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let routeMarkers = [];
let addresses = [];
let currentAddressIndex = 0;

// Function to plot markers on the map
function plotMarkers(addresses) {
    addresses.forEach((address, index) => {
        const marker = L.marker([address.latitude, address.longitude]).addTo(map);
        marker.bindPopup(`<b>${address.name}</b><br>Latitude: ${address.latitude}<br>Longitude: ${address.longitude}`);
        routeMarkers.push(marker);
    });
}

// Function to get the optimal route using Google Maps API
async function getOptimalRoute(addresses) {
    const waypoints = addresses.slice(1, -1).map(address => ({
        location: `${address.latitude},${address.longitude}`,
        stopover: true
    }));

    const origin = `${addresses[0].latitude},${addresses[0].longitude}`;
    const destination = `${addresses[addresses.length - 1].latitude},${addresses[addresses.length - 1].longitude}`;

    const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints.map(wp => wp.location).join('|')}&key=YOUR_GOOGLE_MAPS_API_KEY`);
    const data = await response.json();
    return data.routes[0];
}

// Function to display the route on the map
function displayRoute(route) {
    const coordinates = [];
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            step.lat_lngs.forEach(latlng => {
                coordinates.push([latlng.lat(), latlng.lng()]);
            });
        });
    });

    const polyline = L.polyline(coordinates, { color: 'blue' }).addTo(map);
    map.fitBounds(polyline.getBounds());
}

// Function to highlight an address
function highlightAddress(index) {
    map.setView([routeMarkers[index].getLatLng().lat, routeMarkers[index].getLatLng().lng], 13);
    routeMarkers[index].openPopup();
}

// Fetch and process the CSV data
fetchCSV()
    .then(data => {
        addresses = parseCSV(data);
        return getOptimalRoute(addresses);
    })
    .then(route => {
        plotMarkers(addresses);
        displayRoute(route);
        numberAddresses(route);
    })
    .catch(error => console.error(error));

// Event listeners for buttons
document.getElementById('nextButton').addEventListener('click', () => {
    if (routeMarkers.length > 0) {
        currentAddressIndex = (currentAddressIndex + 1) % routeMarkers.length;
        highlightAddress(currentAddressIndex);
    }
});

document.getElementById('searchButton').addEventListener('click', () => {
    const searchValue = parseInt(document.getElementById('searchBar').value, 10);
    if (!isNaN(searchValue) && searchValue > 0 && searchValue <= routeMarkers.length) {
        highlightAddress(searchValue - 1);
        currentAddressIndex = searchValue - 1;
    } else {
        alert('Invalid address number');
    }
});
