"use strict";

/*
 * Adventure Planner — Adventure Dashboard
 * Displayed on the My Adventures page.
 * No "Recently Completed" section.
 */

(() => {
    function initialiseDashboard() {
        const planner = window.AdventurePlanner;

        if (!planner || document.body.dataset.page !== "my-adventures") {
            return false;
        }

        if (document.getElementById("home-dashboard")) {
            return true;
        }

        const section = document.createElement("section");
        section.id = "home-dashboard";
        section.className = "home-dashboard feature";

        const heading = document.createElement("h2");
        heading.textContent = "Your Adventure Dashboard";

        const welcome = document.createElement("p");
        welcome.className = "dashboard-welcome";
        welcome.textContent =
            "A snapshot of your adventures and what's coming up.";

        const statistics = document.createElement("div");
        statistics.className = "dashboard-statistics";

        const upcoming = document.createElement("div");
        upcoming.className = "dashboard-upcoming";

        const shortcuts = document.createElement("div");
        shortcuts.className = "dashboard-shortcuts";

        section.append(heading, welcome, statistics, upcoming, shortcuts);

        const main = document.querySelector("main");
        const welcomeSection = main?.querySelector(".welcome");

        if (welcomeSection) {
            welcomeSection.insertAdjacentElement("afterend", section);
        } else if (main) {
            main.insertBefore(section, main.firstChild);
        } else {
            return false;
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

        function createLink(label, url) {
            const link = makeElement("a", "dashboard-shortcut", label);
            link.href = url;
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
                    href: `my-adventures.html#saved-itinerary-${encodeURIComponent(item.id)}`
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
                    href: "holidays.html"
                }));

            return [...dayPlans, ...holidays].sort((a, b) =>
                (a.date || "").localeCompare(b.date || "")
            );
        }

        function renderUpcoming() {
            upcoming.replaceChildren();
            upcoming.appendChild(makeElement("h3", "", "Coming Up"));

            const plans = getUpcomingPlans();

            if (!plans.length) {
                upcoming.appendChild(
                    makeElement(
                        "p",
                        "dashboard-empty",
                        "Nothing scheduled yet. Start planning your next adventure."
                    )
                );
                upcoming.appendChild(createLink("Plan a day trip", "index.html"));
                return;
            }

            plans.slice(0, 4).forEach(plan => {
                const card = makeElement("a", "dashboard-plan-card");
                card.href = plan.href;
                card.setAttribute(
                    "aria-label",
                    `${plan.type}: ${plan.name}, ${formatDate(plan.date)}. Open saved plan.`
                );
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
            shortcuts.appendChild(makeElement("h3", "", "Quick Access"));

            const links = [
                ["Plan a Day", "index.html"],
                ["Discover Adventures", "discover.html"],
                ["My Shortlist", "shortlist.html?view=saved"]
            ];

            const container = makeElement("div", "dashboard-shortcut-grid");
            links.forEach(([label, url]) => {
                container.appendChild(createLink(label, url));
            });
            shortcuts.appendChild(container);
        }

        function render() {
            const activities = planner.getActivities();
            const completed = planner.data.completedActivities || [];
            const savedDays = planner.data.savedItineraries || [];
            const holidays = planner.data.savedHolidayPlans || [];
            const shortlist = planner.data.shortlistedActivities || [];

            const remaining =
                activities.length -
                activities.filter(item => completed.includes(item.id)).length;

            statistics.replaceChildren(
                createStat("Experiences", activities.length, "In your discovery library"),
                createStat("Completed", completed.length, "Adventures experienced"),
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
                createStat("Shortlisted", shortlist.length, "Experiences saved for later")
            );

            renderUpcoming();
            renderShortcuts();
        }

        window.addEventListener("adventureplanner:datachanged", render);
        window.addEventListener("focus", render);
        window.addEventListener("pageshow", render);

        render();
        console.log("Adventure Dashboard initialised.");
        return true;
    }

    function tryInit(attemptsLeft) {
        if (initialiseDashboard()) return;
        if (attemptsLeft <= 0) {
            console.error("Adventure Dashboard could not start — AdventurePlanner missing.");
            return;
        }
        window.setTimeout(() => tryInit(attemptsLeft - 1), 50);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => tryInit(20), { once: true });
    } else {
        tryInit(20);
    }
})();
