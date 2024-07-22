let slider = document.getElementById("slider");
let mutebtn = document.getElementById("no-sound");
let voltext = document.getElementById("cvol");

let isMuted = false;
let tabId = null;
let lastvol = -69;

const setvol = (vol) => {
  voltext.innerText = vol !== null ? `${Math.round(vol * 100)}%` : "--";
};


window.onload = function () {
  // voltext.innerText = "--";
  // voltext.innerText = `${100}%`;
  // console.log("doneeeee")
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      tab = tabs[0];
      tabId = tab.id;
      console.log("ahhhhhhhhhhhhhh");
      chrome.runtime.sendMessage(
        { name: "idk-man", tabId, mute: false },
        (vol) => {
          console.log("hmmmmmm", vol);
          if(vol!=undefined){//to set the intial at 100 and not at --
            slider.value = vol;
            setvol(vol);
          }
        }
      );
    }
  });
};

const setMuted = (muted) => {
  isMuted = muted;
};

slider.addEventListener("change", (el) => {
  let newVol = parseFloat(window.event.target.value);
  console.log("on change newvol: ", newVol);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      tab = tabs[0];
      tabId = tab.id;

      console.log(`vol ${newVol} for tabId ${tabId}`);
      voltext.innerText = `${Math.round(newVol * 100)}%`; // Fixed rounding error decode
      console.log("mess sent set vol");
      chrome.runtime.sendMessage(
        { name: "set-tab-volume", tabId, newVol, mute: false },
        (muted) => {
          setMuted(muted);
        }
      );
    }
  });
  console.log(parseFloat(window.event.target.value),"sssssssssssssssssssssssssssssss")
});

// mutebtn.addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs.length > 0) {
//       tab = tabs[0];
//       tabId = tab.id;

//       let newVol = parseFloat(slider.value);
//       if (voltext.innerText === "muted") {
//         console.log("hhhhhhhhhhhhhhhhhhhhh",lastvol);
//         chrome.runtime.sendMessage(
//           { name: "set-tab-volume", tabId, lastvol, mute: !isMuted },
//           (muted) => {
//             setMuted(muted);
//           }
//         );
//         voltext.innerText = lastvol;
//       } else {
//         lastvol = voltext.innerText;
//         voltext.innerText = "muted";
//         chrome.runtime.sendMessage(
//           { name: "set-tab-volume", tabId, newVol, mute: !isMuted },
//           (muted) => {
//             setMuted(muted);
//           }
//         );
//       }

//       console.log(`vol ${newVol} for tabId ${tabId}`);

      
//     }
//     console.log("nowwwwwwww",isMuted);
//   });
// });
