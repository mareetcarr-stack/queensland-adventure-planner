
"use strict";

/*
 * Automatic Day Trip Generator
 *
 * Features:
 * - Destination-based activity grouping
 * - Approximate distance filter from Clontarf
 * - Budget, duration and dog preferences
 * - Excludes completed activities
 * - Selectable activities
 * - Choose the planned outing date
 * - Save itineraries against the selected date
 *
 * Distance estimates use straight-line distance multiplied by 1.3.
 * They are not live road distances or navigation directions.
 */

(() => {
    function initialiseDayGenerator() {
        if (typeof AdventurePlanner === "undefined") return;

        const feature = [...document.querySelectorAll("main > .feature")]
            .find(section =>
                section.querySelector("h3")?.textContent.includes("Plan My Day")
            );

        if (!feature || feature.querySelector(".day-generator")) return;

        feature.querySelector(".status")?.remove();

        const introduction = feature.querySelector("p");

        if (introduction) {
            introduction.textContent =
                "Build a suggested day out based on distance from home, available time, budget, dog preferences and your chosen date.";
        }

        const HOME = { lat: -27.253, lon: 153.083 };

        const LOCATIONS = {
            "Redcliffe": [-27.230, 153.113],
            "Woody Point": [-27.256, 153.104],
            "Bribie Island": [-27.064, 153.158],
            "Maleny": [-26.760, 152.850],
            "Noosa": [-26.395, 153.091],
            "Kenilworth": [-26.592, 152.728],
            "Woombye": [-26.661, 152.962],
            "Scarborough": [-27.201, 153.109],
            "Shorncliffe": [-27.327, 153.081],
            "Wynnum": [-27.445, 153.175],
            "South Brisbane": [-27.481, 153.021],
            "Brisbane City": [-27.469, 153.025],
            "New Farm": [-27.468, 153.047],
            "Kangaroo Point": [-27.481, 153.036],
            "Mount Coot-tha": [-27.477, 152.976],
            "Buddina": [-26.696, 153.132],
            "Eumundi": [-26.477, 152.951],
            "Mooloolaba": [-26.681, 153.119],
            "Caloundra": [-26.803, 153.131],
            "Beerburrum": [-26.956, 152.962],
            "North Stradbroke Island": [-27.520, 153.430],
            "Moreton Island": [-27.170, 153.400],
            "Cleveland": [-27.525, 153.265],
            "Sandstone Point": [-27.080, 153.145],
            "Burleigh Heads": [-28.088, 153.452],
            "Southport": [-27.967, 153.415],
            "Tamborine Mountain": [-27.930, 153.190],
            "Byron Bay": [-28.647, 153.602],
            "Lennox Head": [-28.791, 153.594],
            "Brunswick Heads": [-28.541, 153.545],
            "North Tumbulgum": [-28.304, 153.465],
            "Tintenbar": [-28.797, 153.513],
            "Bangalow": [-28.686, 153.522],
            "Montecollum": [-28.574, 153.459],
            "Nightcap National Park": [-28.570, 153.330],
            "Wivenhoe Dam": [-27.395, 152.608],
            "Mount Mee": [-27.080, 152.750],
            "Dayboro": [-27.196, 152.825],
            "Samford": [-27.372, 152.886],
            "Hamilton": [-27.439, 153.066],
            "Biggera Waters": [-27.927, 153.400],
            "Beerwah": [-26.858, 152.961],
            "Oxenford": [-27.891, 153.313],
            "Margate": [-27.243, 153.106],
            "Nudgee Beach": [-27.347, 153.105],
            "Coolum Beach": [-26.528, 153.091],
            "Peregian Beach": [-26.480, 153.096],
            "Point Danger": [-28.166, 153.548],
            "Currumbin Valley": [-28.181, 153.420],
            "Tallebudgera Creek": [-28.112, 153.456]
        };

        function localDateString(date = new Date()) {
            const local = new Date(
                date.getTime() - date.getTimezoneOffset() * 60000
            );
            return local.toISOString().slice(0, 10);
        }

        function distanceBetween(a, b) {
            const radians = degrees => degrees * Math.PI / 180;
            const earthRadius = 6371;

            const lat1 = radians(a.lat);
            const lat2 = radians(b.lat);
            const deltaLat = radians(b.lat - a.lat);
            const deltaLon = radians(b.lon - a.lon);

            const value =
                Math.sin(deltaLat / 2) ** 2 +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon / 2) ** 2;

            return earthRadius * 2 *
                Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
        }

        function estimatedRoadDistance(destination) {
            const coordinates = LOCATIONS[destination];

            if (!coordinates) return null;

            const straightLine = distanceBetween(
                HOME,
                { lat: coordinates[0], lon: coordinates[1] }
            );

            return Math.round(straightLine * 1.3);
        }

        const style = document.createElement("style");

        style.textContent = `
            .day-generator { margin-top: 20px; }

            .day-generator-controls {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
                padding: 18px;
                border-radius: 12px;
                background: var(--surface);
            }

            .day-generator-controls .filter-field { min-width: 0; }

            .day-generator-controls select,
            .day-generator-controls input {
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

            .day-generator-actions button { flex: 1 1 180px; }

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
                line-height: 1.5;
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
                line-height: 1.5;
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

        const dateLabel = document.createElement("label");
        dateLabel.className = "filter-field";

        const dateCaption = document.createElement("span");
        dateCaption.textContent = "Date of your outing";

        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.id = "generator-date";
        dateInput.value = localDateString();
        dateInput.min = localDateString();
        dateInput.required = true;

        dateLabel.append(dateCaption, dateInput);

        const distanceControl = createSelect(
            "Maximum estimated drive distance from Clontarf",
            "generator-distance",
            [
                { value: "any", label: "Any distance" },
                { value: "25", label: "Up to 25 km" },
                { value: "50", label: "Up to 50 km" },
                { value: "75", label: "Up to 75 km" },
                { value: "100", label: "Up to 100 km" },
                { value: "150", label: "Up to 150 km" },
                { value: "200", label: "Up to 200 km" }
            ]
        );

        const durationControl = createSelect(
            "Available activity time",
            "generator-duration",
            [
                { value: "3", label: "Short outing — up to 3 hours" },
                { value: "4", label: "Half day — up to 4 hours" },
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
            dateLabel,
            distanceControl.label,
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

        function getEligibleActivities() {
            return AdventurePlanner.getActivities().filter(activity => {
                if (AdventurePlanner.isCompleted(activity.id)) return false;

                const duration = Number(activity.durationHours);

                if (!Number.isFinite(duration) || duration <= 0) return false;

                if (
                    dogControl.select.value === "friendly" &&
                    activity.dogPolicy !== "friendly"
                ) return false;

                if (
                    dogControl.select.value === "exclude-restricted" &&
                    activity.dogPolicy === "restricted"
                ) return false;

                const budget = budgetControl.select.value;

                if (budget !== "any") {
                    if (
                        activity.estimatedCost === null ||
                        activity.estimatedCost === undefined ||
                        Number(activity.estimatedCost) > Number(budget)
                    ) return false;
                }

                const maximumDistance = distanceControl.select.value;

                if (maximumDistance !== "any") {
                    const distance = estimatedRoadDistance(activity.destination);

                    if (
                        distance === null ||
                        distance > Number(maximumDistance)
                    ) return false;
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
            const groups = new Map();

            getEligibleActivities().forEach(activity => {
                const destination = (activity.destination || "").trim();

                if (!destination) return;

                if (!groups.has(destination)) {
                    groups.set(destination, []);
                }

                groups.get(destination).push(activity);
            });

            const suggestions = [];

            groups.forEach((activities, destination) => {
                const selected = [];
                let totalHours = 0;

                for (const activity of shuffle(activities)) {
                    const duration = Number(activity.durationHours);

                    if (totalHours + duration > maximumHours) continue;

                    selected.push(activity);
                    totalHours += duration;
                }

                if (!selected.length) return;

                suggestions.push({
                    destination,
                    region: selected[0].region || "",
                    activities: selected,
                    totalHours,
                    distance: estimatedRoadDistance(destination)
                });
            });

            return shuffle(suggestions);
        }

        function displaySuggestion(suggestion) {
            results.replaceChildren();

            const card = document.createElement("article");
            card.className = "generated-day";

            const heading = document.createElement("h4");
            heading.textContent = suggestion.destination;

            const intro = document.createElement("p");
            intro.className = "generated-day-intro";

            const formattedDate = new Date(
                `${dateInput.value}T12:00:00`
            ).toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            intro.textContent =
                `${formattedDate} · ` +
                `${suggestion.region ? suggestion.region + " · " : ""}` +
                `Approximately ${suggestion.distance} km from Clontarf (estimated one-way road distance).`;

            const activityContainer = document.createElement("div");

            const selectedIds = new Set(
                suggestion.activities.map(activity => activity.id)
            );

            const summary = document.createElement("div");
            summary.className = "generated-day-summary";

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
                    if (checkbox.checked) selectedIds.add(activity.id);
                    else selectedIds.delete(activity.id);

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

            const note = document.createElement("p");
            note.className = "generated-day-meta";
            note.textContent =
                "Distance is an approximate one-way estimate from Clontarf, calculated from geographic coordinates. Actual driving distances and times may differ. Check navigation, opening hours, access restrictions and bookings before travelling.";

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.className = "add-activity-button";
            saveButton.textContent = "Save this day itinerary";

            saveButton.addEventListener("click", () => {
                if (!dateInput.value || dateInput.value < localDateString()) {
                    message.textContent =
                        "Choose today or a future date for your outing.";
                    dateInput.focus();
                    return;
                }

                const ids = suggestion.activities
                    .filter(activity => selectedIds.has(activity.id))
                    .map(activity => activity.id);

                if (!ids.length) {
                    message.textContent =
                        "Select at least one experience before saving.";
                    return;
                }

                const saved = AdventurePlanner.saveItinerary({
                    date: dateInput.value,
                    activityIds: ids
                });

                if (!saved) {
                    message.textContent =
                        "Unable to save the itinerary. Check your browser storage.";
                    return;
                }

                message.textContent =
                    `Your itinerary for ${formattedDate} has been saved.`;

                saveButton.disabled = true;
                saveButton.textContent = "Itinerary saved";

                if (typeof renderDayPlanner === "function") {
                    renderDayPlanner();
                }
            });

            updateSummary();

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

            if (!dateInput.value || dateInput.value < localDateString()) {
                message.textContent =
                    "Choose today or a future date before generating an outing.";
                dateInput.focus();
                return;
            }

            const suggestions = buildSuggestions();

            if (!suggestions.length) {
                results.replaceChildren();

                const empty = document.createElement("p");
                empty.textContent =
                    "No uncompleted activities match these preferences. Try increasing your distance, time or budget limits.";

                results.appendChild(empty);
                regenerateButton.hidden = true;
                return;
            }

            displaySuggestion(suggestions[0]);
            regenerateButton.hidden = false;
        }

        generateButton.addEventListener("click", generate);
        regenerateButton.addEventListener("click", generate);

        dateInput.addEventListener("change", () => {
            if (results.children.length) generate();
        });
    }

    document.addEventListener("DOMContentLoaded", initialiseDayGenerator);
})();
