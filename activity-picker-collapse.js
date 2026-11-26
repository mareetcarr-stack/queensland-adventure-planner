/* Keep activity pickers empty until the user searches or changes a filter. */
"use strict";
(() => {
    function collapseDiscover() {
        const section = document.getElementById("activity-browser");
        if (!section || section.dataset.collapseReady) return;
        const search = section.querySelector("#activity-search");
        const results = section.querySelector("#activity-results");
        const count = results?.previousElementSibling;
        if (!search || !results) return;
        section.dataset.collapseReady = "1";
        const selects = [...section.querySelectorAll(".activity-filters select")];
        const defaults = ["all", "all", "any", "any", "any", "all"];
        const update = () => {
            const active = search.value.trim() || selects.some((s, i) => s.value !== defaults[i]);
            if (active) return;
            results.replaceChildren();
            if (count) count.textContent = "Enter a keyword or choose a filter to browse experiences.";
        };
        search.addEventListener("input", () => requestAnimationFrame(update));
        selects.forEach(s => s.addEventListener("change", () => requestAnimationFrame(update)));
        update();
    }
    function collapseDayPicker() {
        const section = document.getElementById("day-planner");
        if (!section || section.dataset.collapseReady) return;
        const search = section.querySelector('input[type="search"]');
        const list = section.querySelector(".day-planner-activities");
        if (!search || !list) return;
        section.dataset.collapseReady = "1";
        const update = () => {
            if (search.value.trim()) return;
            list.replaceChildren();
            const prompt = document.createElement("p");
            prompt.className = "activity-search-prompt";
            prompt.textContent = "Enter a keyword to find activities to add to your day.";
            list.appendChild(prompt);
        };
        search.addEventListener("input", () => requestAnimationFrame(update));
        update();
    }
    function init() {
        collapseDiscover();
        collapseDayPicker();
        const main = document.querySelector("main");
        if (main) new MutationObserver(() => {
            collapseDiscover();
            collapseDayPicker();
        }).observe(main, { childList: true, subtree: true });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();
