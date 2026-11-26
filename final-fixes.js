/* Queensland Adventure Planner — final interface fixes */
"use strict";

(() => {
    const planner = window.AdventurePlanner;
    if (!planner) {
        console.error("Adventure Planner was not available when final-fixes.js loaded.");
        return;
    }

    const page = document.body.dataset.page || "";
    let discoverObserver = null;
    let refreshQueued = false;

    const make = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    function emitDataChanged() {
        document.dispatchEvent(new CustomEvent("adventureplanner:datachanged"));
    }

    function getShortlist() {
        if (!Array.isArray(planner.data.shortlistedActivities)) {
            planner.data.shortlistedActivities = [];
        }
        return new Set(planner.data.shortlistedActivities);
    }

    function saveShortlist(ids) {
        planner.data.shortlistedActivities = [...ids];
        if (!planner.saveData()) {
            window.alert("Your shortlist could not be saved. Please check your browser storage.");
            return false;
        }
        emitDataChanged();
        return true;
    }

    function updateShortlistButton(button, activityId) {
        if (!button) return;
        const saved = getShortlist().has(activityId);
        button.textContent = saved ? "✓ Added to shortlist" : "＋ Add to shortlist";
        button.classList.toggle("is-shortlisted", saved);
        button.setAttribute("aria-pressed", String(saved));
        button.setAttribute("aria-label", saved
            ? "Remove this activity from your shortlist"
            : "Add this activity to your shortlist");
    }

    function toggleShortlist(activityId, button) {
        const ids = getShortlist();
        if (ids.has(activityId)) ids.delete(activityId);
        else ids.add(activityId);
        if (!saveShortlist(ids)) return;
        updateShortlistButton(button, activityId);
        updateShortlistCount();
    }

    function updateShortlistCount() {
        const count = document.getElementById("discover-shortlist-count");
        if (!count) return;
        const total = getShortlist().size;
        count.textContent = total
            ? `${total} saved ${total === 1 ? "activity" : "activities"}`
            : "Your shortlist is empty";
    }

    function findActivityId(card) {
        const name = card.querySelector("h4")?.textContent?.trim();
        if (!name) return null;
        const location = card.querySelector(".discover-location")?.textContent?.trim() || "";
        const match = planner.getActivities().find(activity =>
            activity.name === name &&
            [activity.destination, activity.region].filter(Boolean).join(" · ") === location
        );
        return match?.id || planner.getActivities().find(activity => activity.name === name)?.id || null;
    }

    function addShortlistButton(card, activityId) {
        let actions = card.querySelector(".discover-card-actions");
        if (!actions) {
            actions = make("div", "discover-card-actions");
            const complete = card.querySelector("button");
            if (complete) {
                complete.insertAdjacentElement("beforebegin", actions);
                actions.appendChild(complete);
            } else {
                card.appendChild(actions);
            }
        }

        let button = actions.querySelector(".discover-shortlist-button");
        if (!button) {
            button = make("button", "discover-shortlist-button");
            button.type = "button";
            button.addEventListener("click", () => toggleShortlist(activityId, button));
            actions.insertBefore(button, actions.firstChild);
        }
        updateShortlistButton(button, activityId);
    }

    function refineDiscoverCard(card) {
        const id = findActivityId(card);
        if (!id) return;

        card.classList.add("discover-card-final");

        const details = card.querySelector(".discover-details");
        if (details) {
            [...details.children].forEach(item => {
                if (/\bfree\b|\bcost\b|\$\s?\d/i.test(item.textContent)) item.remove();
            });
        }

        const complete = card.querySelector("button:not(.discover-shortlist-button)");
        if (complete) complete.classList.add("discover-complete-button");
        addShortlistButton(card, id);
    }

    function refineDiscover() {
        const results = document.getElementById("discover-results");
        if (!results) return;

        results.querySelectorAll(".discover-card").forEach(refineDiscoverCard);

        if (!document.getElementById("discover-shortlist-count")) {
            const count = make("p", "discover-shortlist-count", "");
            count.id = "discover-shortlist-count";
            count.setAttribute("aria-live", "polite");
            const controls = document.querySelector("#discover-panel .discover-controls");
            if (controls) controls.insertAdjacentElement("afterend", count);
            else results.insertAdjacentElement("beforebegin", count);
        }
        updateShortlistCount();

        if (!discoverObserver) {
            discoverObserver = new MutationObserver(() => {
                if (refreshQueued) return;
                refreshQueued = true;
                window.requestAnimationFrame(() => {
                    refreshQueued = false;
                    results.querySelectorAll(".discover-card").forEach(refineDiscoverCard);
                });
            });
            discoverObserver.observe(results, { childList: true, subtree: true });
        }
    }

    function removeShortlistNavigation() {
        document.querySelectorAll("#adventure-navigation a").forEach(link => {
            const label = link.textContent.trim().toLowerCase();
            if (label === "shortlist" || /shortlist\.html$/i.test(link.getAttribute("href") || "")) {
                link.remove();
            }
        });
    }

    function refineAddActivityForm() {
        const form = document.querySelector("#add-activity .activity-form");
        if (!form || form.dataset.finalFixesApplied === "true") return;
        form.dataset.finalFixesApplied = "true";

        const heading = document.querySelector("#add-activity h2");
        if (heading) heading.textContent = "Add an Activity";

        const estimated = form.elements.namedItem("estimatedCost");
        if (estimated) {
            estimated.closest("label, .form-field")?.remove();
            estimated.remove();
        }
        if (!form.elements.namedItem("estimatedCost")) {
            const hidden = document.createElement("input");
            hidden.type = "hidden";
            hidden.name = "estimatedCost";
            hidden.value = "";
            form.appendChild(hidden);
        }

        const oldPet = form.elements.namedItem("dogPolicy");
        if (oldPet) {
            const initiallyFriendly = oldPet.value === "friendly";
            oldPet.closest("label, .form-field")?.remove();
            oldPet.remove();

            const hiddenPolicy = document.createElement("input");
            hiddenPolicy.type = "hidden";
            hiddenPolicy.name = "dogPolicy";
            hiddenPolicy.value = initiallyFriendly ? "friendly" : "restricted";
            form.appendChild(hiddenPolicy);

            const label = make("label", "form-field pet-friendly-checkbox");
            label.appendChild(make("span", "", "Pet friendly"));

            const line = make("span", "pet-checkbox-line");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "petFriendly";
            checkbox.checked = initiallyFriendly;
            checkbox.addEventListener("change", () => {
                hiddenPolicy.value = checkbox.checked ? "friendly" : "restricted";
            });
            line.append(checkbox, make("span", "", "Pets are welcome at this activity"));
            label.appendChild(line);
            form.appendChild(label);
        }

        if (!planner.addActivity.__petFriendlyWrapped) {
            const original = planner.addActivity.bind(planner);
            const wrapped = activity => original({
                ...activity,
                petFriendly: activity.dogPolicy === "friendly"
            });
            wrapped.__petFriendlyWrapped = true;
            planner.addActivity = wrapped;
        }

        const submit = form.querySelector('button[type="submit"]');
        if (submit) submit.textContent = "Add Activity";
    }

    function refineMyAdventures() {
        const main = document.querySelector("main");
        const dashboard = document.getElementById("my-adventures-dashboard");

        if (dashboard && main) {
            const welcome = main.querySelector(":scope > .welcome");
            const alreadyInPosition = welcome
                ? dashboard.previousElementSibling === welcome
                : dashboard === main.firstElementChild;
            if (!alreadyInPosition) {
                if (welcome) welcome.insertAdjacentElement("afterend", dashboard);
                else main.insertBefore(dashboard, main.firstElementChild);
            }
        }

        document.querySelectorAll(
            "#my-adventures-dashboard .adventure-dashboard-group, " +
            "main > .holiday-planner-section, main > #saved-holidays, main > .saved-holiday-section"
        ).forEach(section => {
            const heading = section.querySelector("h2, h3, h4")?.textContent || "";
            if (/holiday|saved holidays/i.test(heading)) section.remove();
        });

        if (dashboard) {
            dashboard.querySelectorAll(".dashboard-stat-card").forEach(card => {
                const label = card.querySelector(".dashboard-stat-label")?.textContent || "";
                if (/holiday/i.test(label)) card.remove();
            });
        }
    }

    function run() {
        removeShortlistNavigation();
        if (page === "discover") refineDiscover();
        if (page === "my-adventures") {
            refineAddActivityForm();
            refineMyAdventures();
        }
        if (page === "home") {
            document.querySelectorAll(".dashboard-shortcut").forEach(link => {
                if (/shortlist/i.test(link.textContent) || /shortlist\.html$/i.test(link.getAttribute("href") || "")) {
                    link.remove();
                }
            });
        }
    }

    function initialise() {
        run();

        document.addEventListener("adventureplanner:datachanged", () => {
            if (page === "discover") {
                updateShortlistCount();
                document.querySelectorAll("#discover-results .discover-card").forEach(card => {
                    const id = findActivityId(card);
                    if (id) updateShortlistButton(card.querySelector(".discover-shortlist-button"), id);
                });
            }
            if (page === "my-adventures") {
                refineMyAdventures();
                refineAddActivityForm();
            }
        });

        const main = document.querySelector("main");
        if (main) {
            const observer = new MutationObserver(run);
            observer.observe(main, { childList: true, subtree: true });
        }

        const header = document.querySelector("header");
        if (header?.parentNode) {
            const observer = new MutationObserver(removeShortlistNavigation);
            observer.observe(header.parentNode, { childList: true, subtree: true });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, { once: true });
    } else {
        initialise();
    }
})();
