
"use strict";

/*
 * My Shortlist
 * Save experiences to revisit when planning future outings.
 */

(() => {
    function initialise() {
        if (!window.AdventurePlanner) return;

        const planner = window.AdventurePlanner;

        if (!Array.isArray(planner.data.shortlistedActivities)) {
            planner.data.shortlistedActivities = [];
            planner.saveData();
        }

        const section = document.createElement("section");
        section.className = "feature";
        section.id = "my-shortlist";

        const heading = document.createElement("h2");
        heading.textContent = "⭐ My Shortlist";

        const intro = document.createElement("p");
        intro.textContent =
            "Keep track of experiences you'd like to try. Shortlisted activities remain here until you remove them or mark them as completed.";

        const search = document.createElement("input");
        search.type = "search";
        search.className = "search-input";
        search.placeholder = "Search activities or destinations...";
        search.setAttribute("aria-label", "Search activities for your shortlist");

        const filter = document.createElement("select");
        filter.setAttribute("aria-label", "Filter shortlist activities");

        [
            { value: "all", label: "All experiences" },
            { value: "shortlisted", label: "My shortlisted experiences" },
            { value: "not-shortlisted", label: "Not yet shortlisted" }
        ].forEach(option => {
            const item = document.createElement("option");
            item.value = option.value;
            item.textContent = option.label;
            filter.appendChild(item);
        });

        const count = document.createElement("p");
        count.setAttribute("aria-live", "polite");

        const results = document.createElement("div");
        results.className = "shortlist-results";

        const style = document.createElement("style");
        style.textContent = `
            #my-shortlist .shortlist-results {
                display: grid;
                gap: 12px;
                margin-top: 18px;
            }

            #my-shortlist .shortlist-card {
                padding: 16px;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: white;
            }

            #my-shortlist .shortlist-card h3 {
                margin: 0 0 6px;
                color: var(--forest);
            }

            #my-shortlist .shortlist-card p {
                margin: 6px 0;
                line-height: 1.5;
            }

            #my-shortlist .shortlist-meta {
                color: var(--muted);
                font-size: .9rem;
            }

            #my-shortlist .shortlist-controls {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 10px;
                margin-top: 16px;
            }

            #my-shortlist .shortlist-controls input,
            #my-shortlist .shortlist-controls select {
                width: 100%;
                min-height: 44px;
                padding: 10px;
                border: 1px solid var(--border);
                border-radius: 7px;
                background: white;
                font: inherit;
            }

            #my-shortlist .shortlist-button {
                margin-top: 10px;
                padding: 9px 13px;
                border: 1px solid var(--border);
                border-radius: 7px;
                background: var(--forest);
                color: white;
                font: inherit;
                cursor: pointer;
            }

            #my-shortlist .shortlist-button.remove {
                background: white;
                color: var(--forest);
            }

            @media (max-width: 600px) {
                #my-shortlist .shortlist-controls {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);

        const controls = document.createElement("div");
        controls.className = "shortlist-controls";
        controls.append(search, filter);

        section.append(
            heading,
            intro,
            controls,
            count,
            results
        );

        const main = document.querySelector("main");
        const footer = main?.querySelector("footer");

        if (footer) {
            main.insertBefore(section, footer);
        } else {
            main?.appendChild(section);
        }

        function saveShortlist() {
            planner.data.shortlistedActivities = [
                ...new Set(planner.data.shortlistedActivities)
            ];

            const saved = planner.saveData();

            if (!saved) {
                window.alert(
                    "Unable to save your shortlist. Check your browser storage."
                );
            }

            return saved;
        }

        function render() {
            results.replaceChildren();

            const activities = planner.getActivities();
            const shortlisted = new Set(
                planner.data.shortlistedActivities || []
            );

            const term = search.value.trim().toLowerCase();

            const matching = activities.filter(activity => {
                const isSaved = shortlisted.has(activity.id);

                if (
                    filter.value === "shortlisted" &&
                    !isSaved
                ) return false;

                if (
                    filter.value === "not-shortlisted" &&
                    isSaved
                ) return false;

                if (planner.isCompleted(activity.id)) return false;

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

            const savedCount = activities.filter(activity =>
                shortlisted.has(activity.id) &&
                !planner.isCompleted(activity.id)
            ).length;

            count.textContent =
                `${savedCount} experiences shortlisted · ${matching.length} shown`;

            if (!matching.length) {
                const empty = document.createElement("p");
                empty.textContent = shortlisted.size
                    ? "No experiences match these filters."
                    : "You haven't shortlisted any experiences yet. Browse the collection below and add the ones you'd like to try.";

                results.appendChild(empty);
                return;
            }

            matching.forEach(activity => {
                const card = document.createElement("article");
                card.className = "shortlist-card";

                const name = document.createElement("h3");
                name.textContent = activity.name;

                const location = document.createElement("p");
                location.className = "shortlist-meta";
                location.textContent =
                    `${activity.destination} · ${activity.region}`;

                const description = document.createElement("p");
                description.textContent =
                    activity.description || "Explore this experience.";

                const details = document.createElement("p");
                details.className = "shortlist-meta";

                const cost = activity.estimatedCost == null
                    ? activity.cost === "free"
                        ? "Free"
                        : "Cost to check"
                    : activity.estimatedCost === 0
                        ? "Free"
                        : `Approx. $${activity.estimatedCost} per person`;

                const dog = activity.dogPolicy === "friendly"
                    ? "Dog-friendly"
                    : activity.dogPolicy === "restricted"
                        ? "Dogs not permitted"
                        : "Dog access to verify";

                details.textContent =
                    `${activity.durationHours || 0} hours · ${cost} · ${dog}`;

                const button = document.createElement("button");
                button.type = "button";
                button.className = shortlisted.has(activity.id)
                    ? "shortlist-button remove"
                    : "shortlist-button";

                button.textContent = shortlisted.has(activity.id)
                    ? "Remove from shortlist"
                    : "＋ Add to shortlist";

                button.addEventListener("click", () => {
                    const current = new Set(
                        planner.data.shortlistedActivities || []
                    );

                    if (current.has(activity.id)) {
                        current.delete(activity.id);
                    } else {
                        current.add(activity.id);
                    }

                    planner.data.shortlistedActivities = [...current];

                    if (saveShortlist()) {
                        render();
                    }
                });

                card.append(
                    name,
                    location,
                    description,
                    details,
                    button
                );

                results.appendChild(card);
            });
        }

        search.addEventListener("input", render);
        filter.addEventListener("change", render);

        document.addEventListener(
            "adventureplanner:datachanged",
            render
        );

        render();

        console.log("My Shortlist initialised.");
    }

    document.addEventListener("DOMContentLoaded", initialise);
})();
