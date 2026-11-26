
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
    const history = document.getElementById("my-adventures-dashboard");
    const dashboard = document.getElementById("home-dashboard");

    if (welcome) {
        main.insertBefore(welcome, main.firstChild);
    }

    // Coloured cards dashboard directly under the welcome heading
    if (welcome && history) {
        welcome.insertAdjacentElement("afterend", history);
    } else if (history) {
        main.insertBefore(history, main.firstChild);
    }

    // Optional home dashboard after the coloured cards
    if (history && dashboard) {
        history.insertAdjacentElement("afterend", dashboard);
    } else if (welcome && dashboard) {
        welcome.insertAdjacentElement("afterend", dashboard);
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
        window.requestAnimationFrame(initialise);
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
