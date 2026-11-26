
"use strict";

/*
 * Adventure Planner — page-specific initialisation
 * Keeps the shared data layer active while limiting generated sections
 * to the page where they belong.
 */

(() => {
    const page = document.body.dataset.page;

    const noOperation = () => {};

    // These features have their own dedicated page scripts or containers.
    window.renderActivityBrowser = noOperation;
    window.renderDayPlanner = noOperation;

    if (
        page === "home" ||
        page === "discover" ||
        page === "plan-day" ||
        page === "holidays" ||
        page === "shortlist" ||
        page === "map"
    ) {
        window.createAddActivityForm = noOperation;
        window.renderMyActivities = noOperation;
        window.createBackupSection = noOperation;
    }

    // My Adventures retains the personal activity editor and backup tools.
})();
