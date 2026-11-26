
"use strict";

/*
 * Discover Adventures
 * Displays one experience at a time to keep the page responsive.
 */

(() => {
    function initialiseDiscover() {
        if (!window.AdventurePlanner) return;

        const planner = window.AdventurePlanner;

        const feature = [...document.querySelectorAll("main > .feature")]
            .find(section =>
                section.querySelector("h3")?.textContent.includes("Discover Adventures")
            );

        if (!feature || feature.querySelector("#discover-panel")) return;

        feature.querySelector(".status")?.remove();

        const intro = feature.querySelector("p");
        if (intro) {
            intro.textContent =
                "Find an experience that catches your eye. Browse one idea at a time and discover somewhere new.";
        }

        const panel = document.createElement("div");
        panel.id = "discover-panel";
        panel.className = "discover-panel";

        const search = document.createElement("input");
        search.type = "search";
        search.id = "discover-search";
        search.className = "search-input";
        search.placeholder = "Search activities or destinations...";
        search.setAttribute("aria-label", "Search adventures");

        const controls = document.createElement("div");
        controls.className = "discover-controls";

        function makeSelect(labelText, id, options) {
            const label = document.createElement("label");
            label.className = "filter-field";

            const caption = document.createElement("span");
            caption.textContent = labelText;

            const select = document.createElement("select");
            select.id = id;

            options.forEach(option => {
                const item = document.createElement("option");
                item.value = option.value;
                item.textContent = option.label;
                select.appendChild(item);
            });

            label.append(caption, select);
            controls.appendChild(label);

            return select;
        }

        const activities = planner.getActivities();

        const regions = [...new Set(
            activities.map(activity => activity.region).filter(Boolean)
        )].sort();

        const categories = [...new Set(
            activities.flatMap(activity => activity.category || [])
        )].sort();

        const region = makeSelect("Explore an area", "discover-region", [
            { value: "all", label: "Anywhere" },
            ...regions.map(value => ({ value, label: value }))
        ]);

        const category = makeSelect("Type of experience", "discover-category", [
            { value: "all", label: "Anything" },
            ...categories.map(value => ({
                value,
                label: value.replaceAll("-", " ")
                    .replace(/\b\w/g, character => character.toUpperCase())
            }))
        ]);

        const dog = makeSelect("Dog access", "discover-dogs", [
            { value: "any", label: "Any dog policy" },
            { value: "friendly", label: "Dog-friendly only" },
            { value: "exclude-restricted", label: "Exclude places that prohibit dogs" }
        ]);

        const results = document.createElement("div");
        results.id = "discover-results";
        results.className = "discover-results";
        results.setAttribute("aria-live", "polite");

        const actions = document.createElement("div");
        actions.className = "discover-actions";

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "add-activity-button";
        nextButton.textContent = "Show another idea";

        const count = document.createElement("p");
        count.className = "discover-count";

        actions.appendChild(nextButton);

        panel.append(search, controls, actions, results, count);
        feature.appendChild(panel);

        let currentActivityId = null;
        let matchingActivities = [];

        function getMatches() {
            const term = search.value.trim().toLowerCase();

            return planner.getActivities().filter(activity => {
                if (planner.isCompleted(activity.id)) return false;

                if (region.value !== "all" && activity.region !== region.value) {
                    return false;
                }

                if (
                    category.value !== "all" &&
                    !(activity.category || []).includes(category.value)
                ) {
                    return false;
                }

                if (dog.value === "friendly" && activity.dogPolicy !== "friendly") {
                    return false;
                }

                if (
                    dog.value === "exclude-restricted" &&
                    activity.dogPolicy === "restricted"
                ) {
                    return false;
                }

                if (term) {
                    const searchable = [
                        activity.name,
                        activity.destination,
                        activity.region,
                        activity.description,
                        ...(activity.category || [])
                    ].join(" ").toLowerCase();

                    if (!searchable.includes(term)) return false;
                }

                return true;
            });
        }

        function createCard(activity) {
            const card = document.createElement("article");
            card.className = "discover-card";

            const eyebrow = document.createElement("span");
            eyebrow.className = "discover-card-eyebrow";
            eyebrow.textContent = "A place to discover";

            const heading = document.createElement("h4");
            heading.textContent = activity.name;

            const location = document.createElement("p");
            location.className = "discover-location";
            location.textContent = [
                activity.destination,
                activity.region
            ].filter(Boolean).join(" · ");

            const description = document.createElement("p");
            description.className = "discover-description";
            description.textContent =
                activity.description || "Explore this experience.";

            const cost = activity.cost === "free"
                ? "Free"
                : activity.estimatedCost != null
                    ? "Approx. $" + activity.estimatedCost + " per person"
                    : "Cost to check";

            const dogLabel = activity.dogPolicy === "friendly"
                ? "Dog-friendly"
                : activity.dogPolicy === "restricted"
                    ? "Dogs not permitted"
                    : "Dog access to verify";

            const details = document.createElement("div");
            details.className = "discover-details";

            [
                activity.durationHours
                    ? activity.durationHours + " hours"
                    : "Duration to check",
                cost,
                dogLabel
            ].forEach(value => {
                const item = document.createElement("span");
                item.textContent = value;
                details.appendChild(item);
            });

            const complete = document.createElement("button");
            complete.type = "button";
            complete.className = "reset-filters";
            complete.textContent = "Mark as completed";

            complete.addEventListener("click", () => {
                planner.toggleCompleted(activity.id);
                currentActivityId = null;
                displayNextIdea();
            });

            card.append(
                eyebrow,
                heading,
                location,
                description,
                details,
                complete
            );

            return card;
        }

        function displayNextIdea() {
            matchingActivities = getMatches();
            results.replaceChildren();

            if (!matchingActivities.length) {
                const empty = document.createElement("p");
                empty.className = "discover-empty";
                empty.textContent =
                    "No experiences match these filters. Try a different area, category or search.";

                results.appendChild(empty);
                count.textContent = "No matching experiences";
                nextButton.disabled = true;
                currentActivityId = null;
                return;
            }

            nextButton.disabled = false;

            let choices = matchingActivities;

            if (currentActivityId && choices.length > 1) {
                choices = choices.filter(
                    activity => activity.id !== currentActivityId
                );
            }

            const selected = choices[
                Math.floor(Math.random() * choices.length)
            ];

            currentActivityId = selected.id;
            results.appendChild(createCard(selected));

            count.textContent =
                `${matchingActivities.length} matching experiences available`;
        }

        nextButton.addEventListener("click", displayNextIdea);

        search.addEventListener("input", () => {
            currentActivityId = null;
            displayNextIdea();
        });

        [region, category, dog].forEach(select => {
            select.addEventListener("change", () => {
                currentActivityId = null;
                displayNextIdea();
            });
        });

        displayNextIdea();
    }

    document.addEventListener("DOMContentLoaded", initialiseDiscover);
})();
