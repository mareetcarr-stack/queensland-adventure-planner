"use strict";

/*
 * Adventure Planner — Adventure Dashboard
 * Displayed on the My Adventures page.
 *
 * Includes:
 * - Summary stats
 * - Coming Up
 * - Quick Access
 * - Experiences I've Completed
 * - Saved Day Itineraries
 *
 * Does not include "Recently Completed".
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

        const completedSection = document.createElement("div");
        completedSection.className = "dashboard-completed-section";

        const itinerariesSection = document.createElement("div");
        itinerariesSection.className = "dashboard-itineraries-section";

        section.append(
            heading,
            welcome,
            statistics,
            upcoming,
            shortcuts,
            completedSection,
            itinerariesSection
        );

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
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
                return null;
            }

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

        const formatLongDate = value => {
            if (!value) return "Date not recorded";
            const date = new Date(`${value}T12:00:00`);
            if (Number.isNaN(date.getTime())) return "Date not recorded";
            return date.toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        };

        const makeElement = (tag, className, text) => {
            const node = document.createElement(tag);
            if (className) node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        };

        function makeButton(label, action) {
            const button = makeElement("button", "reset-filters", label);
            button.type = "button";
            button.addEventListener("click", action);
            return button;
        }

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

        function renderCompleted() {
    completedSection.replaceChildren();
    completedSection.appendChild(
        makeElement("h3", "", "Experiences I've Completed")
    );

    const activities = planner.getActivities();
    const completedIds = [...new Set(planner.data.completedActivities || [])];
    const completed = completedIds
        .map(id => activities.find(activity => activity.id === id))
        .filter(Boolean);

    const details = document.createElement("details");
    details.className = "completed-experiences-details";

    details.appendChild(
        makeElement(
            "summary",
            "",
            `${completed.length} completed experience${
                completed.length === 1 ? "" : "s"
            } — show list`
        )
    );

    const list = makeElement("div", "completed-experiences-list");

    if (!completed.length) {
        list.appendChild(
            makeElement(
                "p",
                "dashboard-empty",
                "Your completed experiences will appear here."
            )
        );
    } else {
        completed.forEach(activity => {
            const card = makeElement("article", "adventure-history-card");
            card.append(
                makeElement("h4", "", activity.name),
                makeElement(
                    "p",
                    "",
                    [activity.destination, activity.region]
                        .filter(Boolean)
                        .join(" · ")
                ),
                makeElement(
                    "p",
                    "",
                    `${activity.durationHours || 0} hours · ` +
                        (activity.estimatedCost == null
                            ? "Cost unconfirmed"
                            : activity.estimatedCost === 0
                              ? "Free"
                              : `Estimated $${activity.estimatedCost}`)
                ),
                makeButton("Mark as not completed", () => {
                    planner.toggleCompleted(activity.id);
                    document.dispatchEvent(
                        new CustomEvent("adventureplanner:datachanged")
                    );
                })
            );
            list.appendChild(card);
        });
    }

    details.appendChild(list);
    completedSection.appendChild(details);
}

function renderSavedItineraries() {
    itinerariesSection.replaceChildren();
    itinerariesSection.appendChild(
        makeElement("h3", "", "Saved Day Itineraries")
    );

    const activities = planner.getActivities();
    const archiveIds = new Set(
        Array.isArray(planner.data.archivedItineraries)
            ? planner.data.archivedItineraries
            : []
    );

    const itineraries = [...(planner.data.savedItineraries || [])]
        .filter(item => !archiveIds.has(item.id))
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const details = document.createElement("details");
    details.className = "saved-itineraries-details";

    details.appendChild(
        makeElement(
            "summary",
            "",
            `${itineraries.length} saved itinerary${
                itineraries.length === 1 ? "" : "s"
            } — show list`
        )
    );

    const list = makeElement("div", "saved-itineraries-list");

    if (!itineraries.length) {
        list.appendChild(
            makeElement(
                "p",
                "dashboard-empty",
                "Your saved day trips will appear here."
            )
        );
    } else {
        itineraries.forEach(itinerary => {
            const card = makeElement("article", "adventure-history-card");
            card.id = `saved-itinerary-${itinerary.id}`;

            card.appendChild(
                makeElement("h4", "", formatLongDate(itinerary.date))
            );

            const activityList = document.createElement("ul");
            (itinerary.activityIds || []).forEach(id => {
                const activity = activities.find(item => item.id === id);
                if (activity) {
                    activityList.appendChild(
                        makeElement(
                            "li",
                            "",
                            `${activity.name} — ${
                                activity.destination || activity.region || ""
                            }`
                        )
                    );
                }
            });
            card.appendChild(activityList);

            const actions = makeElement("div", "adventure-history-actions");
            actions.appendChild(
                makeButton("Delete itinerary", () => {
                    if (!window.confirm("Delete this saved itinerary?")) return;
                    if (planner.deleteItinerary(itinerary.id)) {
                        document.dispatchEvent(
                            new CustomEvent("adventureplanner:datachanged")
                        );
                    }
                })
            );
            card.appendChild(actions);
            list.appendChild(card);
        });
    }

    details.appendChild(list);
    itinerariesSection.appendChild(details);
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
            renderCompleted();
            renderSavedItineraries();
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
        return true;
    }

    function tryInit(attemptsLeft) {
        if (initialiseDashboard()) return;

        if (attemptsLeft <= 0) {
            console.error(
                "Adventure Dashboard could not start — AdventurePlanner missing."
            );
            return;
        }

        window.setTimeout(() => tryInit(attemptsLeft - 1), 50);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            () => tryInit(20),
            { once: true }
        );
    } else {
        tryInit(20);
    }
})();
