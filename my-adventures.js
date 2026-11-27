
"use strict";

/*
 * Adventure Planner — My Adventures
 * Saved itineraries, completed experiences, holidays and personal activities.
 */

(() => {
    function initialiseMyAdventures() {
        const planner = window.AdventurePlanner;
        if (!planner) return;

        document.getElementById("my-adventures-dashboard")?.remove();

        const section = document.createElement("section");
        section.className = "feature";
        section.id = "my-adventures-dashboard";

        const heading = document.createElement("h2");
        heading.textContent = "My Adventures";

        const intro = document.createElement("p");
        intro.textContent =
            "Your personal record of places explored, experiences completed and trips planned.";

        const stats = document.createElement("div");
        stats.className = "dashboard-statistics adventure-dashboard-stats";

        const completedContainer = document.createElement("div");
        completedContainer.className = "adventure-dashboard-group";

        const itineraryContainer = document.createElement("div");
        itineraryContainer.className = "adventure-dashboard-group";

        const holidayContainer = document.createElement("div");
        holidayContainer.className = "adventure-dashboard-group";

        const customContainer = document.createElement("div");
        customContainer.className = "adventure-dashboard-group";

        section.append(
            heading, intro,
            completedContainer, itineraryContainer,
            holidayContainer, customContainer
        );

        document.querySelector("main")?.appendChild(section);

        const style = document.createElement("style");
        style.textContent = `
            #my-adventures-dashboard .adventure-dashboard-stats {
                display:grid;
                grid-template-columns:repeat(3,minmax(0,1fr));
                gap:12px;
                margin:20px 0;
            }
            #my-adventures-dashboard .dashboard-stat-card {
                min-width:0;
                padding:18px 14px;
                border:1px solid rgba(48,59,58,.07);
                border-radius:14px;
                text-align:center;
            }
            #my-adventures-dashboard .dashboard-stat-card:nth-child(1) {
                background:#DCE8E3;
            }
            #my-adventures-dashboard .dashboard-stat-card:nth-child(2) {
                background:#E8DDEB;
            }
            #my-adventures-dashboard .dashboard-stat-card:nth-child(3) {
                background:#F2E2D4;
            }
            #my-adventures-dashboard .dashboard-stat-value {
                display:block;
                color:#303B3A;
                font-size:1.7rem;
                font-weight:700;
            }
            #my-adventures-dashboard .dashboard-stat-label {
                display:block;
                color:#303B3A;
                font-weight:650;
            }
            #my-adventures-dashboard .dashboard-stat-detail {
                display:block;
                margin-top:4px;
                color:#687572;
                font-size:.78rem;
            }
            #my-adventures-dashboard .adventure-dashboard-group {
                margin-top:28px;
            }
            #my-adventures-dashboard .adventure-dashboard-group > h3 {
                margin-bottom:12px;
                color:var(--forest);
            }
            #my-adventures-dashboard .adventure-history-card {
                padding:16px;
                margin-bottom:12px;
                border:1px solid var(--border);
                border-radius:12px;
                background:#fff;
            }
            #my-adventures-dashboard .adventure-history-card h4 {
                margin:0 0 6px;
                color:var(--forest);
            }
            #my-adventures-dashboard .adventure-history-card p {
                margin:5px 0;
                color:var(--muted);
                line-height:1.5;
            }
            #my-adventures-dashboard .adventure-history-card ul {
                padding-left:22px;
                line-height:1.7;
            }
            #my-adventures-dashboard .adventure-history-actions {
                display:flex;
                flex-wrap:wrap;
                gap:8px;
                margin-top:12px;
            }
            #my-adventures-dashboard .adventure-history-actions button,
            #my-adventures-dashboard .adventure-history-card > button {
                display:inline-flex;
                align-items:center;
                justify-content:center;
                box-sizing:border-box;
                min-width:150px;
                min-height:44px;
                padding:10px 16px;
                border:1px solid var(--border);
                border-radius:10px;
                background:#DCE8E3;
                color:#40554B;
                font:inherit;
                font-size:.9rem;
                font-weight:650;
                line-height:1.2;
                cursor:pointer;
            }
            #my-adventures-dashboard .adventure-history-card > button {
                margin-top:10px;
            }
            @media(max-width:650px) {
                #my-adventures-dashboard .adventure-dashboard-stats {
                    grid-template-columns:1fr;
                }
            }
        `;
        document.head.appendChild(style);

        const makeElement = (tag, className, text) => {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (text !== undefined) element.textContent = text;
            return element;
        };

        const formatDate = value => {
            if (!value) return "Date not recorded";
            const date = new Date(`${value}T12:00:00`);
            if (Number.isNaN(date.getTime())) return "Date not recorded";
            return date.toLocaleDateString("en-AU", {
                weekday:"long",day:"numeric",month:"long",year:"numeric"
            });
        };

        function makeStat(value, label, detail) {
            const card = makeElement("article", "dashboard-stat-card");
            card.append(
                makeElement("span", "dashboard-stat-value", String(value)),
                makeElement("span", "dashboard-stat-label", label),
                makeElement("span", "dashboard-stat-detail", detail)
            );
            return card;
        }

        function makeButton(label, action) {
            const button = makeElement("button", "reset-filters", label);
            button.type = "button";
            button.addEventListener("click", action);
            return button;
        }

        function render() {
            const activities = planner.getActivities();
            const completedIds = [...new Set(planner.data.completedActivities || [])];

            const completed = completedIds
                .map(id => activities.find(activity => activity.id === id))
                .filter(Boolean);

            const itineraries = [...(planner.data.savedItineraries || [])]
                .sort((a,b) => (b.date || "").localeCompare(a.date || ""));

            const holidays = [...(planner.data.savedHolidayPlans || [])]
                .sort((a,b) => (a.startDate || "").localeCompare(b.startDate || ""));

            const customActivities = planner.data.activities || [];

            stats.replaceChildren(
                makeStat(completed.length, "Experiences completed", "Places you've explored"),
                makeStat(itineraries.length, "Saved day itineraries", "Your planned days out"),
                makeStat(holidays.length, "Saved holidays", "Multi-day trips")
            );

            completedContainer.replaceChildren(
                makeElement("h3", "", "✓ Experiences I've Completed")
            );

            if (!completed.length) {
                completedContainer.appendChild(
                    makeElement("p", "", "Your completed experiences will appear here.")
                );
            } else {
                completed.forEach(activity => {
                    const card = makeElement("article", "adventure-history-card");
                    card.append(
                        makeElement("h4", "", activity.name),
                        makeElement("p", "", [
                            activity.destination, activity.region
                        ].filter(Boolean).join(" · ")),
                        makeElement("p", "",
                            `${activity.durationHours || 0} hours · ` +
                            (activity.estimatedCost == null
                                ? "Cost unconfirmed"
                                : activity.estimatedCost === 0
                                    ? "Free"
                                    : `Estimated $${activity.estimatedCost}`)
                        ),
                        makeButton("Mark as not completed", () => {
                            planner.toggleCompleted(activity.id);
                            render();
                            document.dispatchEvent(
                                new CustomEvent("adventureplanner:datachanged")
                            );
                        })
                    );
                    completedContainer.appendChild(card);
                });
            }

            itineraryContainer.replaceChildren(
                makeElement("h3", "", "🗓️ Saved Day Itineraries")
            );

            if (!itineraries.length) {
                itineraryContainer.appendChild(
                    makeElement("p", "", "Your saved day trips will appear here.")
                );
            } else {
                itineraries.forEach(itinerary => {
                    const card = makeElement("article", "adventure-history-card");
                    card.id = `saved-itinerary-${itinerary.id}`;

                    card.appendChild(
                        makeElement("h4", "", formatDate(itinerary.date))
                    );

                    const list = document.createElement("ul");
                    (itinerary.activityIds || []).forEach(id => {
                        const activity = activities.find(item => item.id === id);
                        if (activity) {
                            list.appendChild(
                                makeElement("li", "",
                                    `${activity.name} — ${activity.destination || activity.region || ""}`)
                            );
                        }
                    });
                    card.appendChild(list);

                    const actions = makeElement("div", "adventure-history-actions");

                    actions.appendChild(makeButton("Delete itinerary", () => {
                        if (!window.confirm("Delete this saved itinerary?")) return;
                        if (planner.deleteItinerary(itinerary.id)) {
                            render();
                            document.dispatchEvent(
                                new CustomEvent("adventureplanner:datachanged")
                            );
                        }
                    }));

                    card.appendChild(actions);
                    itineraryContainer.appendChild(card);
                });
            }

            holidayContainer.replaceChildren(
                makeElement("h3", "", "✈️ My Holiday Plans")
            );

            if (!holidays.length) {
                holidayContainer.appendChild(
                    makeElement("p", "", "Your multi-day holiday schedules will appear here.")
                );
            } else {
                holidays.forEach(holiday => {
                    const card = makeElement("article", "adventure-history-card");
                    const dayList = document.createElement("ul");
                    let activityCount = 0;

                    (holiday.days || []).forEach((day, index) => {
                        const names = (day.activityIds || [])
                            .map(id => activities.find(item => item.id === id))
                            .filter(Boolean)
                            .map(item => item.name);

                        activityCount += names.length;
                        dayList.appendChild(makeElement("li", "",
                            `Day ${index + 1}: ${names.length ? names.join(", ") : "No activities planned"}`));
                    });

                    card.append(
                        makeElement("h4", "", holiday.name),
                        makeElement("p", "",
                            `${formatDate(holiday.startDate)} to ${formatDate(holiday.endDate)}`),
                        makeElement("p", "",
                            `${holiday.days?.length || 0} days · ${activityCount} allocated experiences`),
                        dayList
                    );
                    holidayContainer.appendChild(card);
                });
            }

            customContainer.replaceChildren(
                makeElement("h3", "", "＋ My Personal Activities")
            );

            if (!customActivities.length) {
                customContainer.appendChild(
                    makeElement("p", "", "Activities you add yourself will be listed here.")
                );
            } else {
                customActivities.forEach(activity => {
                    const card = makeElement("article", "adventure-history-card");
                    card.append(
                        makeElement("h4", "", activity.name),
                        makeElement("p", "", [
                            activity.destination, activity.region
                        ].filter(Boolean).join(" · ")),
                        makeElement("p", "",
                            planner.isCompleted(activity.id) ? "Completed" : "Not yet completed")
                    );

                    if (planner.isCompleted(activity.id)) {
                        card.appendChild(makeButton("Mark as not completed", () => {
                            planner.toggleCompleted(activity.id);
                            render();
                        }));
                    } else {
                        card.appendChild(makeButton("Mark as completed", () => {
                            planner.toggleCompleted(activity.id);
                            render();
                            document.dispatchEvent(
                                new CustomEvent("adventureplanner:datachanged")
                            );
                        }));
                    }

                    customContainer.appendChild(card);
                });
            }
        }

        render();

        let refreshPending = false;
        function scheduleRefresh() {
            if (refreshPending) return;
            refreshPending = true;
            window.setTimeout(() => {
                refreshPending = false;
                render();
            }, 0);
        }

        window.addEventListener("storage", scheduleRefresh);
        window.addEventListener("focus", scheduleRefresh);
        window.addEventListener("pageshow", scheduleRefresh);
        document.addEventListener("adventureplanner:datachanged", scheduleRefresh);

        console.log("My Adventures dashboard initialised.");
    }

    document.addEventListener("DOMContentLoaded", initialiseMyAdventures);
})();
