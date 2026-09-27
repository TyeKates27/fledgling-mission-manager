const SUPABASE_URL = "https://packbrbfisardloxclpd.supabase.co";
const SUPABASE_KEY = "sb_publishable_nz3mDRvRMGFu-yhxuDmb6A_xGG33xl8";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const map = L.map("missionMap").setView([26.1650, -80.2580], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const missionLayer = L.layerGroup().addTo(map);

const form = document.querySelector("form");
const statusText = document.querySelector("#missionStatus");

let editingMissionId = null;

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const missionName = document.querySelector("#missionName").value;
    const latitude = document.querySelector("#latitude").value;
    const longitude = document.querySelector("#longitude").value;
    const altitude = document.querySelector("#altitude").value;

    if (!missionName || !latitude || !longitude || !altitude) {
        alert("Please complete all mission fields.");
        return;
    }

const targetLatitude = parseFloat(latitude);
const targetLongitude = parseFloat(longitude);
const targetAltitude = parseFloat(altitude);

if (
    targetLatitude < -90 ||
    targetLatitude > 90 ||
    targetLongitude < -180 ||
    targetLongitude > 180 ||
    targetAltitude <= 0
) {
    alert("Invalid mission coordinates or altitude.");
    return;
}

const startLatitude = 26.1650;
const startLongitude = -80.2580;

const missionPlan = generateWaypoints(
    startLatitude,
    startLongitude,
    targetLatitude,
    targetLongitude,
    targetAltitude
);

const waypoints = missionPlan.waypoints;
const totalDistance = missionPlan.totalDistance;
const estimatedFlightTime = missionPlan.estimatedFlightTime;
const estimatedBatteryUsage = missionPlan.estimatedBatteryUsage;
const estimatedBatteryRemaining = missionPlan.estimatedBatteryRemaining;
const missionSafe = missionPlan.missionSafe;

missionLayer.clearLayers();

const routeCoordinates = waypoints.map((waypoint) => [
    waypoint.latitude,
    waypoint.longitude
]);

L.polyline(routeCoordinates).addTo(missionLayer);

waypoints.forEach((waypoint, index) => {
    let label = `Waypoint ${index + 1}`;

    if (index === 0) {
        label = "START";
    } else if (index === waypoints.length - 1) {
        label = "TARGET";
    }

    L.marker([waypoint.latitude, waypoint.longitude])
        .addTo(missionLayer)
        .bindPopup(
            `<strong>${label}</strong><br>
            Latitude: ${waypoint.latitude.toFixed(4)}<br>
            Longitude: ${waypoint.longitude.toFixed(4)}<br>
            Altitude: ${waypoint.altitude} meters`
        );
});

map.fitBounds(routeCoordinates);

const safetyStatus = missionSafe
    ? "SAFE TO FLY"
    : "INSUFFICIENT BATTERY";
    
const safetyMessage = missionSafe
    ? "Mission meets the minimum 20% battery reserve."
    : "WARNING: Mission would exceed the minimum 20% battery reserve.";

    const missionData = {
    mission_name: missionName,
    target_latitude: targetLatitude,
    target_longitude: targetLongitude,
    altitude: targetAltitude,
    total_distance: totalDistance,
    flight_time: estimatedFlightTime,
    battery_usage: estimatedBatteryUsage,
    battery_remaining: estimatedBatteryRemaining,
    safety_status: safetyStatus
};

let databaseResult;

if (editingMissionId === null) {
    databaseResult = await supabaseClient
        .from("missions")
        .insert([missionData]);
} else {
    databaseResult = await supabaseClient
        .from("missions")
        .update(missionData)
        .eq("id", editingMissionId);
}

if (databaseResult.error) {
    console.error("Database error:", databaseResult.error);
    alert("Mission was created, but the database operation failed.");
} else {
    if (editingMissionId !== null) {
        alert("Mission updated successfully.");
    }

    editingMissionId = null;

    document.querySelector('button[type="submit"]').textContent =
        "Create Mission";

    loadSavedMissions();
}


    console.log("Generated Waypoints:", waypoints);
    const waypointDisplay = waypoints.map((waypoint, index) => {
    return `
        Waypoint ${index + 1}: 
        ${waypoint.latitude.toFixed(4)}, 
        ${waypoint.longitude.toFixed(4)}, 
        ${waypoint.altitude} meters<br>
    `;
    }).join("");
    statusText.innerHTML = `
    <div class="mission-summary">
        <div class="status-card">
            <span>Flight Distance</span>
            <strong>${totalDistance.toFixed(2)} m</strong>
        </div>

        <div class="status-card">
            <span>Flight Time</span>
            <strong>${estimatedFlightTime.toFixed(2)} s</strong>
        </div>

        <div class="status-card">
            <span>Battery Left</span>
            <strong>${estimatedBatteryRemaining.toFixed(2)}%</strong>
        </div>

        <div class="status-card">
            <span>Mission Safety</span>
            <strong>${safetyStatus}</strong>
        </div>
    </div>

    <div class="mission-details">
        <strong>Mission:</strong> ${missionName}<br>
        <strong>Target:</strong> ${latitude}, ${longitude}<br>
        <strong>Altitude:</strong> ${altitude} meters<br>
        <strong>Status:</strong> Mission Created<br>
        <strong>Battery Usage:</strong> ${estimatedBatteryUsage.toFixed(2)}%<br>
        <strong>Safety Check:</strong> ${safetyMessage}
    </div>

    <div class="flight-path">
        <strong>Generated Flight Path</strong>
        <div class="waypoint-list">
            ${waypointDisplay}
        </div>
    </div>
`;
});



