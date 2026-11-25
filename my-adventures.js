
"use strict";

/*
 * My Adventures Dashboard
 * Shows completed experiences, saved day itineraries and holiday plans.
 */

(() => {
    function initialiseMyAdventures() {
        if (!window.AdventurePlanner) return;

        const existing = document.getElementById("my-adventures-dashboard");
        if (existing) existing.remove();

        const planner = window.AdventurePlanner;
        const section = document.createElement("section");

        section.className = "feature";
        section.id = "my-adventures-dashboard";

        const style = document.createElement("style");
        style.textContent = `
            #my-adventures-dashboard .adventure-dashboard-stats {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 12px;
                margin: 20px 0;
            }

            #my-adventures-dashboard .adventure-stat {
                padding: 16px 10px;
                border-radius: 10px;
                background: var(--surface);
                text-align: center;
            }

            #my-adventures-dashboard .adventure-stat strong {
                display: block;
                color: var(--forest);
                font-size: 1.7rem;
            }

            #my-adventures-dashboard .adventure-stat span {
                color: var(--muted);
                font-size: .82rem;
            }

            #my-adventures-dashboard .adventure-dashboard-group {
                margin-top: 28px;
            }

            #my-adventures-dashboard .adventure-dashboard-group > h3 {
                color: var(--forest);
                margin-bottom: 12px;
            }

            #my-adventures-dashboard .adventure-history-card {
                padding: 16px;
                margin-bottom: 12px;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: white;
            }

            #my-adventures-dashboard .adventure-history-card h4 {
                margin: 0 0 6px;
                color: var(--forest);
            }

            #my-adventures-dashboard .adventure-history-card p {
                margin: 5px 0;
                color: var(--muted);
                line-height: 1.5;
            }

            #my-adventures-dashboard .adventure-history-card ul {
                padding-left: 22px;
                line-height: 1.7;
            }

            #my-adventures-dashboard .adventure-history-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
            }

            #my-adventures-dashboard .adventure-history-actions button {
                flex: 0 1 auto;
            }

            @media (max-width: 500px) {
                #my-adventures-dashboard .adventure-dashboard-stats {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);

        const heading = document.createElement("h2");
        heading.textContent = "My Adventures";

        const intro = document.createElement("p");
        intro.textContent =
            "Your personal record of places explored, experiences completed and trips planned.";

        const stats = document.createElement("div");
        stats.className = "adventure-dashboard-stats";

        const completedContainer = document.createElement("div");
        completedContainer.className = "adventure-dashboard-group";

        const itineraryContainer = document.createElement("div");
        itineraryContainer.className = "adventure-dashboard-group";

        const holidayContainer = document.createElement("div");
        holidayContainer.className = "adventure-dashboard-group";

        const customContainer = document.createElement("div");
        customContainer.className = "adventure-dashboard-group";

        section.append(
            heading,
            intro,
            stats,
            completedContainer,
            itineraryContainer,
            holidayContainer,
            customContainer
        );

        const main = document.querySelector("main");
        const footer = main?.querySelector("footer");

        if (footer) main.insertBefore(section, footer);
        else main?.appendChild(section);

        function makeElement(tag, className, text) {
            const element = document.createElement(tag);

            if (className) element.className = className;
            if (text !== undefined) element.textContent = text;

            return element;
        }

        function formatDate(value) {
            if (!value) return "Date not recorded";

            const date = new Date(`${value}T12:00:00`);

            if (Number.isNaN(date.getTime())) {
                return "Date not recorded";
            }

            return date.toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        function makeStat(value, label) {
            const box = makeElement("div", "adventure-stat");
            box.append(
                makeElement("strong", "", value),
                makeElement("span", "", label)
            );
            return box;
        }

        function render() {
            const activities = planner.getActivities();
            const completedIds = [...new Set(
                planner.data.completedActivities || []
            )];

            const completed = completedIds
                .map(id => activities.find(activity => activity.id === id))
                .filter(Boolean);

            const itineraries = [
                ...(planner.data.savedItineraries || [])
            ].sort((a, b) => b.date.localeCompare(a.date));

            const holidays = [
                ...(planner.data.savedHolidayPlans || [])
            ].sort((a, b) => a.startDate.localeCompare(b.startDate));

            const customActivities = planner.data.activities || [];

            stats.replaceChildren(
                makeStat(completed.length, "Experiences completed"),
                makeStat(itineraries.length, "Saved day itineraries"),
                makeStat(holidays.length, "Saved holidays")
            );

            // Completed experiences

            completedContainer.replaceChildren(
                makeElement("h3", "", "✓ Experiences I've Completed")
            );

            if (!completed.length) {
                completedContainer.appendChild(
                    makeElement(
                        "p",
                        "",
                        "Your completed experiences will appear here. Mark an activity as completed in Discover Adventures."
                    )
                );
            } else {
                completed.forEach(activity => {
                    const card = makeElement(
                        "article",
                        "adventure-history-card"
                    );

                    card.append(
                        makeElement("h4", "", activity.name),
                        makeElement(
                            "p",
                            "",
                            `${activity.destination} · ${activity.region}`
                        ),
                        makeElement(
                            "p",
                            "",
                            `${activity.durationHours || 0} hours · ${
                                activity.estimatedCost == null
                                    ? "Cost unconfirmed"
                                    : activity.estimatedCost === 0
                                        ? "Free"
                                        : `Estimated $${activity.estimatedCost}`
                            }`
                        )
                    );

                    const button = makeElement(
                        "button",
                        "reset-filters",
                        "Mark as not completed"
                    );

                    button.type = "button";

                    button.addEventListener("click", () => {
                        planner.toggleCompleted(activity.id);
                        render();

                        if (typeof renderActivityBrowser === "function") {
                            renderActivityBrowser();
                        }

                        if (typeof renderDayPlanner === "function") {
                            renderDayPlanner();
                        }
                    });

                    card.appendChild(button);
                    completedContainer.appendChild(card);
                });
            }

            // Saved day itineraries

            itineraryContainer.replaceChildren(
                makeElement("h3", "", "🗓️ Saved Day Itineraries")
            );

            if (!itineraries.length) {
                itineraryContainer.appendChild(
                    makeElement(
                        "p",
                        "",
                        "Your saved day trips will appear here."
                    )
                );
            } else {
                itineraries.forEach(itinerary => {
                    const card = makeElement(
                        "article",
                        "adventure-history-card"
                    );

                    card.appendChild(
                        makeElement("h4", "", formatDate(itinerary.date))
                    );

                    const list = document.createElement("ul");

                    (itinerary.activityIds || []).forEach(id => {
                        const activity = activities.find(
                            item => item.id === id
                        );

                        if (activity) {
                            list.appendChild(
                                makeElement(
                                    "li",
                                    "",
                                    `${activity.name} — ${activity.destination}`
                                )
                            );
                        }
                    });

                    card.appendChild(list);

                    const buttons = makeElement(
                        "div",
                        "adventure-history-actions"
                    );

                    const deleteButton = makeElement(
                        "button",
                        "reset-filters",
                        "Delete itinerary"
                    );

                    deleteButton.type = "button";

                    deleteButton.addEventListener("click", () => {
                        if (!window.confirm("Delete this saved itinerary?")) {
                            return;
                        }

                        if (planner.deleteItinerary(itinerary.id)) {
                            render();

                            if (typeof renderDayPlanner === "function") {
                                renderDayPlanner();
                            }
                        }
                    });

                    buttons.appendChild(deleteButton);
                    card.appendChild(buttons);
                    itineraryContainer.appendChild(card);
                });
            }

            // Saved holidays

            holidayContainer.replaceChildren(
                makeElement("h3", "", "✈️ My Holiday Plans")
            );

            if (!holidays.length) {
                holidayContainer.appendChild(
                    makeElement(
                        "p",
                        "",
                        "Your multi-day holiday schedules will appear here."
                    )
                );
            } else {
                holidays.forEach(holiday => {
                    const card = makeElement(
                        "article",
                        "adventure-history-card"
                    );

                    const title = makeElement("h4", "", holiday.name);

                    const dateRange = makeElement(
                        "p",
                        "",
                        `${formatDate(holiday.startDate)} to ${formatDate(holiday.endDate)}`
                    );

                    const dayList = document.createElement("ul");
                    let activityCount = 0;

                    (holiday.days || []).forEach((day, index) => {
                        const names = (day.activityIds || [])
                            .map(id => activities.find(
                                activity => activity.id === id
                            ))
                            .filter(Boolean)
                            .map(activity => activity.name);

                        activityCount += names.length;

                        const item = makeElement(
                            "li",
                            "",
                            `Day ${index + 1}: ${
                                names.length ? names.join(", ") : "No activities planned"
                            }`
                        );

                        dayList.appendChild(item);
                    });

                    card.append(
                        title,
                        dateRange,
                        makeElement(
                            "p",
                            "",
                            `${holiday.days?.length || 0} days · ${activityCount} allocated experiences`
                        ),
                        dayList
                    );

                    holidayContainer.appendChild(card);
                });
            }

            // Custom activities

            customContainer.replaceChildren(
                makeElement("h3", "", "＋ My Personal Activities")
            );

            if (!customActivities.length) {
                customContainer.appendChild(
                    makeElement(
                        "p",
                        "",
                        "Activities you add yourself will be listed here."
                    )
                );
            } else {
                customActivities.forEach(activity => {
                    const card = makeElement(
                        "article",
                        "adventure-history-card"
                    );

                    card.append(
                        makeElement("h4", "", activity.name),
                        makeElement(
                            "p",
                            "",
                            `${activity.destination} · ${activity.region}`
                        ),
                        makeElement(
                            "p",
                            "",
                            planner.isCompleted(activity.id)
                                ? "Completed"
                                : "Not yet completed"
                        )
                    );

                    customContainer.appendChild(card);
                });
            }
        }

        render();

        // Refresh the dashboard when another app feature changes stored data.
        window.addEventListener("storage", render);

        console.log("My Adventures dashboard initialised.");
    }

    document.addEventListener(
        "DOMContentLoaded",
        initialiseMyAdventures
    );
})();
