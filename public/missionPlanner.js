function generateWaypoints(
    startLatitude,
    startLongitude,
    targetLatitude,
    targetLongitude,
    altitude
) {
    const waypoints = [];
    const numberOfSegments = 5;
    const droneSpeed = 5; // meters per second
    for (let i = 0; i <= numberOfSegments; i++) {
        const progress = i / numberOfSegments;

        const latitude =
            startLatitude + (targetLatitude - startLatitude) * progress;

        const longitude =
            startLongitude + (targetLongitude - startLongitude) * progress;

        waypoints.push({
            latitude: latitude,
            longitude: longitude,
            altitude: altitude
        });
    }
    let totalDistance = 0;

    for (let i = 1; i < waypoints.length; i++) {
        totalDistance += calculateDistance(
            waypoints[i - 1].latitude,
            waypoints[i - 1].longitude,
            waypoints[i].latitude,
            waypoints[i].longitude
        );
    }
const estimatedFlightTime = totalDistance / droneSpeed;
const batteryDrainPerSecond = 0.2;
const estimatedBatteryUsage = estimatedFlightTime * batteryDrainPerSecond;
const startingBattery = 100;
const minimumBatteryReserve = 20;
const estimatedBatteryRemaining = startingBattery - estimatedBatteryUsage;

const missionSafe =
    estimatedBatteryRemaining >= minimumBatteryReserve;
console.log("Total Flight Distance:", totalDistance.toFixed(2), "meters");
    return {
    waypoints: waypoints,
    totalDistance: totalDistance,
    estimatedFlightTime: estimatedFlightTime,
    estimatedBatteryUsage: estimatedBatteryUsage,
    estimatedBatteryRemaining: estimatedBatteryRemaining,
    missionSafe: missionSafe
};
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;

    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLat = (lat2 - lat1) * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}