async function loadSavedMissions() {
    const savedMissions = document.querySelector("#savedMissions");

    const { data, error } = await supabaseClient
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading missions:", error);
        savedMissions.innerHTML = "<p>Unable to load saved missions.</p>";
        return;
    }

    if (data.length === 0) {
        savedMissions.innerHTML = "<p>No saved missions yet.</p>";
        return;
    }

    savedMissions.innerHTML = data.map((mission) => {
        return `
            <div>
                <h3>${mission.mission_name}</h3>
                <p>
                    Target: ${mission.target_latitude}, ${mission.target_longitude}<br>
                    Altitude: ${mission.altitude} meters<br>
                    Distance: ${mission.total_distance.toFixed(2)} meters<br>
                    Flight Time: ${mission.flight_time.toFixed(2)} seconds<br>
                    Battery Usage: ${mission.battery_usage.toFixed(2)}%<br>
                    Battery Remaining: ${mission.battery_remaining.toFixed(2)}%<br>
                    Safety: ${mission.safety_status}
                </p>

                <button onclick="viewMissionRoute('${mission.id}')">
                    View Route
                </button>

                <button onclick="editMission(${mission.id})">
                    Edit Mission
                </button>

                <button onclick="deleteMission(${mission.id})">
                    Delete Mission
                </button>

                <hr>
            </div>
        `;
    }).join("");
}

async function editMission(id) {
    const { data, error } = await supabaseClient
        .from("missions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error loading mission for editing:", error);
        alert("Mission could not be loaded for editing.");
        return;
    }

    document.querySelector("#missionName").value = data.mission_name;
    document.querySelector("#latitude").value = data.target_latitude;
    document.querySelector("#longitude").value = data.target_longitude;
    document.querySelector("#altitude").value = data.altitude;

    editingMissionId = data.id;

    document.querySelector('button[type="submit"]').textContent =
        "Update Mission";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
async function viewMissionRoute(missionId) {
    const { data, error } = await supabaseClient
        .from("missions")
        .select("*")
        .eq("id", missionId)
        .single();

    if (error) {
        console.error("Error loading mission route:", error);
        alert("Unable to load this mission route.");
        return;
    }

    const startLatitude = 26.1650;
    const startLongitude = -80.2580;

    const missionPlan = generateWaypoints(
        startLatitude,
        startLongitude,
        parseFloat(data.target_latitude),
        parseFloat(data.target_longitude),
        parseFloat(data.altitude)
    );

    const waypoints = missionPlan.waypoints;

    missionLayer.clearLayers();

    const routeCoordinates = waypoints.map((waypoint) => [
        waypoint.latitude,
        waypoint.longitude
    ]);

    L.polyline(routeCoordinates).addTo(missionLayer);

    waypoints.forEach((waypoint, index) => {
        L.marker([waypoint.latitude, waypoint.longitude])
            .addTo(missionLayer)
            .bindPopup(`Waypoint ${index + 1}`);
    });

    map.fitBounds(routeCoordinates);

    document.querySelector("#missionMap").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}
async function deleteMission(id) {
    const confirmed = confirm("Are you sure you want to delete this mission?");

    if (!confirmed) {
        return;
    }

    const { error } = await supabaseClient
        .from("missions")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting mission:", error);
        alert("Mission could not be deleted.");
        return;
    }

    console.log("Mission deleted successfully.");
    loadSavedMissions();
}

loadSavedMissions();