
"use strict";

/*
 * Adventure Planner — page-specific interface refinements.
 *
 * Home:
 * - Refine the Home dashboard shortcuts.
 *
 * My Adventures:
 * - Preserve the welcome section at the top.
 * - Keep the Adventure Dashboard immediately below it.
 * - Keep personal adventure history below the dashboard.
 * - Do not remove holiday content or statistics.
 */

(() => {
    const page = document.body.dataset.page;

    const make = (tag, className, text) => {
        const node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        if (text !== undefined) {
            node.textContent = text;
        }

        return node;
    };

    function refineHome() {
        const dashboard = document.getElementById("home-dashboard");

        if (!dashboard) return;

        const links = [
            ["Discover Adventures", "discover.html"],
            ["Generate a Day Trip", "plan-day.html"],
            ["My Adventures", "my-adventures.html"],
            ["Explore the Map", "discover.html"]
        ];

        const grid = dashboard.querySelector(
            ".dashboard-shortcut-grid"
        );

        if (grid) {
            grid.replaceChildren();

            links.forEach(([label, url]) => {
                const link = make(
                    "a",
                    "dashboard-shortcut",
                    label
                );

                link.href = url;
                grid.appendChild(link);
            });
        }

        dashboard
            .querySelectorAll(".dashboard-upcoming a")
            .forEach(link => {
                link.href = "plan-day.html";
            });
    }

    function refineMyAdventures() {
        const main = document.querySelector("main");

        if (!main) return;

        const welcome = main.querySelector(".welcome");
        const dashboard = document.getElementById("home-dashboard");
        const history = document.getElementById(
            "my-adventures-dashboard"
        );

        /*
         * Enforce the intended page order:
         *
         * 1. Welcome
         * 2. Adventure Dashboard
         * 3. Personal adventure history
         */

        if (welcome && dashboard) {
            welcome.insertAdjacentElement("afterend", dashboard);
        }

        if (dashboard && history) {
            dashboard.insertAdjacentElement("afterend", history);
        } else if (welcome && history && !dashboard) {
            welcome.insertAdjacentElement("afterend", history);
        }

        /*
         * Do not delete holiday groups, statistics,
         * saved itineraries or personal adventure content.
         */
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (page === "home") {
            refineHome();
        }

        if (page === "my-adventures") {
            refineMyAdventures();
        }
    });
})();
