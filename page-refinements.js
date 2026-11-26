
"use strict";

/*
 * Adventure Planner — page-specific interface refinements.
 *
 * My Adventures page order:
 * 1. Welcome
 * 2. Adventure Dashboard
 * 3. Personal adventure history
 *
 * Existing content and saved data are preserved.
 */

(() => {
    const page = document.body.dataset.page || "";

    function arrangeMyAdventures() {
    if (page !== "my-adventures") return;

    const main = document.querySelector("main");
    if (!main) return;

    const welcome = main.querySelector(".welcome");
    const adventureDashboard = document.getElementById("home-dashboard"); // "Your Adventure Dashboard"
    const history = document.getElementById("my-adventures-dashboard");   // coloured cards / experiences

    // 1. Welcome at the top
    if (welcome) {
        main.insertBefore(welcome, main.firstChild);
    }

    // 2. "Your Adventure Dashboard" directly under welcome
    if (adventureDashboard) {
        if (welcome) {
            welcome.insertAdjacentElement("afterend", adventureDashboard);
        } else {
            main.insertBefore(adventureDashboard, main.firstChild);
        }
    }

    // 3. History section under that
    if (history) {
        const anchor = adventureDashboard || welcome;
        if (anchor) {
            anchor.insertAdjacentElement("afterend", history);
        } else {
            main.insertBefore(history, main.firstChild);
        }
    }
}

    function initialise() {
        if (page !== "my-adventures") return;

        arrangeMyAdventures();

        // Reapply the order when the page is revisited or data changes.
        document.addEventListener(
            "adventureplanner:datachanged",
            arrangeMyAdventures
        );

        window.addEventListener("pageshow", arrangeMyAdventures);
        window.addEventListener("focus", arrangeMyAdventures);
    }

    function start() {
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(initialise);
    });
}

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );
    } else {
        start();
    }
})();
