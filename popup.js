let slider = document.getElementById("slider");
let mutebtn = document.getElementById("no-sound");
let voltext = document.getElementById("cvol");




isMuted = false;
tabId = null;
let lastvol=-69;

/**
 * @description get current volume and remove the listener after popup complete load
 * @param {Event} event document event coming from listener
 */
window.onload = function () {
  voltext.innerText = "--";
};
setMuted = (muted) => {
  isMuted = muted;
};

slider.addEventListener("change", (el) => {
  let newVol = parseFloat(window.event.target.value);
  console.log("on change newvol: ", newVol);

  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    if (tab.length > 0) {
      tab = tab[0];
      let tabId = tab.id;

      console.log(`vol ${newVol} for tabId ${tabId}`);
      voltext.innerText = `${Math.round(newVol * 100)}%`;//fixed rounding error deecod
      console.log("mess sent set vol");
      chrome.runtime.sendMessage(
        { name: "set-tab-volume", tabId, newVol, mute: false },
        (muted) => {
          setMuted(muted);
        }
      );
    }
  });
});

mutebtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    if (tab.length > 0) {
      tab = tab[0];
      tabId = tab.id;

      let newVol = parseFloat(slider.value);
      if (voltext.innerText === "muted") {
        voltext.innerText = lastvol;
      } else {
        lastvol=voltext.innerText;
        voltext.innerText = "muted";
      }

      console.log(`vol ${newVol} for tabId ${tabId}`);

      chrome.runtime.sendMessage(
        { name: "set-tab-volume", tabId, newVol, mute: !isMuted },
        (muted) => {
          setMuted(muted);
        }
      );
    }
  });
});
