
"use strict";

/*
 * Adventure Planner
 * Main application script
 */

const AdventurePlanner = (() => {

    const CONFIG = {
        appName: "Adventure Planner",
        homeLocation: "Clontarf, Queensland",
        storageKey: "adventurePlannerData",
        defaultRegion: "South-East Queensland and Northern NSW"
    };

    const DEFAULT_DATA = {
        activities: [],
        completedActivities: [],
        savedItineraries: [],
        preferences: {
            maximumDriveHours: 2,
            budget: "any",
            dogPreference: "prefer",
            accommodation: "return-home"
        }
    };

    function loadData() {
        try {
            const storedData = localStorage.getItem(CONFIG.storageKey);

            if (storedData) {
                return {
                    ...DEFAULT_DATA,
                    ...JSON.parse(storedData)
                };
            }
        } catch (error) {
            console.error("Unable to load saved data:", error);
        }

        return structuredClone(DEFAULT_DATA);
    }

    function saveData(data) {
        try {
            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(data)
            );
            return true;
        } catch (error) {
            console.error("Unable to save data:", error);
            return false;
        }
    }

    const data = loadData();

    return {
        config: CONFIG,
        data,
        saveData: () => saveData(data)
    };

})();


/*
 * Activity browser
 */

function createActivityBrowser() {

    const activities = window.ADVENTURE_ACTIVITIES || [];

    const main = document.querySelector("main");

    if (!main) {
        console.error("Unable to find the main content area.");
        return;
    }

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "activity-browser";

    const heading = document.createElement("h2");
    heading.textContent = "Discover Adventures";

    const introduction = document.createElement("p");
    introduction.textContent =
        "Explore destinations and experiences waiting to be discovered.";

    const count = document.createElement("p");
    count.id = "activity-count";

    const search = document.createElement("input");
    search.type = "search";
    search.id = "activity-search";
    search.placeholder = "Search activities or destinations...";
    search.setAttribute(
        "aria-label",
        "Search activities or destinations"
    );

    const results = document.createElement("div");
    results.id = "activity-results";

    section.append(
        heading,
        introduction,
        count,
        search,
        results
    );

    // Add the activity browser to the main content area.
    main.appendChild(section);

    function renderActivities(searchTerm = "") {

        results.replaceChildren();

        const term = searchTerm.trim().toLowerCase();

        const filtered = activities.filter(activity => {

            const searchableText = [
                activity.name,
                activity.destination,
                activity.region,
                activity.description,
                ...(activity.category || [])
            ].join(" ").toLowerCase();

            return searchableText.includes(term);
        });

        count.textContent =
            `${filtered.length} of ${activities.length} experiences`;

        if (filtered.length === 0) {
            const empty = document.createElement("p");
            empty.textContent =
                "No matching activities found. Try another search.";
            results.appendChild(empty);
            return;
        }

        filtered.forEach(activity => {

            const card = document.createElement("article");
            card.className = "activity-card";

            const name = document.createElement("h3");
            name.textContent = activity.name;

            const destination = document.createElement("p");
            destination.textContent =
                `${activity.destination} · ${activity.region}`;

            const description = document.createElement("p");
            description.textContent = activity.description;

            const details = document.createElement("p");
            details.textContent =
                `${activity.durationHours} hours · ${activity.cost}`;

            const categories = document.createElement("p");
            categories.textContent =
                (activity.category || []).join(" · ");

            const verification = document.createElement("p");
            verification.textContent =
                activity.dogPolicy === "verify"
                    ? "Dog access: To be verified"
                    : `Dog access: ${activity.dogPolicy}`;

            card.append(
                name,
                destination,
                description,
                details,
                categories,
                verification
            );

            results.appendChild(card);
        });
    }

    search.addEventListener("input", () => {
        renderActivities(search.value);
    });

    renderActivities();

    console.log(
        `Activity browser loaded: ${activities.length} experiences.`
    );
}


document.addEventListener("DOMContentLoaded", () => {

    console.log(
        `${AdventurePlanner.config.appName} initialised successfully.`
    );

    createActivityBrowser();

});
