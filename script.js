let map;
let locations = [];
let route = [];

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('findRouteBtn').addEventListener('click', findRoute, false);

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: { lat: 60.4518, lng: 22.2666 } // Centered on Turku, Finland
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const rows = d3.csvParse(text);
        locations = rows.map(row => ({
            name: row["Name"],
            latitude: parseFloat(row["Latitude"]),
            longitude: parseFloat(row["Longitude"])
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
    const φ1 = loc1.latitude * Math.PI / 180;
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function displayRoute() {
    const routeDiv = document.getElementById('route');
    routeDiv.innerHTML = '<h2>Route</h2><ol>' +
                         route.map(loc => `<li>${loc.name} (${loc.latitude}, ${loc.longitude})</li>`).join('') +
                         '</ol>';
}

function plotRouteOnMap() {
    const bounds = new google.maps.LatLngBounds();
    const routePath = route.map(loc => {
        const latLng = new google.maps.LatLng(loc.latitude, loc.longitude);
        bounds.extend(latLng);
        return latLng;
    });

    const path = new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    path.setMap(map);
    map.fitBounds(bounds);
}
