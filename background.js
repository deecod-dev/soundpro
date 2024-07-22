let tabs = {};
let tabval = {};

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  let ops = {
    "idk-man": async (msg) => {
      if (msg.tabId in tabval) {
        console.log("Volume for tabId:", tabval[msg.tabId]);
        sendResponse(tabval[msg.tabId]);
      } else {
        sendResponse(null);
      }
    },
    "get-tab-volume": (msg) => {
      let volume = getTabVolume(msg.tabId);
      console.log("Volume got:", volume);
      sendResponse(volume);
    },
    "set-tab-volume": async (msg) => {
      console.log("Setting volume");
      await setTabVolume(msg.tabId, msg.newVol);
      sendResponse(false);
    },
    undefined: (msg) => {
      return sendResponse(new Error("[ERR] function not implemented"));
    },
  };

  if (ops[message.name]) {
    ops[message.name](message);
  } else {
    sendResponse(new Error("[ERR] function not implemented"));
  }

  return true; // Indicates that the response is sent asynchronously
});

// Clean everything up once the tab is closed
chrome.tabs.onRemoved.addListener(disposeTab);

/**
 * Injects the content script and sets the volume.
 * @param tabId Tab ID
 * @param vol Volume
 */
async function setTabVolume(tabId, vol) {
  console.log("Set volume");

  if (!(tabId in tabs)) {
    await injectContentScript(tabId);
  }

  chrome.tabs.sendMessage(
    tabId,
    { action: "setVolume", volume: vol },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (response && response.success) {
        tabval[tabId] = vol;
        updateBadge(tabId, vol);
      }
    }
  );
}

/**
 * Injects the content script into the specified tab.
 * @param tabId Tab ID
 */
function injectContentScript(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content_script.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Returns a tab's volume.
 * @param tabId Tab ID
 */
function getTabVolume(tabId) {
  console.log("Get volume");
  return tabId in tabval ? tabval[tabId] : 1;
}

/**
 * Updates the badge to represent current volume.
 * @param tabId Tab ID
 * @param volume Volume
 */
function updateBadge(tabId, vol) {
  if (tabId in tabs) {
    const text = String(Math.round(vol * 100));
    chrome.action.setBadgeText({ text, tabId });
  }
}

/**
 * Disposes the tab's resources.
 * @param tabId Tab ID
 */
function disposeTab(tabId) {
  if (tabId in tabs) {
    delete tabs[tabId];
  }
}
