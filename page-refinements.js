
"use strict";

/*
 * Adventure Planner — page-specific interface refinements.
 */

(() => {
    const planner = window.AdventurePlanner;
    const page = document.body.dataset.page;

    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    function refineShortlist() {
        if (!planner || document.getElementById("my-shortlist")) return;

        const section = make("section", "feature");
        section.id = "my-shortlist";

        section.append(
            make("h2", "", "My Shortlist"),
            make("p", "", "Save experiences you'd like to try. Add them from the list below and remove them whenever you like.")
        );

        const controls = make("div", "shortlist-add-controls");

        const search = document.createElement("input");
        search.type = "search";
        search.placeholder = "Find an experience...";
        search.setAttribute("aria-label", "Search experiences");

        const select = document.createElement("select");
        select.setAttribute("aria-label", "Choose an experience to add");

        const addButton = make("button", "add-activity-button", "＋ Add to shortlist");
        addButton.type = "button";

        controls.append(search, select, addButton);

        const count = make("p", "shortlist-count", "");
        count.setAttribute("aria-live", "polite");

        const results = make("div", "shortlist-results");
        section.append(controls, count, results);

        const main = document.querySelector("main");
        const welcome = main?.querySelector(".welcome");

        if (welcome) welcome.insertAdjacentElement("afterend", section);
        else main?.appendChild(section);

        function getShortlisted() {
            return new Set(planner.data.shortlistedActivities || []);
        }

        function save() {
            planner.data.shortlistedActivities = [...getShortlisted()];
            return planner.saveData();
        }

        function populateSelect() {
            const term = search.value.trim().toLowerCase();
            const shortlisted = getShortlisted();

            select.replaceChildren();

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Choose an experience...";
            select.appendChild(placeholder);

            planner.getActivities()
                .filter(activity => !planner.isCompleted(activity.id))
                .filter(activity => !shortlisted.has(activity.id))
                .filter(activity => {
                    const searchable = [
                        activity.name,
                        activity.destination,
                        activity.region,
                        activity.description
                    ].join(" ").toLowerCase();

                    return !term || searchable.includes(term);
                })
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(activity => {
                    const option = document.createElement("option");
                    option.value = activity.id;
                    option.textContent =
                        `${activity.name} — ${activity.destination || activity.region || ""}`;
                    select.appendChild(option);
                });
        }

        function render() {
            results.replaceChildren();

            const shortlisted = getShortlisted();
            const activities = planner.getActivities().filter(activity =>
                shortlisted.has(activity.id) && !planner.isCompleted(activity.id)
            );

            count.textContent = `${activities.length} experiences saved`;

            if (!activities.length) {
                results.appendChild(make(
                    "p",
                    "shortlist-empty",
                    "Your shortlist is empty. Choose an experience from the dropdown above to add one."
                ));
            }

            activities.forEach(activity => {
                const card = make("article", "shortlist-card");

                const name = make("h3", "", activity.name);
                const location = make(
                    "p",
                    "shortlist-meta",
                    [activity.destination, activity.region].filter(Boolean).join(" · ")
                );
                const description = make(
                    "p",
                    "",
                    activity.description || "Explore this experience."
                );
                const details = make(
                    "p",
                    "shortlist-meta",
                    `${activity.durationHours || 0} hours · ${
                        activity.estimatedCost == null
                            ? "Cost to check"
                            : activity.estimatedCost === 0
                                ? "Free"
                                : "Approx. $" + activity.estimatedCost + " per person"
                    }`
                );

                const remove = make("button", "reset-filters", "Remove from shortlist");
                remove.type = "button";

                remove.addEventListener("click", () => {
                    const updated = getShortlisted();
                    updated.delete(activity.id);
                    planner.data.shortlistedActivities = [...updated];

                    if (save()) render();
                });

                card.append(name, location, description, details, remove);
                results.appendChild(card);
            });

            populateSelect();
        }

        addButton.addEventListener("click", () => {
            if (!select.value) return;

            const updated = getShortlisted();
            updated.add(select.value);
            planner.data.shortlistedActivities = [...updated];

            if (save()) {
                search.value = "";
                render();
            }
        });

        search.addEventListener("input", populateSelect);
        document.addEventListener("adventureplanner:datachanged", render);

        populateSelect();
        render();
    }

    function refineHome() {
        const dashboard = document.getElementById("home-dashboard");
        if (!dashboard) return;

        const links = [
            ["Discover Adventures", "discover.html"],
            ["Generate a Day Trip", "plan-day.html"],
            ["My Adventures", "my-adventures.html"],
            ["My Shortlist", "shortlist.html"],
            ["Explore the Map", "plan-day.html"]
        ];

        const grid = dashboard.querySelector(".dashboard-shortcut-grid");

        if (grid) {
            grid.replaceChildren();

            links.forEach(([label, url]) => {
                const link = make("a", "dashboard-shortcut", label);
                link.href = url;
                grid.appendChild(link);
            });
        }

        dashboard.querySelectorAll(".dashboard-upcoming a").forEach(link => {
            link.href = "plan-day.html";
        });
    }

    function refineMyAdventures() {
        const dashboard = document.getElementById("my-adventures-dashboard");
        if (!dashboard) return;

        const main = document.querySelector("main");
        if (main) main.insertBefore(dashboard, main.firstChild);

        dashboard.querySelectorAll(".adventure-dashboard-group").forEach(group => {
            const heading = group.querySelector("h3")?.textContent || "";

            if (
                heading.includes("Holiday Plans") ||
                heading.includes("Personal Activities")
            ) {
                group.remove();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (page === "shortlist") refineShortlist();
        if (page === "home") refineHome();
        if (page === "my-adventures") refineMyAdventures();
    });
})();
