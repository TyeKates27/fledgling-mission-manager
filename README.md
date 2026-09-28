# Fledgling Mission Manager

Fledgling Mission Manager is a web application for creating, planning, and managing autonomous drone missions. The application was developed as an individual course project using AI-assisted development tools.

## Features

- Create drone missions using a target latitude, longitude, and altitude
- Generate a six-waypoint flight path from the drone's starting location to the target
- Calculate total flight distance and estimated flight time
- Estimate battery usage and remaining battery percentage
- Perform a mission safety check using a minimum battery reserve
- Display mission routes on an interactive Leaflet map
- Save mission data using Supabase
- View previously saved mission routes
- Edit existing missions
- Delete saved missions
- Display mission information in a dashboard-style interface

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express
- Supabase
- Leaflet
- OpenStreetMap
- Git and GitHub
- Netlify

## Database

Supabase is used to persist mission information. The application supports CRUD operations for mission records:

- Create missions
- Read saved missions
- Update existing missions
- Delete missions

## Mission Planning

The mission planner generates intermediate waypoints between a fixed starting location and the mission target. It calculates flight distance using the Haversine formula and estimates flight time based on drone speed.

The application also estimates battery consumption and verifies that the mission maintains a minimum 20% battery reserve.

## Running the Project Locally

1. Clone the repository.
2. Install the project dependencies:

   npm install

3. Start the server:

   node server.js

4. Open the application in a web browser at:

   http://localhost:3000

## Live Application

The deployed application is available at:

https://fledgling-mission-manager.netlify.app/

## Demo Video

Watch the 3–5 minute project demonstration on YouTube:

https://youtu.be/92WEsfVk24g

## Author

Tye Kates