let map;
let directionsService;
let directionsRenderer;
let waypoints = [];
let currentPointIndex = 0;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 60.4269585, lng: 22.268828 },
        zoom: 8,
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    fetch('locations.csv')
        .then(response => response.text())
        .then(data => {
            parseCSV(data);
            calculateAndDisplayRoute();
        });
}

function parseCSV(data) {
    const lines = data.split('\n');
    lines.forEach(line => {
        const [name, lat, lng] = line.split(',');
        if (name && lat && lng) {
            waypoints.push({
                location: new google.maps.LatLng(parseFloat(lat), parseFloat(lng)),
                stopover: true
            });
        }
    });
}

function calculateAndDisplayRoute() {
    if (waypoints.length < 2) return;

    directionsService.route({
        origin: waypoints[0].location,
        destination: waypoints[waypoints.length - 1].location,
        waypoints: waypoints.slice(1, -1),
        travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}

function nextPoint() {
    currentPointIndex = (currentPointIndex + 1) % waypoints.length;
    map.panTo(waypoints[currentPointIndex].location);
}

function showRoute() {
    const pointIndex = parseInt(document.getElementById('search').value);
    if (!isNaN(pointIndex) && pointIndex >= 0 && pointIndex < waypoints.length - 1) {
        directionsService.route({
            origin: waypoints[pointIndex].location,
            destination: waypoints[pointIndex + 1].location,
            travelMode: google.maps.TravelMode.DRIVING,
        }, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    }
}

window.onload = initMap;
