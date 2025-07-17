let video = null;
let gainNode = null;
let audioContext = null;

chrome.runtime.sendMessage({ type: "getSettings" }, (settings) => {
  applySettings(settings.speed || 1.0, settings.volume || 1.0);
});

function applySettings(speed, volume) {
  video = document.querySelector("video");
  if (!video) return;

  video.playbackRate = speed;

  if (!audioContext) {
    audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(video);
    gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode).connect(audioContext.destination);
  } else {
    gainNode.gain.value = volume;
  }

  showOverlay(`Speed: ${speed.toFixed(2)}x<br>Volume: ${Math.round(volume * 100)}%`);
}

chrome.runtime.onMessage.addListener((request) => {
  if (!video) video = document.querySelector("video");
  if (!video) return;

  if (request.type === "setSpeed") {
    video.playbackRate = request.speed;
    showOverlay(`Speed: ${request.speed.toFixed(2)}x`);
  }

  if (request.type === "setVolume") {
    if (gainNode) gainNode.gain.value = request.volume;
    showOverlay(`Volume: ${Math.round(request.volume * 100)}%`);
  }
});

document.addEventListener("keydown", (e) => {
  if (!video) video = document.querySelector("video");
  if (!video) return;

  let newSpeed = video.playbackRate;
  if (e.key === 'a' || e.key === 'A') newSpeed = 1.0;
  else if (e.key === 's' || e.key === 'S') newSpeed = Math.min(newSpeed + 0.1, 3.0);
  else if (e.key === 'd' || e.key === 'D') newSpeed = Math.max(newSpeed - 0.1, 0.1);
  else return;

  newSpeed = Math.round(newSpeed * 100) / 100;
  video.playbackRate = newSpeed;
  showOverlay(`Speed: ${newSpeed.toFixed(2)}x`);

  chrome.runtime.sendMessage({ type: "saveSettings", tabId: -1, speed: newSpeed, volume: gainNode?.gain.value || 1.0 });
});

function showOverlay(text) {
  let overlay = document.getElementById("vv-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "vv-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "20px";
    overlay.style.left = "20px";
    overlay.style.padding = "10px 15px";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.color = "#fff";
    overlay.style.fontSize = "14px";
    overlay.style.zIndex = 99999;
    overlay.style.borderRadius = "8px";
    overlay.style.fontFamily = "Arial";
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = text;
  overlay.style.display = "block";

  clearTimeout(overlay._hideTimer);
  overlay._hideTimer = setTimeout(() => {
    overlay.style.display = "none";
  }, 2000);
}