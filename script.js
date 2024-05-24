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
// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 5); // Centered in the US

// Add a tile layer to the map (OpenStreetMap tiles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to plot markers on the map
function plotMarkers(addresses) {
    addresses.forEach(address => {
        const marker = L.marker([address.latitude, address.longitude]).addTo(map);
        marker.bindPopup(`<b>${address.name}</b><br>Latitude: ${address.latitude}<br>Longitude: ${address.longitude}`);
    });
}

// Fetch and parse the CSV data, then plot markers
fetchCSV()
    .then(data => {
        const parsedData = parseCSV(data);
        plotMarkers(parsedData);
    })
    .catch(error => console.error(error));
// Function to get the optimal route using Google Maps API
async function getOptimalRoute(addresses) {
    const waypoints = addresses.slice(1, -1).map(address => ({
        location: `${address.latitude},${address.longitude}`,
        stopover: true
    }));

    const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${addresses[0].latitude},${addresses[0].longitude}&destination=${addresses[addresses.length - 1].latitude},${addresses[addresses.length - 1].longitude}&waypoints=${waypoints.map(wp => wp.location).join('|')}&key=YOUR_API_KEY`);
    const data = await response.json();
    return data.routes[0];
}

// Fetch and parse the CSV data, then get the optimal route
fetchCSV()
    .then(data => {
        const parsedData = parseCSV(data);
        return getOptimalRoute(parsedData);
    })
    .then(route => {
        console.log(route); // Handle the route data
    })
    .catch(error => console.error(error));
function displayRoute(route) {
    const coordinates = route.legs.reduce((coords, leg) => {
        leg.steps.forEach(step => {
            step.path.forEach(point => {
                coords.push([point.lat, point.lng]);
            });
        });
        return coords;
    }, []);

    const polyline = L.polyline(coordinates, { color: 'blue' }).addTo(map);
    map.fitBounds(polyline.getBounds());
}

// Fetch, parse, optimize, and display the route
fetchCSV()
    .then(data => {
        const parsedData = parseCSV(data);
        return getOptimalRoute(parsedData);
    })
    .then(route => {
        displayRoute(route);
    })
    .catch(error => console.error(error));
function numberAddresses(route) {
    route.waypoint_order.forEach((index, order) => {
        const address = addresses[index + 1]; // Skip the origin
        L.marker([address.latitude, address.longitude], {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div class='marker-pin'></div><span>${order + 1}</span>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            })
        }).addTo(map);
    });
}

// Fetch, parse, optimize, display route, and number addresses
fetchCSV()
    .then(data => {
        const parsedData = parseCSV(data);
        return getOptimalRoute(parsedData);
    })
    .then(route => {
        displayRoute(route);
        numberAddresses(route);
    })
    .catch(error => console.error(error));
let currentAddressIndex = 0;
let routeMarkers = [];

function highlightAddress(index) {
    map.setView([routeMarkers[index].getLatLng().lat, routeMarkers[index].getLatLng().lng], 13);
    routeMarkers[index].openPopup();
}

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
