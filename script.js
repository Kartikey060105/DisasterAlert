// earthquake data //

async function fetchEarthquakeData() {
    const apiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const earthquakes = data.features;
        document.querySelector("#alerts-container").innerHTML = "";

        earthquakes.forEach((quake) => {
            const magnitude = quake.properties.mag;
            const place = quake.properties.place;
            const time = new Date(quake.properties.time).toLocaleTimeString();
            const url = quake.properties.url;
            const severity = magnitude >= 5 ? "high" : magnitude >= 3 ? "medium" : "low";

            let alertCard = document.createElement("div");
            alertCard.classList.add("alert-card");
            alertCard.innerHTML = `
                <h3>Earthquake Alert</h3>
                <p>Magnitude: ${magnitude} - ${place}</p>
                <span class="alert-time">${time}</span>
                <span class="alert-severity ${severity}">${severity.toUpperCase()} Priority</span>
                <a href="${url}" target="_blank">More Info</a>
            `;

            alertCard.style.backgroundColor = severity === "high" ? "red" : severity === "medium" ? "orange" : "lightgreen";
            document.querySelector("#alerts-container").appendChild(alertCard);
        });
    } catch (error) {
        console.error("Error fetching earthquake data:", error);
    }
}

fetchEarthquakeData();
setInterval(fetchEarthquakeData, 300000);


// Google map api //
let map, service, userLocation;

function initMap() {
    userLocation = { lat: 20.5937, lng: 78.9629 };

    map = new google.maps.Map(document.getElementById("map-frame"), {
        center: userLocation,
        zoom: 12
    });

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                map.setCenter(userLocation);

                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here",
                    icon: {
                        url: "https://maps.google.com/mapfiles/kml/shapes/man.png", 
                        scaledSize: new google.maps.Size(50, 50), 
                    }

                });
                console.log("User Location:", userLocation);
            },
            (error) => {
                console.error("Error getting location:", error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }

    map.addListener("click", (event) => {
        let lat = event.latLng.lat();
        let lng = event.latLng.lng();

        let googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        

        window.open(googleMapsUrl, "_blank");
    });
}

function findNearbyPlaces(placeType) {
    if (!userLocation) {
        alert("Location not found. Please enable location services.");
        return;
    }

    let request = {
        location: userLocation,
        radius: 5000,
        type: placeType
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach((place) => {
                let marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    icon: {
                        url: place.types.includes("hospital")
                            ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                            : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });
                google.maps.event.addListener(marker, "click", () => {
                    let googleMapsUrl = `https://www.google.com/maps/place/?q=${encodeURIComponent(place.name)}&ll=${place.geometry.location.lat()},${place.geometry.location.lng()}`;
                    window.open(googleMapsUrl, "_blank");
                });
            });
            console.log(results);
        } else {
            alert("No places found nearby.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initMap(); 
});