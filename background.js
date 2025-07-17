const tabSettings = {};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getSettings") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const settings = tabSettings[tab.id] || { speed: 1.0, volume: 1.0 };
      sendResponse(settings);
    });
    return true;
  }

  if (msg.type === "saveSettings") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const id = msg.tabId === -1 ? tab.id : msg.tabId;
      tabSettings[id] = { speed: msg.speed, volume: msg.volume };
    });
  }
});