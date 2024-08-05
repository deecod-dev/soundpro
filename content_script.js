let audioContext;
let gainNode;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setVolume") {
    if (!audioContext) {
      audioContext = new AudioContext();
      gainNode = audioContext.createGain();

      const audioElements = document.querySelectorAll("audio, video");
      audioElements.forEach((audio) => {
        const source = audioContext.createMediaElementSource(audio);
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
      });
    }

    gainNode.gain.value = message.volume;
    sendResponse({ success: true });
  } else if (message.action === "setAudioDevice") {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const device = devices.find((d) => d.label === message.deviceName);
          if (device && device.deviceId) {
            const audioElements = document.querySelectorAll("audio, video");
            audioElements.forEach((audio) => {
              audio.setSinkId(device.deviceId).catch((err) => {
                console.error("Failed to set sink ID:", err);
              });
            });
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: "Device not found" });
          }
        })
        .catch((err) => {
          console.error("Error enumerating devices:", err);
          sendResponse({ success: false, error: err.message });
        });
    } else {
      sendResponse({ success: false, error: "Device API not supported" });
    }
  }
});
