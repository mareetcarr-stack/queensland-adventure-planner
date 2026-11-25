
"use strict";

/*
 * Adventure Planner — Interactive Map
 * Uses Leaflet and OpenStreetMap.
 * Coordinates represent approximate destination locations.
 */

(() => {
    const LOCATIONS = {
        "Redcliffe": [-27.230, 153.113],
        "Woody Point": [-27.256, 153.104],
        "Bribie Island": [-27.064, 153.158],
        "Maleny": [-26.760, 152.850],
        "Noosa": [-26.395, 153.091],
        "Kenilworth": [-26.592, 152.728],
        "Woombye": [-26.661, 152.962],
        "Scarborough": [-27.201, 153.109],
        "Wellington Point": [-27.483, 153.244],
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
        "Tintenbar": [-28.797, 153.513],
        "Bangalow": [-28.686, 153.522],
        "Montecollum": [-28.574, 153.459],
        "Nightcap National Park": [-28.570, 153.330],
        "Wivenhoe Dam": [-27.395, 152.608],
        "Mount Mee": [-27.080, 152.750],
        "Dayboro": [-27.196, 152.825],
        "Hamilton": [-27.439, 153.066],
        "Biggera Waters": [-27.927, 153.400],
        "Beerwah": [-26.858, 152.961],
        "Oxenford": [-27.891, 153.313],
        "Margate": [-27.243, 153.106]
    };

    function loadLeaflet() {
        if (window.L) return Promise.resolve();

        if (window.adventureLeafletLoading) {
            return window.adventureLeafletLoading;
        }

        window.adventureLeafletLoading = new Promise((resolve, reject) => {
            if (!document.querySelector("#leaflet-css")) {
                const css = document.createElement("link");
                css.id = "leaflet-css";
                css.rel = "stylesheet";
                css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(css);
            }

            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = resolve;
            script.onerror = () => reject(
                new Error("Unable to load the map library.")
            );

            document.head.appendChild(script);
        });

        return window.adventureLeafletLoading;
    }

    function initialise() {
        if (!window.AdventurePlanner) return;

        if (document.getElementById("adventure-map-section")) return;

        const section = document.createElement("section");
        section.className = "feature";
        section.id = "adventure-map-section";

        const heading = document.createElement("h2");
        heading.textContent = "Explore the Map";

        const intro = document.createElement("p");
        intro.textContent =
            "See where your saved experiences are located across South-East Queensland and Northern NSW. Select a marker to see what's available at each destination.";

        const controls = document.createElement("div");
        controls.className = "map-view-controls";

        function makeFilter(labelText, id) {
            const label = document.createElement("label");
            label.className = "filter-field";

            const caption = document.createElement("span");
            caption.textContent = labelText;

            const select = document.createElement("select");
            select.id = id;

            label.append(caption, select);
            controls.appendChild(label);

            return select;
        }

        const regionFilter = makeFilter("Region", "map-region-filter");
        const categoryFilter = makeFilter("Experience type", "map-category-filter");

        const mapMessage = document.createElement("p");
        mapMessage.className = "map-view-message";
        mapMessage.setAttribute("aria-live", "polite");
        mapMessage.textContent = "Loading map...";

        const mapContainer = document.createElement("div");
        mapContainer.id = "adventure-map";

        const legend = document.createElement("p");
        legend.className = "map-view-legend";
        legend.textContent =
            "Markers show approximate destination locations. They do not represent exact attraction entrances or verified routes.";

        section.append(
            heading,
            intro,
            controls,
            mapMessage,
            mapContainer,
            legend
        );

        const main = document.querySelector("main");
        const footer = main?.querySelector("footer");

        if (footer) main.insertBefore(section, footer);
        else main?.appendChild(section);

        const style = document.createElement("style");
        style.textContent = `
            #adventure-map-section { margin-top: 24px; }

            .map-view-controls {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
                margin: 18px 0;
            }

            .map-view-controls select {
                width: 100%;
                min-height: 44px;
                padding: 10px;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: white;
                color: var(--text);
                font: inherit;
            }

            #adventure-map {
                width: 100%;
                height: 520px;
                border: 1px solid var(--border);
                border-radius: 12px;
                z-index: 1;
                background: var(--surface);
            }

            .map-view-message {
                color: var(--forest);
                font-weight: 600;
            }

            .map-view-legend {
                margin-top: 12px;
                color: var(--muted);
                font-size: .85rem;
                line-height: 1.5;
            }

            .map-popup h3 {
                margin: 0 0 8px;
                color: #183b35;
                font-size: 1rem;
            }

            .map-popup ul {
                margin: 0;
                padding-left: 19px;
                line-height: 1.6;
            }

            .map-popup li { margin-bottom: 5px; }

            .map-popup .completed-label {
                color: #687871;
                font-size: .8rem;
            }

            @media (max-width: 600px) {
                .map-view-controls { grid-template-columns: 1fr; }
                #adventure-map { height: 430px; }
            }
        `;

        document.head.appendChild(style);

        const allActivities = window.AdventurePlanner.getActivities();

        const regions = [...new Set(
            allActivities.map(activity => activity.region).filter(Boolean)
        )].sort();

        const categories = [...new Set(
            allActivities.flatMap(activity => activity.category || [])
        )].sort();

        function populateFilter(select, firstLabel, values, format) {
            const first = document.createElement("option");
            first.value = "all";
            first.textContent = firstLabel;
            select.appendChild(first);

            values.forEach(value => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = format ? format(value) : value;
                select.appendChild(option);
            });
        }

        populateFilter(regionFilter, "All regions", regions);
        populateFilter(
            categoryFilter,
            "All experience types",
            categories,
            value => value.replaceAll("-", " ")
                .replace(/\b\w/g, character => character.toUpperCase())
        );

        let map;
        let markerLayer;

        function renderMarkers() {
            if (!map || !markerLayer) return;

            markerLayer.clearLayers();

            const activities = window.AdventurePlanner.getActivities();
            const groups = new Map();

            activities.forEach(activity => {
                const destination = activity.destination;

                if (!destination || !LOCATIONS[destination]) return;

                if (
                    regionFilter.value !== "all" &&
                    activity.region !== regionFilter.value
                ) return;

                if (
                    categoryFilter.value !== "all" &&
                    !(activity.category || []).includes(categoryFilter.value)
                ) return;

                if (!groups.has(destination)) {
                    groups.set(destination, []);
                }

                groups.get(destination).push(activity);
            });

            let markerCount = 0;
            let activityCount = 0;

            groups.forEach((items, destination) => {
                const coordinates = LOCATIONS[destination];
                const marker = L.marker(coordinates);

                const popup = document.createElement("div");
                popup.className = "map-popup";

                const title = document.createElement("h3");
                title.textContent = destination;

                const list = document.createElement("ul");

                items.forEach(activity => {
                    const item = document.createElement("li");
                    item.textContent = activity.name;

                    if (window.AdventurePlanner.isCompleted(activity.id)) {
                        const completed = document.createElement("span");
                        completed.className = "completed-label";
                        completed.textContent = " (completed)";
                        item.appendChild(completed);
                    }

                    list.appendChild(item);
                });

                popup.append(title, list);
                marker.bindPopup(popup);

                marker.addTo(markerLayer);

                markerCount++;
                activityCount += items.length;
            });

            mapMessage.textContent =
                `${markerCount} destinations shown · ${activityCount} matching experiences.`;

            if (markerCount) {
                const bounds = markerLayer.getBounds();

                if (bounds.isValid()) {
                    map.fitBounds(bounds, {
                        padding: [25, 25],
                        maxZoom: 11
                    });
                }
            }
        }

        regionFilter.addEventListener("change", renderMarkers);
        categoryFilter.addEventListener("change", renderMarkers);

        loadLeaflet()
            .then(() => {
                map = L.map(mapContainer).setView(
                    [-27.55, 152.95],
                    8
                );

                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                        maxZoom: 19,
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                ).addTo(map);

                markerLayer = L.layerGroup().addTo(map);

                renderMarkers();

                setTimeout(() => map.invalidateSize(), 150);

                console.log("Adventure map initialised.");
            })
            .catch(error => {
                console.error(error);
                mapMessage.textContent =
                    "The map could not be loaded. Check your internet connection and reload the page.";
            });
    }

    document.addEventListener("DOMContentLoaded", initialise);
})();
