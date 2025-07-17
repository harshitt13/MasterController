function getActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    callback(tab);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getActiveTab((tab) => {
    chrome.runtime.sendMessage({ type: "getSettings" }, (settings) => {
      document.getElementById("speedSlider").value = settings.speed;
      document.getElementById("speedValue").textContent = `${settings.speed.toFixed(2)}x`;

      document.getElementById("volumeSlider").value = settings.volume;
      document.getElementById("volumeValue").textContent = `${Math.round(settings.volume * 100)}%`;
    });
  });
});

function updateSettings(type, value) {
  getActiveTab((tab) => {
    chrome.runtime.sendMessage({
      type: "saveSettings",
      tabId: tab.id,
      speed: parseFloat(document.getElementById("speedSlider").value),
      volume: parseFloat(document.getElementById("volumeSlider").value)
    });

    chrome.tabs.sendMessage(tab.id, {
      type: type,
      [type === "setSpeed" ? "speed" : "volume"]: value
    });
  });
}

document.getElementById("speedSlider").oninput = (e) => {
  const speed = parseFloat(e.target.value);
  document.getElementById("speedValue").textContent = `${speed.toFixed(2)}x`;
  updateSettings("setSpeed", speed);
};

document.getElementById("volumeSlider").oninput = (e) => {
  const volume = parseFloat(e.target.value);
  document.getElementById("volumeValue").textContent = `${Math.round(volume * 100)}%`;
  updateSettings("setVolume", volume);
};