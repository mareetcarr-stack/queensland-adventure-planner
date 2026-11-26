"use strict";

/* Adventure Planner — page-specific interface refinements. */

(() => {
    const page = document.body.dataset.page;
    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    function refineHome() {
        const dashboard = document.getElementById("home-dashboard");
        if (!dashboard) return;
        const links = [
            ["Discover Adventures", "discover.html"],
            ["Generate a Day Trip", "plan-day.html"],
            ["My Adventures", "my-adventures.html"],
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
        const main = document.querySelector("main");
        if (!dashboard || !main) return;
        if (dashboard !== main.firstElementChild) main.insertBefore(dashboard, main.firstElementChild);
        dashboard.querySelectorAll(".adventure-dashboard-group").forEach(group => {
            const heading = group.querySelector("h3")?.textContent || "";
            if (/holiday|saved holidays/i.test(heading)) group.remove();
        });
        dashboard.querySelectorAll(".dashboard-stat-card").forEach(card => {
            const label = card.querySelector(".dashboard-stat-label")?.textContent || "";
            if (/holiday/i.test(label)) card.remove();
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (page === "home") refineHome();
        if (page === "my-adventures") refineMyAdventures();
        // The old Shortlist page no longer builds its own search/add/filter interface.
    });
})();
