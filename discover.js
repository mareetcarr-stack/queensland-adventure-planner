
"use strict";

/*
 * Adventure Planner — Discover
 * Keyword-led search with optional area, category and pet filters.
 * Includes persistent Add to shortlist controls.
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
        search.placeholder = 'Filter by keywords, e.g. "beach", "park" or "waterfall"';
        search.setAttribute("aria-label", "Filter experiences by keyword");

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

        const region = makeSelect("Area", "discover-region", [
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

        const petLabel = document.createElement("label");
        petLabel.className = "pet-friendly-toggle";

        const petCheckbox = document.createElement("input");
        petCheckbox.type = "checkbox";
        petCheckbox.id = "discover-pet-friendly";

        const petText = document.createElement("span");
        petText.textContent = "Pet-friendly options only";

        petLabel.append(petCheckbox, petText);
        controls.appendChild(petLabel);

        const results = document.createElement("div");
        results.id = "discover-results";
        results.className = "discover-results";
        results.setAttribute("aria-live", "polite");

        const count = document.createElement("p");
        count.className = "discover-count";

        const shortlistCount = document.createElement("p");
        shortlistCount.id = "discover-shortlist-count";
        shortlistCount.className = "discover-shortlist-count";
        shortlistCount.setAttribute("aria-live", "polite");

        panel.append(search, controls, shortlistCount, count, results);
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
                ? `${total} saved ${total === 1 ? "activity" : "activities"}`
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

        function getMatches() {
            const terms = search.value.trim().toLowerCase()
                .split(/\s+/)
                .filter(Boolean);

            if (!terms.length) return [];

            return planner.getActivities().filter(activity => {
                if (planner.isCompleted(activity.id)) return false;

                if (
                    region.value !== "all" &&
                    activity.region !== region.value
                ) return false;

                if (
                    category.value !== "all" &&
                    !(activity.category || []).includes(category.value)
                ) return false;

                if (
                    petCheckbox.checked &&
                    activity.petFriendly !== true
                ) return false;

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
                activity.petFriendly
                    ? "Pet-friendly"
                    : "Not pet-friendly"
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
            complete.textContent = "Mark as completed";

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
                    "Enter a keyword above to explore matching experiences.";

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

        search.addEventListener("input", render);

        [region, category, petCheckbox].forEach(control =>
            control.addEventListener("change", render)
        );

        document.addEventListener("adventureplanner:datachanged", () => {
            results.querySelectorAll(".discover-card").forEach(card => {
                const heading = card.querySelector("h4")?.textContent;
                const location = card.querySelector(".discover-location")?.textContent || "";

                const activity = planner.getActivities().find(item =>
                    item.name === heading &&
                    [item.destination, item.region].filter(Boolean).join(" · ") === location
                );

                if (activity) {
                    const button = card.querySelector(".discover-shortlist-button");
                    if (button) updateShortlistButton(button, activity.id);
                }
            });

            updateShortlistCount();
        });

        render();
    }

    document.addEventListener("DOMContentLoaded", initialiseDiscover);
})();
