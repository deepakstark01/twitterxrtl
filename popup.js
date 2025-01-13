// popup.js

// Helper function to check connection with content script
const checkConnection = async (tabId) => {
  try {
    await chrome.tabs.sendMessage(tabId, { action: "ping" });
    return true;
  } catch (error) {
    console.log("Connection check failed:", error);
    return false;
  }
};

// Start button handler
const startButtonHandler = async () => {
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // If not on x.com, open it in a new tab
    if (!currentTab.url?.includes("x.com")) {
      await chrome.tabs.create({ url: "https://www.x.com" });
      return;
    }

    // Check connection with content script
    const isConnected = await checkConnection(currentTab.id);
    if (!isConnected) {
      alert("Please refresh the X page to activate the extension");
      return;
    }

    // Collect form data
    const data = {
      action: "start",
      keywords: document.getElementById("keywords").value,
      responses: document.getElementById("responses").value,
      replies: document.getElementById("replies").value,
      speed: document.getElementById("speed").value,
      followCriteria: document.getElementById("follow").checked,
      Retweet: document.getElementById("retweet").checked,
      isSessionActive: true
    };

    // Send message to content script
    await chrome.tabs.sendMessage(currentTab.id, data);
    console.log("Already on X (Twitter)");
    console.log("Start button clicked!");
  } catch (error) {
    console.error("Error in startButtonHandler:", error);
    alert("Failed to start automation. Please refresh the page and try again.");
  }
};

// Stop button handler
const stopButtonHandler = async () => {
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.tabs.sendMessage(currentTab.id, {
      action: "stop",
      isSessionActive: false
    });
    
    alert("Bot has Stopped");
  } catch (error) {
    console.error("Error in stopButtonHandler:", error);
    alert("Failed to stop automation. Please refresh the page and try again.");
  }
};

// Initialize popup
const initializePopup = () => {
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");

  if (startButton) {
    startButton.addEventListener("click", startButtonHandler);
  }

  if (stopButton) {
    stopButton.addEventListener("click", stopButtonHandler);
  }

  // Check initial connection
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]?.url?.includes("x.com")) {
      const isConnected = await checkConnection(tabs[0].id);
      if (!isConnected) {
        console.log("Extension not connected. Please refresh the X page.");
      }
    }
  });
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePopup);