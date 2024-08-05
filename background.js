let tabs = {};
let tabval = {};
let preferredDevice = {};
let tabMuteStatus = {}; // Store mute status and previous volume for each tab

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
    "set-active-device": async (msg) => {
      preferredDevice[msg.tabId] = msg.deviceName;
      sendResponse({ success: true });
    },
    "get-active-device": (msg) => {
      sendResponse(preferredDevice[msg.tabId] || null);
    },
    "toggle-mute": async (msg) => {
      await toggleMute(msg.tabId);
      sendResponse(true);
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

  return true;
});

chrome.tabs.onRemoved.addListener(disposeTab);

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

async function toggleMute(tabId) {
  console.log("Toggling mute");

  if (!(tabId in tabs)) {
    await injectContentScript(tabId);
  }

  let muteStatus = tabMuteStatus[tabId] || {
    isMuted: false,
    previousVolume: 1,
  };
  let newVolume = muteStatus.isMuted ? muteStatus.previousVolume : 0;

  chrome.tabs.sendMessage(
    tabId,
    { action: "setVolume", volume: newVolume },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (response && response.success) {
        if (!muteStatus.isMuted) {
          tabMuteStatus[tabId] = {
            isMuted: true,
            previousVolume: tabval[tabId],
          };
          tabval[tabId] = 0;
        } else {
          tabval[tabId] = muteStatus.previousVolume;
          tabMuteStatus[tabId].isMuted = false;
        }
        updateBadge(tabId, newVolume);
      }
    }
  );
}

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

function getTabVolume(tabId) {
  console.log("Get volume");
  return tabId in tabval ? tabval[tabId] : 1;
}

function updateBadge(tabId, vol) {
  if (tabId in tabs) {
    const text = String(Math.round(vol * 100));
    chrome.action.setBadgeText({ text, tabId });
  }
}

function disposeTab(tabId) {
  if (tabId in tabs) {
    delete tabs[tabId];
    delete preferredDevice[tabId];
    delete tabMuteStatus[tabId];
  }
}
