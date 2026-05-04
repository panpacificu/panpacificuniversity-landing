const SCRIPT_URL = "https://script.google.com/a/macros/panpacificu.edu.ph/s/AKfycbxN2vocL7r6q2TnZDtQURQsmyaF57jUtpMrIGUd7iv15GTV07B0PsV3VpopajUs5Q1UGw/exec";

const locationModal = document.getElementById("locationModal");
const allowLocationBtn = document.getElementById("allowLocationBtn");
const skipLocationBtn = document.getElementById("skipLocationBtn");

function sendToSheet(data) {
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(data)
  });
}

async function getLocationDetails() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        town: "Location Not Supported",
        latitude: "",
        longitude: "",
        accuracy: ""
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const data = await response.json();
          const address = data.address || {};

          const town =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.suburb ||
            address.county ||
            "Unknown";

          resolve({
            town: town,
            latitude: lat,
            longitude: lng,
            accuracy: accuracy
          });
        } catch (error) {
          resolve({
            town: "Reverse Geocoding Failed",
            latitude: lat,
            longitude: lng,
            accuracy: accuracy
          });
        }
      },
      (error) => {
        let message = "Location Error";

        if (error.code === 1) message = "Location Permission Denied";
        if (error.code === 2) message = "Location Unavailable";
        if (error.code === 3) message = "Location Timeout";

        resolve({
          town: message,
          latitude: "",
          longitude: "",
          accuracy: ""
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
}

async function logVisitWithLocation() {
  const location = await getLocationDetails();

  sendToSheet({
    type: "visit",
    town: location.town,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    referrer: document.referrer || "none",
    device: navigator.userAgent,
    page: "QR Hub"
  });
}

function logVisitWithoutLocation() {
  sendToSheet({
    type: "visit",
    town: "Skipped Location",
    latitude: "",
    longitude: "",
    accuracy: "",
    referrer: document.referrer || "none",
    device: navigator.userAgent,
    page: "QR Hub"
  });
}

function logClick(clickedItem, destinationLink) {
  sendToSheet({
    type: "click",
    clicked: clickedItem,
    link: destinationLink,
    page: "QR Hub"
  });
}

allowLocationBtn.addEventListener("click", async () => {
  locationModal.style.display = "none";
  await logVisitWithLocation();
});

skipLocationBtn.addEventListener("click", () => {
  locationModal.style.display = "none";
  logVisitWithoutLocation();
});

document.querySelectorAll(".track-click").forEach(button => {
  button.addEventListener("click", function () {
    logClick(this.dataset.clicked, this.href);
  });
});
