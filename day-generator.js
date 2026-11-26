
"use strict";

/*
 * Adventure Planner — Day Generator
 * User-defined starting location and estimated distance filtering.
 */

(() => {
    function initialiseDayGenerator() {
        const planner = window.AdventurePlanner;
        if (!planner) return;

        const feature = [...document.querySelectorAll("main > .feature")]
            .find(section =>
                section.querySelector("h3")?.textContent.includes("Plan My Day")
            );

        if (!feature || feature.querySelector(".day-generator")) return;

        feature.querySelector(".status")?.remove();

        const introduction = feature.querySelector("p");
        if (introduction) {
            introduction.textContent =
                "Choose where you're starting from, then set your preferences to create a suggested day out.";
        }

        const DEFAULT_LOCATION = "Clontarf, Queensland, Australia";

        const LOCATIONS = {
            "Redcliffe": [-27.230, 153.113],
            "Woody Point": [-27.256, 153.104],
            "Wellington Point": [-27.483, 153.245],
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

        const localDate = () => {
            const now = new Date();
            return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 10);
        };

        const distanceBetween = (a, b) => {
            const rad = value => value * Math.PI / 180;
            const radius = 6371;
            const lat1 = rad(a.lat);
            const lat2 = rad(b.lat);
            const dLat = rad(b.lat - a.lat);
            const dLon = rad(b.lon - a.lon);

            const value =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) ** 2;

            return radius * 2 *
                Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
        };

        const panel = document.createElement("div");
        panel.className = "day-generator";

        const style = document.createElement("style");
        style.textContent = `
            .day-generator-controls {
                display:grid;
                grid-template-columns:repeat(2,minmax(0,1fr));
                gap:14px;
                padding:18px;
                border-radius:12px;
                background:#F2EBDD;
            }
            .day-generator-controls .filter-field {
                display:flex;
                flex-direction:column;
                gap:6px;
                min-width:0;
            }
            .day-generator-controls select,
            .day-generator-controls input {
                box-sizing:border-box;
                width:100%;
                min-height:46px;
                padding:10px;
                border:1px solid var(--border);
                border-radius:9px;
                background:#fff;
                color:var(--ink);
                font:inherit;
            }
            .generator-location-help {
                display:block;
                margin-top:5px;
                color:var(--muted);
                font-size:.8rem;
                line-height:1.4;
            }
            .pet-friendly-toggle {
                display:flex;
                align-items:center;
                gap:10px;
                min-height:46px;
                padding:8px 10px;
                border-radius:9px;
                background:rgba(255,255,255,.65);
                font-weight:600;
            }
            .pet-friendly-toggle input {
                width:19px;
                height:19px;
            }
            .day-generator-actions { margin:18px 0; }
            .day-generator-actions button { min-width:210px; }
            .generated-day {
                margin-top:20px;
                padding:22px;
                border:1px solid var(--border);
                border-radius:16px;
                background:#fff;
                box-shadow:var(--shadow);
            }
            .generated-day h4 {
                margin:0 0 8px;
                color:var(--sage-dark);
                font-size:1.35rem;
            }
            .generated-day-intro,
            .generated-day-meta {
                color:var(--muted);
                font-size:.9rem;
                line-height:1.55;
            }
            .generated-day-overview {
                margin:16px 0;
                padding:15px 17px;
                border-radius:11px;
                background:#DCE8E3;
                color:#40554B;
                line-height:1.6;
            }
            .generated-activity {
                display:flex;
                align-items:flex-start;
                gap:12px;
                padding:15px 0;
                border-top:1px solid var(--border);
                cursor:pointer;
            }
            .generated-activity input {
                width:19px;
                height:19px;
                margin-top:3px;
                flex-shrink:0;
                accent-color:var(--sage-dark);
            }
            .generated-activity strong {
                display:block;
                color:var(--ink);
            }
            .generated-activity span {
                display:block;
                margin-top:3px;
                color:var(--muted);
                font-size:.88rem;
                line-height:1.5;
            }
            .generated-day-summary {
                margin:16px 0;
                padding:15px;
                border-radius:11px;
                background:#E8DDEB;
                color:#51465A;
                font-weight:600;
                font-size:.9rem;
            }
            .day-generator-message {
                color:var(--sage-dark);
                font-weight:600;
            }
            .saved-itinerary-link {
                display:inline-block;
                margin:12px 0;
                padding:11px 16px;
                border-radius:9px;
                background:#DCE8E3;
                color:#30463C;
                font-weight:650;
                text-decoration:none;
            }
            @media(max-width:600px) {
                .day-generator-controls {
                    grid-template-columns:1fr;
                }
                .generated-day { padding:16px; }
                .day-generator-actions button { width:100%; }
            }
        `;
        document.head.appendChild(style);

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

        const locationLabel = document.createElement("label");
        locationLabel.className = "filter-field";

        const locationCaption = document.createElement("span");
        locationCaption.textContent = "Where are you starting from?";

        const locationInput = document.createElement("input");
        locationInput.type = "text";
        locationInput.id = "generator-start-location";
        locationInput.value = DEFAULT_LOCATION;
        locationInput.placeholder = "Enter a suburb, town or address";
        locationInput.autocomplete = "street-address";

        const locationHelp = document.createElement("small");
        locationHelp.className = "generator-location-help";
        locationHelp.textContent =
            "Enter your current location or somewhere you'll be staying. Include the state or country if needed.";

        locationLabel.append(locationCaption, locationInput, locationHelp);

        const dateLabel = document.createElement("label");
        dateLabel.className = "filter-field";

        const dateCaption = document.createElement("span");
        dateCaption.textContent = "Date of your outing";

        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.id = "generator-date";
        dateInput.value = localDate();
        dateInput.min = localDate();

        dateLabel.append(dateCaption, dateInput);

        const distance = createSelect(
            "Maximum estimated drive distance",
            "generator-distance",
            [
                { value:"any", label:"Any distance" },
                { value:"25", label:"Up to 25 km" },
                { value:"50", label:"Up to 50 km" },
                { value:"75", label:"Up to 75 km" },
                { value:"100", label:"Up to 100 km" },
                { value:"150", label:"Up to 150 km" },
                { value:"200", label:"Up to 200 km" }
            ]
        );

        const duration = createSelect(
            "Available activity time",
            "generator-duration",
            [
                { value:"3", label:"Short outing — up to 3 hours" },
                { value:"4", label:"Half day — up to 4 hours" },
                { value:"6", label:"Most of the day — up to 6 hours" },
                { value:"8", label:"Full day — up to 8 hours" }
            ]
        );

        const budget = createSelect(
            "Activity budget per person",
            "generator-budget",
            [
                { value:"any", label:"No fixed budget" },
                { value:"0", label:"Free activities only" },
                { value:"25", label:"Up to $25" },
                { value:"50", label:"Up to $50" },
                { value:"100", label:"Up to $100" }
            ]
        );

        const petLabel = document.createElement("label");
        petLabel.className = "pet-friendly-toggle";

        const petCheckbox = document.createElement("input");
        petCheckbox.type = "checkbox";
        petCheckbox.id = "generator-pet-friendly";

        const petText = document.createElement("span");
        petText.textContent = "Pet-friendly options";

        petLabel.append(petCheckbox, petText);

        const controls = document.createElement("div");
        controls.className = "day-generator-controls";
        controls.append(
            locationLabel,
            dateLabel,
            distance.label,
            duration.label,
            budget.label,
            petLabel
        );

        const actions = document.createElement("div");
        actions.className = "day-generator-actions";

        const generateButton = document.createElement("button");
        generateButton.type = "button";
        generateButton.className = "add-activity-button";
        generateButton.textContent = "Generate my day out";

        actions.appendChild(generateButton);

        const results = document.createElement("div");
        results.id = "generated-day-results";

        const message = document.createElement("p");
        message.className = "day-generator-message";
        message.setAttribute("aria-live", "polite");

        panel.append(controls, actions, results, message);
        feature.appendChild(panel);

        let startingCoordinates = null;
        let resolvedLocationText = "";

        async function resolveStartingLocation() {
            const query = locationInput.value.trim();

            if (!query) {
                throw new Error("Enter a starting location.");
            }

            if (query === resolvedLocationText && startingCoordinates) {
                return startingCoordinates;
            }

            locationHelp.textContent = "Finding your starting location…";

            const searchQuery =
                /\b(australia|queensland|qld|nsw|vic|tas|wa|sa|nt|act|new zealand)\b/i.test(query)
                    ? query
                    : `${query}, Australia`;

            // Request several matches so an incorrect first result does not
            // prevent the correct Australian location from being selected.
            const url =
                "https://photon.komoot.io/api/?limit=10&q=" +
                encodeURIComponent(searchQuery);

            let response;

            try {
                response = await fetch(url, {
                    headers: { "Accept": "application/json" }
                });
            } catch {
                throw new Error(
                    "Unable to look up that location. Check your internet connection and try again."
                );
            }

            if (!response.ok) {
                throw new Error(
                    "The location search is temporarily unavailable. Please try again."
                );
            }

            const data = await response.json();
            const features = Array.isArray(data.features)
                ? data.features
                : [];

            const australianFeatures = features.filter(feature =>
                String(feature.properties?.country || "").toLowerCase() ===
                "australia"
            );

            const requestedState = searchQuery.match(
                /\b(Queensland|New South Wales|Victoria|Tasmania|Western Australia|South Australia|Northern Territory|Australian Capital Territory|Qld|NSW|Vic|Tas|WA|SA|NT|ACT)\b/i
            )?.[0];

            const stateAliases = {
                qld: "Queensland",
                nsw: "New South Wales",
                vic: "Victoria",
                tas: "Tasmania",
                wa: "Western Australia",
                sa: "South Australia",
                nt: "Northern Territory",
                act: "Australian Capital Territory"
            };

            const normaliseState = value => {
                const state = String(value || "").trim();
                return stateAliases[state.toLowerCase()] || state;
            };

            const matchingState = requestedState
                ? australianFeatures.filter(feature =>
                    normaliseState(feature.properties?.state).toLowerCase() ===
                    normaliseState(requestedState).toLowerCase()
                )
                : [];

            const match = matchingState[0] || australianFeatures[0];
            const coordinates = match?.geometry?.coordinates;
            const longitude = Number(coordinates?.[0]);
            const latitude = Number(coordinates?.[1]);

            if (
                !match ||
                !Number.isFinite(longitude) ||
                !Number.isFinite(latitude) ||
                longitude < 110 || longitude > 155 ||
                latitude < -45 || latitude > -8
            ) {
                throw new Error(
                    "We couldn't find a matching Australian location. Try adding the state, for example “Clontarf, Queensland”."
                );
            }

            startingCoordinates = {
                lon: longitude,
                lat: latitude
            };

            resolvedLocationText = query;
            locationHelp.textContent =
                `Starting point found: ${match.properties?.name || query}`;

            return startingCoordinates;
        }

        locationInput.addEventListener("input", () => {
            startingCoordinates = null;
            resolvedLocationText = "";
            locationHelp.textContent =
                "Your starting point will be checked when you generate an itinerary.";
        });

        const estimatedDistance = destination => {
            if (!startingCoordinates) return null;

            const destinationName = String(destination || "").trim();
            const coordinates = LOCATIONS[destinationName];

            if (!coordinates) return null;

            return Math.round(
                distanceBetween(
                    startingCoordinates,
                    { lat:coordinates[0], lon:coordinates[1] }
                ) * 1.3
            );
        };

        function shuffle(items) {
            const result = [...items];

            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }

            return result;
        }

        function eligibleActivities() {
            const advanceBookingPattern =
                /\b(book(?:ing)?(?:\s+(?:ahead|in advance|required))?|pre[- ]?book|ticket(?:s|ed)?|reservation|show dates)\b/i;

            return planner.getActivities().filter(activity => {
                if (planner.isCompleted(activity.id)) return false;

                const hours = Number(activity.durationHours);
                if (!Number.isFinite(hours) || hours <= 0) return false;

                const planningText =
                    `${activity.name || ""} ${activity.description || ""}`;

                if (advanceBookingPattern.test(planningText)) return false;

                if (petCheckbox.checked && activity.petFriendly !== true) {
                    return false;
                }

                if (
                    budget.select.value !== "any" &&
                    (
                        activity.estimatedCost == null ||
                        Number(activity.estimatedCost) >
                            Number(budget.select.value)
                    )
                ) {
                    return false;
                }

                if (distance.select.value !== "any") {
                    const km = estimatedDistance(activity.destination);
                    if (km === null || km > Number(distance.select.value)) {
                        return false;
                    }
                }

                return true;
            });
        }

        function buildSuggestions() {
            const maximumHours = Number(duration.select.value);
            const minimumHours = maximumHours >= 8 ? 5.5 :
                maximumHours >= 6 ? 4.5 :
                maximumHours >= 4 ? 2.5 : 1;

            const groups = new Map();

            eligibleActivities().forEach(activity => {
                const destination = (activity.destination || "").trim();
                if (!destination) return;

                if (!groups.has(destination)) {
                    groups.set(destination, []);
                }

                groups.get(destination).push(activity);
            });

            const suggestions = [];

            groups.forEach((items, destination) => {
                const candidates = shuffle(items).sort(
                    (a, b) =>
                        Number(b.durationHours) - Number(a.durationHours)
                );

                const selected = [];
                let totalHours = 0;

                for (const activity of candidates) {
                    const hours = Number(activity.durationHours);

                    if (totalHours + hours > maximumHours) continue;

                    selected.push(activity);
                    totalHours += hours;

                    if (
                        totalHours >= minimumHours &&
                        (maximumHours < 8 || selected.length >= 2)
                    ) {
                        break;
                    }
                }

                if (totalHours < minimumHours) return;
                if (maximumHours >= 8 && selected.length < 2) return;

                suggestions.push({
                    destination,
                    region: selected[0].region || "",
                    activities: selected,
                    totalHours,
                    distance: estimatedDistance(destination)
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

            const formattedDate = new Date(`${dateInput.value}T12:00:00`)
                .toLocaleDateString("en-AU", {
                    weekday:"long",
                    day:"numeric",
                    month:"long",
                    year:"numeric"
                });

            const intro = document.createElement("p");
            intro.className = "generated-day-intro";

            const distanceText = suggestion.distance === null
                ? ""
                : ` · Approximately ${suggestion.distance} km from ${locationInput.value.trim()} (estimated one-way distance)`;

            intro.textContent =
                `${formattedDate} · ` +
                `${suggestion.region ? suggestion.region + " · " : ""}` +
                `Starting from ${locationInput.value.trim()}${distanceText}`;

            const overview = document.createElement("p");
            overview.className = "generated-day-overview";

            const activityNames = suggestion.activities.map(item => item.name);

            overview.textContent =
                `A lovely day out in ${suggestion.destination}, taking in ` +
                `${activityNames.join(", ")}. Allow around ` +
                `${suggestion.totalHours.toFixed(1)} hours for the activities, ` +
                `plus extra time for travelling, refreshments and breaks.`;

            const activityContainer = document.createElement("div");
            const selectedIds =
                new Set(suggestion.activities.map(item => item.id));

            const summary = document.createElement("div");
            summary.className = "generated-day-summary";

            function updateSummary() {
                const selected = suggestion.activities.filter(
                    item => selectedIds.has(item.id)
                );

                const hours = selected.reduce(
                    (total, item) =>
                        total + Number(item.durationHours || 0),
                    0
                );

                summary.textContent =
                    `${selected.length} experiences · ` +
                    `${hours.toFixed(1)} hours of activity`;
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

                const pet = document.createElement("span");
                pet.textContent = activity.petFriendly
                    ? "Pet-friendly"
                    : "Not pet-friendly";

                details.append(name, destination, description, pet);
                label.append(checkbox, details);
                activityContainer.appendChild(label);
            });

            const note = document.createElement("p");
            note.className = "generated-day-meta";
            note.textContent =
                "Activity durations exclude travel and meal breaks. Check opening hours, local pet-access rules and any booking requirements before setting off.";

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.className = "add-activity-button";
            saveButton.textContent = "Save this itinerary";

            saveButton.addEventListener("click", () => {
                if (!dateInput.value || dateInput.value < localDate()) {
                    message.textContent =
                        "Choose today or a future date for your outing.";
                    dateInput.focus();
                    return;
                }

                const ids = suggestion.activities
                    .filter(item => selectedIds.has(item.id))
                    .map(item => item.id);

                if (!ids.length) {
                    message.textContent =
                        "Select at least one experience before saving.";
                    return;
                }

                const saved = planner.saveItinerary({
                    date: dateInput.value,
                    activityIds: ids
                });

                if (!saved) {
                    message.textContent =
                        "Unable to save the itinerary. Check browser storage.";
                    return;
                }

                const link = document.createElement("a");
                link.className = "saved-itinerary-link";
                link.href =
                    `my-adventures.html#saved-itinerary-${encodeURIComponent(saved.id)}`;
                link.textContent = "View and edit your saved itinerary";

                message.textContent =
                    "Your itinerary has been saved in My Adventures. ";

                message.appendChild(link);

                saveButton.disabled = true;
                saveButton.textContent = "Itinerary saved";

                document.dispatchEvent(
                    new CustomEvent("adventureplanner:datachanged")
                );
            });

            updateSummary();

            card.append(
                heading,
                intro,
                overview,
                activityContainer,
                summary,
                note,
                saveButton
            );

            results.appendChild(card);
        }

        async function generate() {
            message.replaceChildren();
            results.replaceChildren();

            if (!dateInput.value || dateInput.value < localDate()) {
                message.textContent =
                    "Choose today or a future date before generating an outing.";
                dateInput.focus();
                return;
            }

            generateButton.disabled = true;
            generateButton.textContent = "Checking location…";

            try {
                await resolveStartingLocation();

                const suggestions = buildSuggestions();

                if (!suggestions.length) {
                    const empty = document.createElement("p");
                    empty.textContent =
                        "No suitable itineraries match these preferences. Try increasing your distance, time or budget, or untick Pet-friendly options.";
                    results.appendChild(empty);
                    return;
                }

                displaySuggestion(suggestions[0]);
            } catch (error) {
                message.textContent = error.message ||
                    "Unable to determine your starting location.";
            } finally {
                generateButton.disabled = false;
                generateButton.textContent = "Generate my day out";
            }
        }

        generateButton.addEventListener("click", generate);
    }

    document.addEventListener("DOMContentLoaded", initialiseDayGenerator);
})();
