
"use strict";

/*
 * Expose AdventurePlanner to scripts that access it through window.
 * The main app declares it as a top-level const, which is not
 * automatically added to the window object.
 */

(() => {
    if (typeof AdventurePlanner === "undefined") {
        console.error("AdventurePlanner was not initialised.");
        return;
    }

    window.AdventurePlanner = AdventurePlanner;

    console.log("AdventurePlanner shared with dashboard components.");
})();
