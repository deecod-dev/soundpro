# local setup:
1. clone this repo to any folder and remember it's location.
2. go to chrome->extensions->manage extensions.
3. switch on the developers settings if not turned on already.
4. you will see a load unpacked option on the left, click on it(it will be named sound_extension).
5. select the repo which you cloned.
6. go back from the settings and pin the extension added(current icon=insta hehe :3)

# FOR DEVELOPERS:
6. click on the background_page for the console logs.
7. Using manifest v2 currently so ignore errors.
8. there are two js files, popup.js runs only when you click the extension icon and the background.js runs all the time.
9. background_page shows logs of background.js and when you click the extension inspect it to open the logs of popup.js.