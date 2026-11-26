
/* Queensland Adventure Planner — unique saved itinerary names and Home tidy-up.
 * Safe version: no MutationObserver loops.
 */
"use strict";

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner is unavailable; itinerary naming was not initialised.");
        return;
    }

    function makeUniqueName(itinerary) {
        const allActivities = planner.getActivities();
        const selected = (itinerary.activityIds || [])
            .map(id => allActivities.find(activity => activity.id === id))
            .filter(Boolean);

        const destination = selected
            .map(activity => activity.destination || activity.region)
            .find(Boolean) || "Queensland";

        const highlights = selected
            .map(activity => activity.name)
            .filter(Boolean)
            .slice(0, 2)
            .join(" & ");

        const date = itinerary.date
            ? new Date(`${itinerary.date}T12:00:00`).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short"
            })
            : "Day Out";

        const base = highlights
            ? `${destination} — ${highlights}`
            : `${destination} — Adventure Day`;

        const existing = new Set(
            (planner.data.savedItineraries || [])
                .filter(item => item.id !== itinerary.id)
                .map(item => item.name)
                .filter(Boolean)
        );

        if (!existing.has(base)) return base;

        const dated = `${base} (${date})`;
        if (!existing.has(dated)) return dated;

        let suffix = 2;
        while (existing.has(`${dated} · ${suffix}`)) suffix++;

        return `${dated} · ${suffix}`;
    }

    // Give newly saved itineraries a unique name.
    if (!planner.saveItinerary.__uniqueNamesApplied) {
        const originalSaveItinerary = planner.saveItinerary.bind(planner);

        const saveWithName = itinerary => {
            const name = makeUniqueName(itinerary);
            const saved = originalSaveItinerary(itinerary);

            if (!saved) return null;

            saved.name = name;

            if (!planner.saveData()) {
                planner.deleteItinerary(saved.id);
                return null;
            }

            return saved;
        };

        saveWithName.__uniqueNamesApplied = true;
        planner.saveItinerary = saveWithName;
    }

    function formatDate(value) {
        if (!value) return "Date not recorded";

        const date = new Date(`${value}T12:00:00`);
        if (Number.isNaN(date.getTime())) return "Date not recorded";

        return date.toLocaleDateString("en-AU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function updateSavedItineraryCards() {
        (planner.data.savedItineraries || []).forEach(itinerary => {
            if (!itinerary.id) return;

            const card = document.getElementById(
                `saved-itinerary-${itinerary.id}`
            );

            if (!card) return;

            const heading = card.querySelector("h4");
            if (!heading) return;

            const name = itinerary.name || makeUniqueName(itinerary);

            if (!itinerary.name) {
                itinerary.name = name;
                planner.saveData();
            }

            if (heading.textContent !== name) {
                heading.textContent = name;
            }

            let dateLine = card.querySelector(".saved-itinerary-date");

            if (!dateLine) {
                dateLine = document.createElement("p");
                dateLine.className = "saved-itinerary-date";
                heading.insertAdjacentElement("afterend", dateLine);
            }

            const formattedDate = formatDate(itinerary.date);

            if (dateLine.textContent !== formattedDate) {
                dateLine.textContent = formattedDate;
            }
        });
    }

    function updateComingUpCards() {
        const plansById = new Map(
            (planner.data.savedItineraries || [])
                .map(item => [item.id, item])
        );

        document.querySelectorAll(
            ".dashboard-plan-card[href*='saved-itinerary-']"
        ).forEach(card => {
            const href = card.getAttribute("href") || "";
            const match = href.match(/saved-itinerary-([^&#]+)/);

            if (!match) return;

            let id;

            try {
                id = decodeURIComponent(match[1]);
            } catch {
                id = match[1];
            }

            const itinerary = plansById.get(id);
            if (!itinerary) return;

            const title = card.querySelector("strong");
            const name = itinerary.name || "Saved day itinerary";

            if (title && title.textContent !== name) {
                title.textContent = name;
            }
        });
    }

    function removeQuickAccess() {
        const shortcuts = document.querySelector(
            "#home-dashboard .dashboard-shortcuts"
        );

        if (shortcuts) shortcuts.remove();
    }

    function refresh() {
        updateSavedItineraryCards();
        updateComingUpCards();
        removeQuickAccess();
    }

    function initialise() {
        refresh();

        document.addEventListener(
            "adventureplanner:datachanged",
            refresh
        );

        window.addEventListener("focus", refresh);
        window.addEventListener("pageshow", refresh);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialise,
            { once: true }
        );
    } else {
        initialise();
    }
})();
