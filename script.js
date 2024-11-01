document.addEventListener("DOMContentLoaded", function () {
    if (typeof google !== 'undefined') initMap();
});

let player, map, markers = [], randomSong = {};

function onYouTubeIframeAPIReady() {
    loadRandomSong();
}

function loadRandomSong() {
    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            randomSong = data[Math.floor(Math.random() * data.length)];
            if (!randomSong.location) {
                console.error("Coordonnées manquantes :", randomSong);
                return;
            }
            player = new YT.Player("youtube-player", {
                height: "100%",
                width: "100%",
                videoId: randomSong.videoId,
                playerVars: { 'enablejsapi': 1 },
                events: { 'onReady': onPlayerReady }
            });
        })
        .catch(error => console.error("Erreur de chargement:", error));
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapId: 'MeloGuessrMap'
    });
    map.addListener("click", function (event) { placeMarker(event.latLng); });
}

function placeMarker(location) {
    const markerContent = document.createElement("div");
    markerContent.style.cssText = "padding: 10px; background-color: white; border: 1px solid black; border-radius: 5px;";
    markerContent.innerHTML = "Marqueur placé";
    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent
    });
    markers.push(marker);
    validateMarker(location);
}

function validateMarker(location) {
    if (!google.maps || !google.maps.geometry) {
        console.error("Google Maps non chargée.");
        return;
    }
    if (!randomSong.location) {
        console.error("Coordonnées non valides.");
        return;
    }
    const songLocation = new google.maps.LatLng(randomSong.location.lat, randomSong.location.lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(location, songLocation);
    console.log("Distance au lieu d'origine : " + (distance / 1000).toFixed(2) + " km");
}