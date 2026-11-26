
"use strict";

/*
 * Queensland Adventure Planner — final interface fixes
 * Discover shortlist controls are handled by discover.js.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error(
            "Adventure Planner was not available when final-fixes.js initialised."
        );
        return;
    }

    const page = document.body.dataset.page || "";

    const make = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    function refineAddActivityForm() {
        const form = document.querySelector("#add-activity .activity-form");
        if (!form) return;

        const heading = document.querySelector("#add-activity h2");
        if (heading) heading.textContent = "Add an Activity";

        const submit = form.querySelector('button[type="submit"]');
        if (submit) submit.textContent = "Add Activity";

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

        if (oldPet && !form.querySelector('input[name="petFriendly"]')) {
            oldPet.closest("label, .form-field")?.remove();
            oldPet.remove();

            const hiddenPolicy = document.createElement("input");
            hiddenPolicy.type = "hidden";
            hiddenPolicy.name = "dogPolicy";
            hiddenPolicy.value = "restricted";
            form.appendChild(hiddenPolicy);

            const label = make("label", "form-field pet-friendly-checkbox");
            label.appendChild(make("span", "", "Pet friendly"));

            const line = make("span", "pet-checkbox-line");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "petFriendly";
            checkbox.checked = false;

            checkbox.addEventListener("change", () => {
                hiddenPolicy.value = checkbox.checked
                    ? "friendly"
                    : "restricted";
            });

            line.append(
                checkbox,
                make("span", "", "This activity welcomes pets")
            );

            label.appendChild(line);
            form.appendChild(label);
        }

        if (
            typeof planner.addActivity === "function" &&
            !planner.addActivity.__petFriendlyWrapped
        ) {
            const original = planner.addActivity.bind(planner);

            const wrapped = activity => original({
                ...activity,
                petFriendly: activity.dogPolicy === "friendly"
            });

            wrapped.__petFriendlyWrapped = true;
            planner.addActivity = wrapped;
        }
    }

    function refineMyAdventures() {
        const main = document.querySelector("main");
        const dashboard = document.getElementById("my-adventures-dashboard");

        if (dashboard && main && dashboard !== main.firstElementChild) {
            main.insertBefore(dashboard, main.firstElementChild);
        }

        if (dashboard) {
            dashboard.querySelectorAll(".adventure-dashboard-group").forEach(group => {
                const heading = group.querySelector("h3")?.textContent || "";

                if (/holiday|saved holidays/i.test(heading)) {
                    group.remove();
                }
            });

            dashboard.querySelectorAll(".dashboard-stat-card").forEach(card => {
                const label =
                    card.querySelector(".dashboard-stat-label")?.textContent || "";

                if (/holiday/i.test(label)) {
                    card.remove();
                }
            });
        }

        document.querySelectorAll(
            "main > .holiday-planner-section, main > #saved-holidays, main > .saved-holiday-section"
        ).forEach(section => section.remove());
    }

    function run() {
        if (page === "my-adventures") {
            refineAddActivityForm();
            refineMyAdventures();
        }
    }

    function initialise() {
        run();

        document.addEventListener("adventureplanner:datachanged", () => {
            if (page === "my-adventures") {
                refineMyAdventures();
                refineAddActivityForm();
            }
        });

        if (page === "my-adventures") {
            const main = document.querySelector("main");

            if (main) {
                const observer = new MutationObserver(run);
                observer.observe(main, {
                    childList: true,
                    subtree: true
                });
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, {
            once: true
        });
    } else {
        initialise();
    }
})();
