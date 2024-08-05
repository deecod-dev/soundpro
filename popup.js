let slider = document.getElementById("slider");
let voltext = document.getElementById("cvol");
let deviceSelect = document.getElementById("device_select");
let muteButton = document.getElementById("mute_button");

let tabId = null;

const setvol = (vol) => {
  voltext.innerText = vol !== null ? `${Math.round(vol * 100)}%` : "--";
};

const populateDeviceList = () => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const audioDevices = devices.filter(
      (device) => device.kind === "audiooutput"
    );
    deviceSelect.innerHTML = "";
    audioDevices.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.label;
      option.textContent = device.label;
      deviceSelect.appendChild(option);
    });
  });
};

const updateSliderWithVolume = (vol) => {
  if (vol !== undefined && vol !== null) {
    slider.value = vol;
    setvol(vol);
  } else {
    slider.value = 1;
    setvol(1);
  }
};

window.onload = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      tab = tabs[0];
      tabId = tab.id;
      chrome.runtime.sendMessage({ name: "get-tab-volume", tabId }, (vol) => {
        updateSliderWithVolume(vol);
      });
    }
  });
  populateDeviceList();
};

slider.addEventListener("change", (el) => {
  let newVol = parseFloat(window.event.target.value);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      tab = tabs[0];
      tabId = tab.id;
      voltext.innerText = `${Math.round(newVol * 100)}%`;
      chrome.runtime.sendMessage(
        { name: "set-tab-volume", tabId, newVol, mute: false },
        (muted) => {}
      );
    }
  });
});

deviceSelect.addEventListener("change", () => {
  const selectedDevice = deviceSelect.value;
  chrome.runtime.sendMessage(
    { name: "set-active-device", tabId, deviceName: selectedDevice },
    (response) => {
      if (response.success) {
        console.log("Device set successfully");
      } else {
        console.error("Failed to set device:", response.error);
      }
    }
  );
});

muteButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ name: "toggle-mute", tabId }, (response) => {
    console.log("Toggled mute");
    // Fetch the updated volume to update the UI
    chrome.runtime.sendMessage({ name: "get-tab-volume", tabId }, (vol) => {
      updateSliderWithVolume(vol);
    });
  });
});
