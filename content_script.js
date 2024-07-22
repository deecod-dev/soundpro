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
  }
});
