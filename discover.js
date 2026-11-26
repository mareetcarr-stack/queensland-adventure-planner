
"use strict";

/*
 * Discover Adventures
 * Search, filter and browse the full experience collection.
 */

(() => {
    function initialiseDiscover() {
        if (typeof AdventurePlanner === "undefined") return;

        const feature = [...document.querySelectorAll("main > .feature")]
            .find(section =>
                section.querySelector("h3")?.textContent.includes("Discover Adventures")
            );

        if (!feature || feature.querySelector("#discover-panel")) return;

        feature.querySelector(".status")?.remove();

        const intro = feature.querySelector("p");

        if (intro) {
            intro.textContent =
                "Search the full collection of experiences, discover hidden gems and find something different to do. Completed experiences are automatically excluded.";
        }

        const panel = document.createElement("div");
        panel.id = "discover-panel";
        panel.className = "discover-panel";

        const search = document.createElement("input");
        search.type = "search";
        search.id = "discover-search";
        search.className = "search-input";
        search.placeholder = "Search activities, destinations or ideas...";
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

        const moreButton = document.createElement("button");
        moreButton.type = "button";
        moreButton.className = "reset-filters";
        moreButton.textContent = "Show 12 more experiences";
        moreButton.hidden = true;

        const count = document.createElement("p");
        count.className = "discover-meta";
        count.setAttribute("aria-live", "polite");

        panel.append(
            search,
            controls,
            actions,
            results,
            count,
            moreButton
        );

        feature.appendChild(panel);

        const PAGE_SIZE = 12;
        let visibleCount = PAGE_SIZE;
        let displayedActivities = [];

        function getMatches() {
            const term = search.value.trim().toLowerCase();

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

            const categoriesLabel = (activity.category || [])
                .map(value => value.replaceAll("-", " "))
                .join(", ");

            details.textContent =
                (activity.durationHours
                    ? activity.durationHours + " hours"
                    : "Duration to check") +
                " · " + cost +
                " · " + dogLabel +
                (categoriesLabel ? " · " + categoriesLabel : "");

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

                if (typeof renderMyActivities === "function") {
                    renderMyActivities();
                }
            });

            card.append(
                heading,
                location,
                description,
                details,
                complete
            );

            return card;
        }

        function render(randomise = false) {
            results.replaceChildren();

            let matches = getMatches();

            if (randomise) {
                matches = matches
                    .map(activity => ({
                        activity,
                        sort: Math.random()
                    }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(item => item.activity);

                visibleCount = Math.min(3, matches.length);
            }

            displayedActivities = matches;

            if (matches.length === 0) {
                const empty = document.createElement("p");
                empty.textContent =
                    "No uncompleted experiences match these filters. Try another search or area, or add more activities to your collection.";

                results.appendChild(empty);
                count.textContent = "";
                moreButton.hidden = true;
                return;
            }

            const heading = document.createElement("h4");
            heading.textContent = randomise
                ? "Your surprise suggestions"
                : "Ideas to explore";

            results.appendChild(heading);

            matches.slice(0, visibleCount).forEach(activity => {
                results.appendChild(createCard(activity));
            });

            count.textContent =
                `Showing ${Math.min(visibleCount, matches.length)} of ` +
                `${matches.length} uncompleted experiences.`;

            moreButton.hidden = visibleCount >= matches.length;
            moreButton.textContent =
                `Show ${Math.min(PAGE_SIZE, matches.length - visibleCount)} more experiences`;
        }

        surprise.addEventListener("click", () => {
            visibleCount = 3;
            render(true);
        });

        showAll.addEventListener("click", () => {
            visibleCount = PAGE_SIZE;
            render(false);
        });

        moreButton.addEventListener("click", () => {
            visibleCount += PAGE_SIZE;
            render(false);
        });

        search.addEventListener("input", () => {
            visibleCount = PAGE_SIZE;
            render(false);
        });

        [region, category, dog].forEach(select => {
            select.addEventListener("change", () => {
                visibleCount = PAGE_SIZE;
                render(false);
            });
        });

        render(true);
    }

    document.addEventListener("DOMContentLoaded", initialiseDiscover);
})();
