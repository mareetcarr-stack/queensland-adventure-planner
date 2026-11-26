
"use strict";

/*
 * Queensland Adventure Planner — final interface fixes
 * Discover shortlist controls are handled by discover.js.
 *
 * Important:
 * No MutationObserver is used here. The previous observer watched
 * the entire main section while also modifying that same section,
 * causing repeated execution and browser script timeouts.
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

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    };

    function refineAddActivityForm() {
        const form = document.querySelector(
            "#add-activity .activity-form"
        );

        if (!form) return;

        const heading = document.querySelector("#add-activity h2");

        if (heading) {
            heading.textContent = "Add an Activity";
        }

        const submit = form.querySelector(
            'button[type="submit"]'
        );

        if (submit) {
            submit.textContent = "Add Activity";
        }

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
        const existingCheckbox = form.querySelector(
            'input[name="petFriendly"]'
        );

        if (oldPet && !existingCheckbox) {
            oldPet.closest("label, .form-field")?.remove();
            oldPet.remove();

            const hiddenPolicy = document.createElement("input");

            hiddenPolicy.type = "hidden";
            hiddenPolicy.name = "dogPolicy";
            hiddenPolicy.value = "restricted";

            form.appendChild(hiddenPolicy);

            const label = make(
                "label",
                "form-field pet-friendly-checkbox"
            );

            label.appendChild(
                make("span", "", "Pet friendly")
            );

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

        const dashboard = document.getElementById(
            "my-adventures-dashboard"
        );

        if (
            dashboard &&
            main &&
            dashboard !== main.firstElementChild
        ) {
            main.insertBefore(
                dashboard,
                main.firstElementChild
            );
        }

        if (dashboard) {
            dashboard
                .querySelectorAll(".adventure-dashboard-group")
                .forEach(group => {
                    const heading =
                        group.querySelector("h3")?.textContent || "";

                    if (/holiday|saved holidays/i.test(heading)) {
                        group.remove();
                    }
                });

            dashboard
                .querySelectorAll(".dashboard-stat-card")
                .forEach(card => {
                    const label =
                        card.querySelector(
                            ".dashboard-stat-label"
                        )?.textContent || "";

                    if (/holiday/i.test(label)) {
                        card.remove();
                    }
                });
        }

        document.querySelectorAll(
            "main > .holiday-planner-section, " +
            "main > #saved-holidays, " +
            "main > .saved-holiday-section"
        ).forEach(section => section.remove());
    }

    function run() {
        if (page !== "my-adventures") return;

        refineAddActivityForm();
        refineMyAdventures();
    }

    function initialise() {
        if (page !== "my-adventures") return;

        run();

        document.addEventListener(
            "adventureplanner:datachanged",
            run
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialise,
            { once: true }
        );
    } else {
        initialise();
    }
})();
