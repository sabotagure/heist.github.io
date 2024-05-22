document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('findRouteBtn').addEventListener('click', findRoute, false);

let locations = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const rows = d3.csvParse(text);
        locations = rows.map(row => ({
            name: row.name,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude)
        }));
        console.log(locations);
    };

    reader.readAsText(file);
}

function findRoute() {
    if (locations.length === 0) {
        alert("No locations loaded!");
        return;
    }

    let route = [locations[0]];
    let currentLocation = locations[0];
    locations.splice(0, 1);

    while (locations.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = distance(currentLocation, locations[0]);

        for (let i = 1; i < locations.length; i++) {
            const d = distance(currentLocation, locations[i]);
            if (d < nearestDistance) {
                nearestDistance = d;
                nearestIndex = i;
            }
        }

        currentLocation = locations[nearestIndex];
        route.push(currentLocation);
        locations.splice(nearestIndex, 1);
    }

    displayRoute(route);
}

function distance(loc1, loc2) {
    const R = 6371e3; // metres
    const φ1 = loc1.latitude * Math.PI/180;
    const φ2 = loc2.latitude * Math.PI/180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI/180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function displayRoute(route) {
    const routeDiv = document.getElementById('route');
    routeDiv.innerHTML = '<h2>Route</h2><ol>' +
                         route.map(loc => `<li>${loc.name} (${loc.latitude}, ${loc.longitude})</li>`).join('') +
                         '</ol>';
}
