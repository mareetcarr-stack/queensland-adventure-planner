
"use strict";

/*
 * Queensland Adventure Planner — final interface fixes
 *
 * My Adventures page order:
 * 1. Welcome section
 * 2. Adventure Dashboard
 * 3. Personal adventure history
 *
 * No MutationObserver is used.
 * No dashboard or saved adventure content is removed.
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

            const label = document.createElement("label");
            label.className = "form-field pet-friendly-checkbox";

            const title = document.createElement("span");
            title.textContent = "Pet friendly";

            const line = document.createElement("span");
            line.className = "pet-checkbox-line";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "petFriendly";
            checkbox.checked = false;

            checkbox.addEventListener("change", () => {
                hiddenPolicy.value = checkbox.checked
                    ? "friendly"
                    : "restricted";
            });

            const description = document.createElement("span");
            description.textContent = "This activity welcomes pets";

            line.append(checkbox, description);
            label.append(title, line);
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

    function initialise() {
        if (page !== "my-adventures") return;

        refineAddActivityForm();

        document.addEventListener(
            "adventureplanner:datachanged",
            refineAddActivityForm
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
