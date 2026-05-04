const SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

function getSource() {
  const params = new URLSearchParams(window.location.search);
  return params.get("source") || "direct";
}

function sendToSheet(data) {
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

function logVisit() {
  sendToSheet({
    type: "visit",
    source: getSource(),
    referrer: document.referrer || "none",
    device: navigator.userAgent,
    page: "QR Hub"
  });
}

function logClick(clickedItem, destinationLink) {
  sendToSheet({
    type: "click",
    source: getSource(),
    clicked: clickedItem,
    link: destinationLink
  });
}

window.addEventListener("load", logVisit);

document.querySelectorAll(".track-click").forEach(button => {
  button.addEventListener("click", function () {
    logClick(this.dataset.clicked, this.href);
  });
});
