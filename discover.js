
"use strict";

/*
 * Discover Adventures
 * Recommends uncompleted experiences from the local activity database.
 */

(() => {
    function initialiseDiscover() {
        const feature = [...document.querySelectorAll("main > .feature")]
            .find(section =>
                section.querySelector("h3")?.textContent.includes("Discover Adventures")
            );

        if (!feature || !window.AdventurePlanner) return;

        feature.querySelector(".status")?.remove();

        const intro = feature.querySelector("p");
        if (intro) {
            intro.textContent =
                "Find something different to do. Completed experiences are excluded, but you can discover new activities in places you've visited before.";
        }

        const panel = document.createElement("div");
        panel.id = "discover-panel";
        panel.className = "discover-panel";

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

        const activities = AdventurePlanner.getActivities();

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

        const actions = document.createElement("div");
        actions.className = "discover-actions";

        const surprise = document.createElement("button");
        surprise.type = "button";
        surprise.className = "add-activity-button";
        surprise.textContent = "Surprise me with an adventure";

        const showAll = document.createElement("button");
        showAll.type = "button";
        showAll.className = "reset-filters";
        showAll.textContent = "Show matching ideas";

        actions.append(surprise, showAll);

        const results = document.createElement("div");
        results.id = "discover-results";
        results.className = "discover-results";

        panel.append(controls, actions, results);
        feature.appendChild(panel);

        function getMatches() {
            return AdventurePlanner.getActivities().filter(activity => {
                if (AdventurePlanner.isCompleted(activity.id)) return false;

                if (
                    region.value !== "all" &&
                    activity.region !== region.value
                ) return false;

                if (
                    category.value !== "all" &&
                    !(activity.category || []).includes(category.value)
                ) return false;

                if (
                    dog.value === "friendly" &&
                    activity.dogPolicy !== "friendly"
                ) return false;

                if (
                    dog.value === "exclude-restricted" &&
                    activity.dogPolicy === "restricted"
                ) return false;

                return true;
            });
        }

        function createCard(activity) {
            const card = document.createElement("article");
            card.className = "discover-card";

            const heading = document.createElement("h4");
            heading.textContent = activity.name;

            const location = document.createElement("p");
            location.className = "discover-meta";
            location.textContent = [
                activity.destination,
                activity.region
            ].filter(Boolean).join(" · ");

            const description = document.createElement("p");
            description.textContent =
                activity.description || "Explore this experience.";

            const details = document.createElement("p");
            details.className = "discover-meta";

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

            details.textContent =
                (activity.durationHours
                    ? activity.durationHours + " hours"
                    : "Duration to check") +
                " · " + cost +
                " · " + dogLabel;

            const complete = document.createElement("button");
            complete.type = "button";
            complete.className = "reset-filters";
            complete.textContent = "Mark experience as completed";

            complete.addEventListener("click", () => {
                AdventurePlanner.toggleCompleted(activity.id);
                render(false);

                if (typeof renderActivityBrowser === "function") {
                    renderActivityBrowser();
                }

                if (typeof renderDayPlanner === "function") {
                    renderDayPlanner();
                }
            });

            card.append(heading, location, description, details, complete);
            return card;
        }

        function render(randomise) {
            results.replaceChildren();

            let matches = getMatches();

            if (matches.length === 0) {
                const empty = document.createElement("p");
                empty.textContent =
                    "No uncompleted experiences match these filters. Try another area or category, or add more activities to your collection.";
                results.appendChild(empty);
                return;
            }

            if (randomise) {
                matches = matches
                    .map(activity => ({
                        activity,
                        sort: Math.random()
                    }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(item => item.activity);
            }

            const selected = matches.slice(0, randomise ? 3 : 6);

            const heading = document.createElement("h4");
            heading.textContent = randomise
                ? "Your surprise suggestions"
                : "Ideas to explore";

            results.appendChild(heading);

            selected.forEach(activity => {
                results.appendChild(createCard(activity));
            });

            const count = document.createElement("p");
            count.className = "discover-meta";
            count.textContent =
                matches.length + " uncompleted experience" +
                (matches.length === 1 ? "" : "s") +
                " match your filters.";

            results.appendChild(count);
        }

        surprise.addEventListener("click", () => render(true));
        showAll.addEventListener("click", () => render(false));

        [region, category, dog].forEach(select => {
            select.addEventListener("change", () => render(false));
        });

        render(true);
    }

    document.addEventListener("DOMContentLoaded", initialiseDiscover);
})();

