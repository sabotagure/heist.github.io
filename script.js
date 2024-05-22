let map;
let locations = [];
let route = [];

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('findRouteBtn').addEventListener('click', findRoute, false);

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 39.8283, lng: -98.5795}  // Centered on the US
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const rows = d3.csvParse(text);
        locations = rows.map(row => ({
            name: row["location name"],  // Adjusted to match the CSV column name
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude)
        }));
        console.log(locations);  // Debugging: Check parsed locations
    };

    reader.readAsText(file);
}

function findRoute() {
    if (locations.length === 0) {
        alert("No locations loaded!");
        return;
    }

    let remainingLocations = [...locations];
    let currentLocation = remainingLocations[0];
    route = [currentLocation];
    remainingLocations.splice(0, 1);

    while (remainingLocations.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = distance(currentLocation, remainingLocations[0]);

        for (let i = 1; i < remainingLocations.length; i++) {
            const d = distance(currentLocation, remainingLocations[i]);
            if (d < nearestDistance) {
                nearestDistance = d;
                nearestIndex = i;
            }
        }

        currentLocation = remainingLocations[nearestIndex];
        route.push(currentLocation);
        remainingLocations.splice(nearestIndex, 1);
    }

    displayRoute();
    plotRouteOnMap();
}

function distance(loc1, loc2) {
    const R = 6371e3; // metres
    const φ1 = loc1.latitude * Math.PI/180;
    const φ2 = loc2.latitude * Math.PI/180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI/180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/
