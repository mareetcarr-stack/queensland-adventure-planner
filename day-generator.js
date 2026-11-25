
"use strict";

/*
 * Automatic Day Trip Generator
 *
 * Builds suggested outings from uncompleted activities.
 * Groups suggestions by region, avoids repeating completed
 * experiences and supports budget, dog and duration filters.
 *
 * Travel times are deliberately not estimated because the
 * activity database does not yet contain verified journey data.
 */

(() => {
    function initialiseDayGenerator() {
        if (typeof AdventurePlanner === "undefined") return;

        const feature = [...document.querySelectorAll("main > .feature")]
            .find(section =>
                section.querySelector("h3")?.textContent.includes("Plan My Day")
            );

        if (!feature) return;

        feature.querySelector(".status")?.remove();

        const introduction = feature.querySelector("p");

        if (introduction) {
            introduction.textContent =
                "Generate a suggested day out using your uncompleted experiences. Choose your available time, budget and dog preference.";
        }

        const style = document.createElement("style");

        style.textContent = `
            .day-generator {
                margin-top: 20px;
            }

            .day-generator-controls {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
                padding: 18px;
                border-radius: 12px;
                background: var(--surface);
            }

            .day-generator-controls .filter-field {
                min-width: 0;
            }

            .day-generator-controls select {
                width: 100%;
                min-height: 44px;
                padding: 10px;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: white;
                color: var(--text);
                font: inherit;
            }

            .day-generator-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin: 16px 0;
            }

            .day-generator-actions button {
                flex: 1 1 180px;
            }

            .generated-day {
                margin-top: 20px;
                padding: 18px;
                border: 1px solid var(--border);
                border-radius: 12px;
                background: white;
            }

            .generated-day h4 {
                margin: 0 0 6px;
                color: var(--forest);
                font-size: 1.15rem;
            }

            .generated-day-intro,
            .generated-day-meta {
                color: var(--muted);
                font-size: .9rem;
            }

            .generated-activity {
                display: flex;
                gap: 12px;
                align-items: flex-start;
                padding: 13px 0;
                border-top: 1px solid var(--border);
            }

            .generated-activity input {
                width: 19px;
                height: 19px;
                margin-top: 3px;
                flex-shrink: 0;
                accent-color: var(--forest);
            }

            .generated-activity strong {
                display: block;
                color: var(--forest);
            }

            .generated-activity span {
                display: block;
                margin-top: 3px;
                color: var(--muted);
                font-size: .88rem;
            }

            .generated-day-summary {
                margin-top: 14px;
                padding: 13px;
                border-radius: 8px;
                background: var(--surface);
                color: var(--forest);
                font-size: .9rem;
                line-height: 1.6;
            }

            .day-generator-message {
                color: var(--forest);
                font-weight: 600;
            }

            @media (max-width: 600px) {
                .day-generator-controls {
                    grid-template-columns: 1fr;
                    padding: 14px;
                }
            }
        `;

        document.head.appendChild(style);

        const panel = document.createElement("div");
        panel.className = "day-generator";

        function createSelect(labelText, id, options) {
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
            return { label, select };
        }

        const durationControl = createSelect(
            "Available activity time",
            "generator-duration",
            [
                { value: "4", label: "Short outing — up to 4 hours" },
                { value: "6", label: "Most of the day — up to 6 hours" },
                { value: "8", label: "Full day — up to 8 hours" }
            ]
        );

        const budgetControl = createSelect(
            "Activity budget per person",
            "generator-budget",
            [
                { value: "any", label: "No fixed budget" },
                { value: "0", label: "Free activities only" },
                { value: "25", label: "Up to $25" },
                { value: "50", label: "Up to $50" },
                { value: "100", label: "Up to $100" }
            ]
        );

        const dogControl = createSelect(
            "Dog preference",
            "generator-dogs",
            [
                { value: "any", label: "Any dog policy" },
                { value: "friendly", label: "Dog-friendly only" },
                { value: "exclude-restricted", label: "Exclude places that prohibit dogs" }
            ]
        );

        const controls = document.createElement("div");
        controls.className = "day-generator-controls";

        controls.append(
            durationControl.label,
            budgetControl.label,
            dogControl.label
        );

        const actions = document.createElement("div");
        actions.className = "day-generator-actions";

        const generateButton = document.createElement("button");
        generateButton.type = "button";
        generateButton.className = "add-activity-button";
        generateButton.textContent = "Generate my day out";

        const regenerateButton = document.createElement("button");
        regenerateButton.type = "button";
        regenerateButton.className = "reset-filters";
        regenerateButton.textContent = "Try another suggestion";
        regenerateButton.hidden = true;

        actions.append(generateButton, regenerateButton);

        const results = document.createElement("div");
        results.id = "generated-day-results";

        const message = document.createElement("p");
        message.className = "day-generator-message";
        message.setAttribute("aria-live", "polite");

        panel.append(controls, actions, results, message);
        feature.appendChild(panel);

        let currentSuggestion = null;

        function getEligibleActivities() {
            return AdventurePlanner.getActivities().filter(activity => {
                if (AdventurePlanner.isCompleted(activity.id)) {
                    return false;
                }

                if (
                    !Number.isFinite(Number(activity.durationHours)) ||
                    Number(activity.durationHours) <= 0
                ) {
                    return false;
                }

                if (
                    dogControl.select.value === "friendly" &&
                    activity.dogPolicy !== "friendly"
                ) {
                    return false;
                }

                if (
                    dogControl.select.value === "exclude-restricted" &&
                    activity.dogPolicy === "restricted"
                ) {
                    return false;
                }

                const budget = budgetControl.select.value;

                if (budget !== "any") {
                    if (
                        activity.estimatedCost === null ||
                        activity.estimatedCost === undefined
                    ) {
                        return false;
                    }

                    if (Number(activity.estimatedCost) > Number(budget)) {
                        return false;
                    }
                }

                return true;
            });
        }

        function shuffle(items) {
            const result = [...items];

            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }

            return result;
        }

        function buildSuggestions() {
            const maximumHours = Number(durationControl.select.value);
            const eligible = getEligibleActivities();

            const groups = new Map();

            eligible.forEach(activity => {
                const key = activity.region || activity.destination;

                if (!groups.has(key)) {
                    groups.set(key, []);
                }

                groups.get(key).push(activity);
            });

            const suggestions = [];

            groups.forEach((groupActivities, regionName) => {
                const shuffled = shuffle(groupActivities);
                const selected = [];
                let totalHours = 0;

                for (const activity of shuffled) {
                    const duration = Number(activity.durationHours);

                    if (totalHours + duration > maximumHours) {
                        continue;
                    }

                    selected.push(activity);
                    totalHours += duration;

                    if (selected.length >= 4) break;
                }

                if (selected.length === 0) return;

                const destinations = [
                    ...new Set(selected.map(activity => activity.destination))
                ];

                suggestions.push({
                    region: regionName,
                    activities: selected,
                    totalHours,
                    destinations
                });
            });

            return shuffle(suggestions);
        }

        function displaySuggestion(suggestion) {
            results.replaceChildren();

            const card = document.createElement("article");
            card.className = "generated-day";

            const heading = document.createElement("h4");
            heading.textContent = suggestion.region;

            const intro = document.createElement("p");
            intro.className = "generated-day-intro";
            intro.textContent =
                "A suggested outing based on your available activities.";

            const activityContainer = document.createElement("div");

            const selectedIds = new Set(
                suggestion.activities.map(activity => activity.id)
            );

            function updateSummary() {
                const selected = suggestion.activities.filter(activity =>
                    selectedIds.has(activity.id)
                );

                const hours = selected.reduce(
                    (total, activity) =>
                        total + Number(activity.durationHours || 0),
                    0
                );

                const knownCost = selected.reduce(
                    (total, activity) =>
                        total + (
                            activity.estimatedCost == null
                                ? 0
                                : Number(activity.estimatedCost)
                        ),
                    0
                );

                const unknownCosts = selected.filter(activity =>
                    activity.estimatedCost == null
                ).length;

                summary.textContent =
                    `${selected.length} experiences selected · ` +
                    `${hours.toFixed(1)} hours of activity · ` +
                    `Known costs: $${knownCost.toFixed(2)} per person` +
                    (unknownCosts
                        ? ` · ${unknownCosts} cost(s) to confirm`
                        : "");
            }

            suggestion.activities.forEach((activity, index) => {
                const label = document.createElement("label");
                label.className = "generated-activity";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = true;

                checkbox.addEventListener("change", () => {
                    if (checkbox.checked) {
                        selectedIds.add(activity.id);
                    } else {
                        selectedIds.delete(activity.id);
                    }

                    updateSummary();
                });

                const details = document.createElement("div");

                const name = document.createElement("strong");
                name.textContent = `${index + 1}. ${activity.name}`;

                const destination = document.createElement("span");
                destination.textContent =
                    `${activity.destination} · ${activity.durationHours} hours`;

                const description = document.createElement("span");
                description.textContent = activity.description || "";

                const cost = document.createElement("span");
                cost.textContent =
                    activity.estimatedCost == null
                        ? "Cost to confirm"
                        : activity.estimatedCost === 0
                            ? "Free"
                            : `Estimated $${activity.estimatedCost} per person`;

                const dog = document.createElement("span");
                dog.textContent =
                    activity.dogPolicy === "friendly"
                        ? "Dog-friendly"
                        : activity.dogPolicy === "restricted"
                            ? "Dogs not permitted"
                            : "Dog access needs verification";

                details.append(name, destination, description, cost, dog);
                label.append(checkbox, details);
                activityContainer.appendChild(label);
            });

            const summary = document.createElement("div");
            summary.className = "generated-day-summary";

            updateSummary();

            const note = document.createElement("p");
            note.className = "generated-day-meta";
            note.textContent =
                "The activities are grouped by region, but may be in different towns. Driving time, route order, opening hours and bookings have not yet been verified. Check these before setting out.";

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.className = "add-activity-button";
            saveButton.textContent = "Save this day itinerary";

            saveButton.addEventListener("click", () => {
                const ids = suggestion.activities
                    .filter(activity => selectedIds.has(activity.id))
                    .map(activity => activity.id);

                if (ids.length === 0) {
                    message.textContent =
                        "Select at least one experience before saving.";
                    return;
                }

                const date = new Date();
                const localDate = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                ).toISOString().slice(0, 10);

                const saved = AdventurePlanner.saveItinerary({
                    date: localDate,
                    activityIds: ids
                });

                if (!saved) {
                    message.textContent =
                        "Unable to save the itinerary. Check your browser storage.";
                    return;
                }

                message.textContent =
                    "Your suggested day has been saved in My Saved Itineraries.";

                if (typeof renderDayPlanner === "function") {
                    renderDayPlanner();
                }

                saveButton.disabled = true;
                saveButton.textContent = "Itinerary saved";
            });

            card.append(
                heading,
                intro,
                activityContainer,
                summary,
                note,
                saveButton
            );

            results.appendChild(card);
        }

        function generate() {
            message.textContent = "";

            const suggestions = buildSuggestions();

            if (suggestions.length === 0) {
                results.replaceChildren();

                const empty = document.createElement("p");
                empty.textContent =
                    "There aren't enough uncompleted activities matching those preferences. Try increasing your time or budget, or changing your dog preference.";

                results.appendChild(empty);
                currentSuggestion = null;
                regenerateButton.hidden = true;
                return;
            }

            currentSuggestion = suggestions[0];
            displaySuggestion(currentSuggestion);
            regenerateButton.hidden = false;
        }

        generateButton.addEventListener("click", generate);
        regenerateButton.addEventListener("click", generate);
    }

    document.addEventListener("DOMContentLoaded", initialiseDayGenerator);
})();
