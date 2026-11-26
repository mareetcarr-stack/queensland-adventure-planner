/* Saved shortlist only — no catalogue, search or filter controls. */
"use strict";
(() => {
    function init() {
        const planner = window.AdventurePlanner;
        if (!planner || document.getElementById("my-shortlist")) return;
        if (!Array.isArray(planner.data.shortlistedActivities)) planner.data.shortlistedActivities = [];

        const section = document.createElement("section");
        section.className = "feature";
        section.id = "my-shortlist";
        const heading = document.createElement("h2");
        heading.textContent = "⭐ My Shortlist";
        const intro = document.createElement("p");
        intro.textContent = "Experiences you've saved from Discover. Remove an experience here whenever your plans change.";
        const count = document.createElement("p");
        count.setAttribute("aria-live", "polite");
        const results = document.createElement("div");
        results.className = "shortlist-results";

        const style = document.createElement("style");
        style.textContent = `
          #my-shortlist .shortlist-results{display:grid;gap:12px;margin-top:18px}
          #my-shortlist .shortlist-card{padding:16px;border:1px solid var(--border);border-radius:12px;background:#fff}
          #my-shortlist .shortlist-card h3{margin:0 0 6px;color:var(--forest)}
          #my-shortlist .shortlist-card p{margin:6px 0;line-height:1.5}
          #my-shortlist .shortlist-meta{color:var(--muted);font-size:.9rem}
          #my-shortlist .shortlist-button{margin-top:10px;padding:9px 13px;border:1px solid var(--border);border-radius:8px;background:#DCE8E3;color:#40554B;font:inherit;font-weight:600;cursor:pointer}
        `;
        document.head.appendChild(style);
        section.append(heading, intro, count, results);
        const main = document.querySelector("main");
        const welcome = main?.querySelector(".welcome");
        if (welcome) welcome.insertAdjacentElement("afterend", section);
        else main?.appendChild(section);

        function render() {
            results.replaceChildren();
            const ids = new Set(planner.data.shortlistedActivities || []);
            const saved = planner.getActivities().filter(a => ids.has(a.id) && !planner.isCompleted(a.id));
            count.textContent = `${saved.length} saved ${saved.length === 1 ? "experience" : "experiences"}`;
            if (!saved.length) {
                const empty = document.createElement("p");
                empty.textContent = "Your shortlist is empty. Use the “Add to shortlist” button on any Discover activity to save it here.";
                results.appendChild(empty);
                return;
            }
            saved.forEach(activity => {
                const card = document.createElement("article");
                card.className = "shortlist-card";
                const name = document.createElement("h3");
                name.textContent = activity.name;
                const location = document.createElement("p");
                location.className = "shortlist-meta";
                location.textContent = [activity.destination, activity.region].filter(Boolean).join(" · ");
                const description = document.createElement("p");
                description.textContent = activity.description || "Explore this experience.";
                const details = document.createElement("p");
                details.className = "shortlist-meta";
                details.textContent = `${activity.durationHours || 0} hours · ${activity.petFriendly ? "Pet-friendly" : "Not marked pet-friendly"}`;
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "shortlist-button";
                remove.textContent = "Remove from shortlist";
                remove.addEventListener("click", () => {
                    planner.data.shortlistedActivities = (planner.data.shortlistedActivities || []).filter(id => id !== activity.id);
                    if (planner.saveData()) {
                        render();
                        document.dispatchEvent(new CustomEvent("adventureplanner:datachanged"));
                    } else window.alert("Unable to save this change. Check your browser storage.");
                });
                card.append(name, location, description, details, remove);
                results.appendChild(card);
            });
        }
        render();
        document.addEventListener("adventureplanner:datachanged", render);
        window.addEventListener("storage", render);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();
