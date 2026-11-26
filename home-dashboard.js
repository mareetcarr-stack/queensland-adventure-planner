
"use strict";

/*
 * Adventure Planner — Home Dashboard
 * Displays activity progress, upcoming plans and quick navigation.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    if (document.getElementById("home-dashboard")) return;

    const section = document.createElement("section");
    section.id = "home-dashboard";
    section.className = "home-dashboard";

    const heading = document.createElement("h2");
    heading.textContent = "Your Adventure Dashboard";

    const welcome = document.createElement("p");
    welcome.className = "dashboard-welcome";
    welcome.textContent = "A snapshot of your adventures and what's coming up.";

    const statistics = document.createElement("div");
    statistics.className = "dashboard-statistics";

    const upcoming = document.createElement("div");
    upcoming.className = "dashboard-upcoming";

    const shortcuts = document.createElement("div");
    shortcuts.className = "dashboard-shortcuts";

    const recent = document.createElement("div");
    recent.className = "dashboard-recent";

    section.append(
        heading,
        welcome,
        statistics,
        upcoming,
        shortcuts,
        recent
    );

    const main = document.querySelector("main");
    const welcomeSection = main?.querySelector(".welcome");

    if (welcomeSection) {
        welcomeSection.insertAdjacentElement("afterend", section);
    } else if (main) {
        main.insertBefore(section, main.firstChild);
    } else {
        return;
    }

    const localDate = () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const parseDate = value => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;

        const date = new Date(`${value}T12:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const formatDate = value => {
        const date = parseDate(value);

        if (!date) return "Date not set";

        return date.toLocaleDateString("en-AU", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const makeElement = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    function createStat(label, value, detail) {
        const card = makeElement("article", "dashboard-stat-card");

        card.append(
            makeElement("span", "dashboard-stat-value", String(value)),
            makeElement("span", "dashboard-stat-label", label),
            makeElement("span", "dashboard-stat-detail", detail)
        );

        return card;
    }

    function createLink(label, targetId) {
        const target = document.getElementById(targetId);

        if (!target) return null;

        const link = makeElement("a", "dashboard-shortcut", label);
        link.href = `#${targetId}`;

        return link;
    }

    function getUpcomingPlans() {
        const today = localDate();

        const dayPlans = (planner.data.savedItineraries || [])
            .filter(item => {
                const date = parseDate(item.date);
                return date && date >= today;
            })
            .map(item => ({
                type: "Day trip",
                name: "Planned adventure day",
                date: item.date,
                id: item.id,
                target: "day-generator"
            }));

        const holidays = (planner.data.savedHolidayPlans || [])
            .filter(item => {
                const end = parseDate(item.endDate);
                return end && end >= today;
            })
            .map(item => ({
                type: "Holiday",
                name: item.name || "Saved holiday",
                date: item.startDate,
                id: item.id,
                target: "holiday-planner-feature"
            }));

        return [...dayPlans, ...holidays].sort((a, b) =>
            (a.date || "").localeCompare(b.date || "")
        );
    }

    function renderUpcoming() {
        upcoming.replaceChildren();

        upcoming.appendChild(
            makeElement("h3", "", "Coming Up")
        );

        const plans = getUpcomingPlans();

        if (!plans.length) {
            upcoming.appendChild(
                makeElement(
                    "p",
                    "dashboard-empty",
                    "Nothing scheduled yet. Start planning your next adventure."
                )
            );

            const link = createLink("Plan a day trip", "day-generator");
            if (link) upcoming.appendChild(link);

            return;
        }

        plans.slice(0, 4).forEach(plan => {
            const card = makeElement("article", "dashboard-plan-card");

            card.append(
                makeElement("span", "dashboard-plan-type", plan.type),
                makeElement("strong", "", plan.name),
                makeElement("span", "dashboard-plan-date", formatDate(plan.date))
            );

            upcoming.appendChild(card);
        });
    }

    function renderShortcuts() {
        shortcuts.replaceChildren();
        shortcuts.appendChild(
            makeElement("h3", "", "Quick Access")
        );

        const links = [
            ["Discover Adventures", "activity-browser"],
            ["Generate a Day Trip", "day-generator"],
            ["Holiday Planner", "holiday-planner-feature"],
            ["My Adventures", "my-adventures"],
            ["My Shortlist", "my-shortlist"],
            ["Explore the Map", "adventure-map"],
            ["Packing Checklist", "holiday-packing"],
            ["Bookings and Notes", "holiday-bookings"]
        ];

        const container = makeElement("div", "dashboard-shortcut-grid");

        links.forEach(([label, target]) => {
            const link = createLink(label, target);
            if (link) container.appendChild(link);
        });

        shortcuts.appendChild(container);
    }

    function renderRecent() {
        recent.replaceChildren();

        recent.appendChild(
            makeElement("h3", "", "Recently Completed")
        );

        const completedIds = planner.data.completedActivities || [];

        const completed = completedIds
            .map(id => planner.getActivities().find(item => item.id === id))
            .filter(Boolean)
            .slice(-5)
            .reverse();

        if (!completed.length) {
            recent.appendChild(
                makeElement(
                    "p",
                    "dashboard-empty",
                    "Your completed adventures will appear here."
                )
            );
            return;
        }

        const list = makeElement("ul", "dashboard-completed-list");

        completed.forEach(activity => {
            const item = makeElement(
                "li",
                "",
                `${activity.name} — ${activity.destination || activity.region || ""}`
            );

            list.appendChild(item);
        });

        recent.appendChild(list);
    }

    function render() {
        const activities = planner.getActivities();
        const completed = planner.data.completedActivities || [];
        const savedDays = planner.data.savedItineraries || [];
        const holidays = planner.data.savedHolidayPlans || [];
        const shortlist = planner.data.shortlistedActivities || [];

        const remaining = activities.length -
            activities.filter(activity => completed.includes(activity.id)).length;

        statistics.replaceChildren(
            createStat(
                "Experiences",
                activities.length,
                "In your discovery library"
            ),
            createStat(
                "Completed",
                completed.length,
                "Adventures experienced"
            ),
            createStat(
                "Still to explore",
                Math.max(0, remaining),
                "Experiences not yet completed"
            ),
            createStat(
                "Saved plans",
                savedDays.length + holidays.length,
                `${savedDays.length} day trips · ${holidays.length} holidays`
            ),
            createStat(
                "Shortlisted",
                shortlist.length,
                "Experiences saved for later"
            )
        );

        renderUpcoming();
        renderShortcuts();
        renderRecent();
    }

    window.addEventListener("adventureplanner:datachanged", render);
    window.addEventListener("focus", render);
    window.addEventListener("pageshow", render);

    document.addEventListener("click", event => {
        if (event.target.closest("button")) {
            window.setTimeout(render, 100);
        }
    });

    render();

    console.log("Adventure Dashboard initialised.");
})();
