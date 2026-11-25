
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
            dogPreference: "any",
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
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
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
 * Activity browser and filters
 */

function createActivityBrowser() {

    const activities = window.ADVENTURE_ACTIVITIES || [];

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "activity-browser";

    const heading = document.createElement("h2");
    heading.textContent = "Discover Adventures";

    const introduction = document.createElement("p");
    introduction.textContent =
        "Find experiences that match your interests and preferences.";

    const count = document.createElement("p");
    count.id = "activity-count";

    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search activities or destinations...";
    search.setAttribute("aria-label", "Search activities or destinations");

    const filters = document.createElement("div");
    filters.className = "activity-filters";

    function createFilter(labelText, options, name) {

        const wrapper = document.createElement("label");
        wrapper.className = "filter-field";

        const label = document.createElement("span");
        label.textContent = labelText;

        const select = document.createElement("select");
        select.id = `filter-${name}`;

        options.forEach(option => {
            const element = document.createElement("option");
            element.value = option.value;
            element.textContent = option.label;
            select.appendChild(element);
        });

        wrapper.append(label, select);
        filters.appendChild(wrapper);

        select.addEventListener("change", renderActivities);

        return select;
    }

    const regions = [...new Set(activities.map(a => a.region))].sort();

    const regionFilter = createFilter(
        "Region",
        [
            { value: "all", label: "All regions" },
            ...regions.map(region => ({
                value: region,
                label: region
            }))
        ],
        "region"
    );

    const categories = [...new Set(
        activities.flatMap(a => a.category || [])
    )].sort();

    const categoryFilter = createFilter(
        "Category",
        [
            { value: "all", label: "All categories" },
            ...categories.map(category => ({
                value: category,
                label: category.replaceAll("-", " ")
            }))
        ],
        "category"
    );

    const budgetFilter = createFilter(
        "Budget",
        [
            { value: "any", label: "Any budget" },
            { value: "0", label: "Free" },
            { value: "25", label: "Under $25" },
            { value: "50", label: "Under $50" },
            { value: "100", label: "Under $100" }
        ],
        "budget"
    );

    const durationFilter = createFilter(
        "Duration",
        [
            { value: "any", label: "Any duration" },
            { value: "2", label: "Up to 2 hours" },
            { value: "4", label: "Up to 4 hours" },
            { value: "8", label: "Up to 8 hours" }
        ],
        "duration"
    );

    const dogFilter = createFilter(
        "Dog preference",
        [
            { value: "any", label: "No preference" },
            { value: "friendly", label: "Dog-friendly only" },
            { value: "verify", label: "Needs verification" },
            { value: "restricted", label: "No dogs" }
        ],
        "dog"
    );

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Clear filters";
    resetButton.className = "reset-filters";

    const results = document.createElement("div");
    results.id = "activity-results";

    section.append(
        heading,
        introduction,
        search,
        filters,
        resetButton,
        count,
        results
    );

    const main = document.querySelector("main");

    if (main) {
        main.appendChild(section);
    }

    function renderActivities() {

        results.replaceChildren();

        const term = search.value.trim().toLowerCase();
        const selectedRegion = regionFilter.value;
        const selectedCategory = categoryFilter.value;
        const selectedBudget = budgetFilter.value;
        const selectedDuration = durationFilter.value;
        const selectedDog = dogFilter.value;

        const filtered = activities.filter(activity => {

            const searchableText = [
                activity.name,
                activity.destination,
                activity.region,
                activity.description,
                ...(activity.category || [])
            ].join(" ").toLowerCase();

            if (term && !searchableText.includes(term)) return false;

            if (
                selectedRegion !== "all" &&
                activity.region !== selectedRegion
            ) return false;

            if (
                selectedCategory !== "all" &&
                !(activity.category || []).includes(selectedCategory)
            ) return false;

            if (selectedBudget !== "any") {

                if (activity.estimatedCost === null ||
                    activity.estimatedCost === undefined) {
                    return false;
                }

                const limit = Number(selectedBudget);

                if (
                    limit === 0 && activity.estimatedCost !== 0
                ) return false;

                if (
                    limit > 0 && activity.estimatedCost >= limit
                ) return false;
            }

            if (
                selectedDuration !== "any" &&
                activity.durationHours > Number(selectedDuration)
            ) return false;

            if (
                selectedDog !== "any" &&
                activity.dogPolicy !== selectedDog
            ) return false;

            return true;
        });

        count.textContent =
            `Showing ${filtered.length} of ${activities.length} experiences`;

        if (filtered.length === 0) {
            const empty = document.createElement("p");
            empty.textContent =
                "No matching activities. Try changing your filters.";
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

            const cost = document.createElement("p");
            cost.textContent =
                activity.estimatedCost === null ||
                activity.estimatedCost === undefined
                    ? "Cost: To be confirmed"
                    : activity.estimatedCost === 0
                        ? "Cost: Free"
                        : `Estimated cost: $${activity.estimatedCost}`;

            const duration = document.createElement("p");
            duration.textContent =
                `Duration: ${activity.durationHours} hours`;

            const dog = document.createElement("p");
            const dogLabels = {
                friendly: "Dog-friendly",
                verify: "Dog access needs verification",
                restricted: "Dogs not permitted",
                any: "Dog policy unknown"
            };
            dog.textContent =
                dogLabels[activity.dogPolicy] || "Dog policy unknown";

            card.append(
                name,
                destination,
                description,
                cost,
                duration,
                dog
            );

            results.appendChild(card);
        });
    }

    search.addEventListener("input", renderActivities);

    resetButton.addEventListener("click", () => {
        search.value = "";
        regionFilter.value = "all";
        categoryFilter.value = "all";
        budgetFilter.value = "any";
        durationFilter.value = "any";
        dogFilter.value = "any";
        renderActivities();
    });

    renderActivities();
}


document.addEventListener("DOMContentLoaded", () => {

    console.log(
        `${AdventurePlanner.config.appName} initialised successfully.`
    );

    createActivityBrowser();

});
