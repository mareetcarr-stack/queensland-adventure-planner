
"use strict";

/*
 * Adventure Planner — Discover
 * Consolidated search with all original activity filters,
 * plus area, experience type, pet-friendly toggle and shortlist.
 */

(() => {
    function initialiseDiscover() {
        const planner = window.AdventurePlanner;
        if (!planner) return;

        const feature = [...document.querySelectorAll("main > .feature")]
            .find(section =>
                section.querySelector("h3")?.textContent.includes("Discover Adventures")
            );

        if (!feature || feature.querySelector("#discover-panel")) return;

        feature.querySelector(".status")?.remove();

        const panel = document.createElement("div");
        panel.id = "discover-panel";
        panel.className = "discover-panel";

        const search = document.createElement("input");
        search.type = "search";
        search.id = "discover-search";
        search.className = "search-input";
        search.placeholder = 'Search by keyword, e.g. "beach", "park" or "waterfall"';
        search.setAttribute("aria-label", "Search experiences by keyword");

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
            activities.map(item => item.region).filter(Boolean)
        )].sort();

        const categories = [...new Set(
            activities.flatMap(item => item.category || [])
        )].sort();

        const region = makeSelect("Area / Region", "discover-region", [
            { value: "all", label: "Anywhere" },
            ...regions.map(value => ({ value, label: value }))
        ]);

        const category = makeSelect("Experience type", "discover-category", [
            { value: "all", label: "Any type" },
            ...categories.map(value => ({
                value,
                label: value.replaceAll("-", " ")
                    .replace(/\b\w/g, char => char.toUpperCase())
            }))
        ]);

        const budget = makeSelect("Budget per person", "discover-budget", [
            { value: "any", label: "Any budget" },
            { value: "0", label: "Free" },
            { value: "25", label: "Under $25" },
            { value: "50", label: "Under $50" },
            { value: "100", label: "Under $100" }
        ]);

        const duration = makeSelect("Duration", "discover-duration", [
            { value: "any", label: "Any duration" },
            { value: "2", label: "Up to 2 hours" },
            { value: "4", label: "Up to 4 hours" },
            { value: "8", label: "Up to 8 hours" }
        ]);

        const dog = makeSelect("Dog preference", "discover-dog", [
            { value: "any", label: "No preference" },
            { value: "friendly", label: "Dog-friendly only" },
            { value: "verify", label: "Needs verification" },
            { value: "restricted", label: "Dogs not permitted" }
        ]);

        const completion = makeSelect(
            "Completion status",
            "discover-completion",
            [
                { value: "incomplete", label: "Not yet completed" },
                { value: "all", label: "All experiences" },
                { value: "complete", label: "Completed" }
            ]
        );

        const petLabel = document.createElement("label");
        petLabel.className = "pet-friendly-toggle";

        const petCheckbox = document.createElement("input");
        petCheckbox.type = "checkbox";
        petCheckbox.id = "discover-pet-friendly";

        const petText = document.createElement("span");
        petText.textContent = "Pet-friendly options only";

        petLabel.append(petCheckbox, petText);
        controls.appendChild(petLabel);

        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.id = "discover-clear-filters";
        resetButton.className = "reset-filters";
        resetButton.textContent = "Clear filters";

        const shortlistCount = document.createElement("p");
        shortlistCount.id = "discover-shortlist-count";
        shortlistCount.className = "discover-shortlist-count";
        shortlistCount.setAttribute("aria-live", "polite");

        const count = document.createElement("p");
        count.className = "discover-count";
        count.setAttribute("aria-live", "polite");

        const results = document.createElement("div");
        results.id = "discover-results";
        results.className = "discover-results";
        results.setAttribute("aria-live", "polite");

        panel.append(
            search,
            controls,
            resetButton,
            shortlistCount,
            count,
            results
        );

        feature.appendChild(panel);

        function getShortlist() {
            if (!Array.isArray(planner.data.shortlistedActivities)) {
                planner.data.shortlistedActivities = [];
            }

            return new Set(planner.data.shortlistedActivities);
        }

        function updateShortlistCount() {
            const total = getShortlist().size;

            shortlistCount.textContent = total
                ? `${total} saved ${total === 1 ? "activity" : "activities"} in My Shortlist`
                : "Your shortlist is empty";
        }

        function updateShortlistButton(button, activityId) {
            const saved = getShortlist().has(activityId);

            button.textContent = saved
                ? "✓ Added to shortlist"
                : "＋ Add to shortlist";

            button.classList.toggle("is-shortlisted", saved);
            button.setAttribute("aria-pressed", String(saved));

            button.setAttribute(
                "aria-label",
                saved
                    ? "Remove this activity from your shortlist"
                    : "Add this activity to your shortlist"
            );
        }

        function toggleShortlist(activityId, button) {
            const ids = getShortlist();

            if (ids.has(activityId)) {
                ids.delete(activityId);
            } else {
                ids.add(activityId);
            }

            planner.data.shortlistedActivities = [...ids];

            if (!planner.saveData()) {
                window.alert(
                    "Your shortlist could not be saved. Please check your browser storage."
                );
                return;
            }

            updateShortlistButton(button, activityId);
            updateShortlistCount();

            document.dispatchEvent(
                new CustomEvent("adventureplanner:datachanged")
            );
        }

        function getDogPolicy(activity) {
            if (activity.dogPolicy) return activity.dogPolicy;

            if (activity.petFriendly === true) return "friendly";

            if (activity.petFriendly === false) return "restricted";

            return "verify";
        }

        function getMatches() {
            const terms = search.value.trim().toLowerCase()
                .split(/\s+/)
                .filter(Boolean);

            if (!terms.length) return [];

            return planner.getActivities().filter(activity => {
                if (
                    region.value !== "all" &&
                    activity.region !== region.value
                ) return false;

                if (
                    category.value !== "all" &&
                    !(activity.category || []).includes(category.value)
                ) return false;

                const cost = activity.estimatedCost;
                const costLimit = budget.value;

                if (costLimit !== "any") {
                    if (cost === null || cost === undefined || cost === "") {
                        return false;
                    }

                    const numericCost = Number(cost);

                    if (!Number.isFinite(numericCost)) return false;

                    if (costLimit === "0" && numericCost !== 0) return false;

                    if (
                        costLimit !== "0" &&
                        numericCost >= Number(costLimit)
                    ) return false;
                }

                if (duration.value !== "any") {
                    const hours = Number(activity.durationHours);

                    if (
                        !Number.isFinite(hours) ||
                        hours > Number(duration.value)
                    ) return false;
                }

                if (
                    dog.value !== "any" &&
                    getDogPolicy(activity) !== dog.value
                ) return false;

                if (
                    petCheckbox.checked &&
                    getDogPolicy(activity) !== "friendly"
                ) return false;

                const completed = planner.isCompleted(activity.id);

                if (completion.value === "complete" && !completed) {
                    return false;
                }

                if (completion.value === "incomplete" && completed) {
                    return false;
                }

                const searchable = [
                    activity.name,
                    activity.destination,
                    activity.region,
                    activity.description,
                    ...(activity.category || [])
                ].join(" ").toLowerCase();

                return terms.every(term => searchable.includes(term));
            });
        }

        function createCard(activity) {
            const card = document.createElement("article");
            card.className = "discover-card";

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
            description.textContent = activity.description || "";

            const details = document.createElement("div");
            details.className = "discover-details";

            const values = [
                activity.durationHours
                    ? `${activity.durationHours} hours`
                    : "Duration to check",
                activity.estimatedCost === 0
                    ? "Free"
                    : activity.estimatedCost != null
                        ? `Approx. $${activity.estimatedCost} per person`
                        : "Cost to check",
                getDogPolicy(activity) === "friendly"
                    ? "Dog-friendly"
                    : getDogPolicy(activity) === "restricted"
                        ? "Dogs not permitted"
                        : "Dog access to verify",
                planner.isCompleted(activity.id)
                    ? "Completed"
                    : "Not yet completed"
            ];

            values.forEach(value => {
                const item = document.createElement("span");
                item.textContent = value;
                details.appendChild(item);
            });

            const actions = document.createElement("div");
            actions.className = "discover-card-actions";

            const shortlist = document.createElement("button");
            shortlist.type = "button";
            shortlist.className = "discover-shortlist-button";

            shortlist.addEventListener("click", () =>
                toggleShortlist(activity.id, shortlist)
            );

            updateShortlistButton(shortlist, activity.id);

            const complete = document.createElement("button");
            complete.type = "button";
            complete.className = "discover-complete-button";

            complete.textContent = planner.isCompleted(activity.id)
                ? "Mark as not completed"
                : "Mark as completed";

            complete.addEventListener("click", () => {
                planner.toggleCompleted(activity.id);
                render();
            });

            actions.append(shortlist, complete);
            card.append(heading, location, description, details, actions);

            return card;
        }

        function render() {
            results.replaceChildren();

            const term = search.value.trim();

            if (!term) {
                count.textContent = "";

                const prompt = document.createElement("p");
                prompt.className = "discover-empty";
                prompt.textContent =
                    "Enter a keyword above to explore matching experiences. You can then narrow the results using the filters.";

                results.appendChild(prompt);
                updateShortlistCount();
                return;
            }

            const matches = getMatches();

            count.textContent =
                `${matches.length} matching experience${matches.length === 1 ? "" : "s"}`;

            if (!matches.length) {
                const empty = document.createElement("p");
                empty.className = "discover-empty";
                empty.textContent =
                    "No matching experiences. Try another keyword or change your filters.";

                results.appendChild(empty);
                updateShortlistCount();
                return;
            }

            matches.forEach(activity => {
                results.appendChild(createCard(activity));
            });

            updateShortlistCount();
        }

        function clearFilters() {
            search.value = "";
            region.value = "all";
            category.value = "all";
            budget.value = "any";
            duration.value = "any";
            dog.value = "any";
            completion.value = "incomplete";
            petCheckbox.checked = false;

            render();
        }

        search.addEventListener("input", render);

        [
            region,
            category,
            budget,
            duration,
            dog,
            completion,
            petCheckbox
        ].forEach(control =>
            control.addEventListener("change", render)
        );

        resetButton.addEventListener("click", clearFilters);

        document.addEventListener("adventureplanner:datachanged", () => {
            render();
        });

        render();
    }

    document.addEventListener("DOMContentLoaded", initialiseDiscover);
})();
