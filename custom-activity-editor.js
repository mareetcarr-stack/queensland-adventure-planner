
"use strict";

/*
 * Custom Activity Editor
 * Allows personal activities to be edited without deleting them.
 */

(() => {
    function initialise() {
        const planner = window.AdventurePlanner;
        if (!planner) return;

        const main = document.querySelector("main");
        if (!main) return;

        const style = document.createElement("style");
        style.textContent = `
            .custom-activity-edit-button {
                margin: 10px 8px 0 0;
                padding: 9px 13px;
                border: 1px solid var(--border);
                border-radius: 7px;
                background: var(--forest);
                color: white;
                font: inherit;
                cursor: pointer;
            }

            .custom-activity-editor {
                margin-top: 14px;
                padding: 18px;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: var(--surface);
            }

            .custom-activity-editor h4 {
                margin-top: 0;
                color: var(--forest);
            }

            .custom-activity-editor form {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
            }

            .custom-activity-editor label {
                display: flex;
                flex-direction: column;
                gap: 5px;
                font-size: .9rem;
                font-weight: 600;
            }

            .custom-activity-editor input,
            .custom-activity-editor select,
            .custom-activity-editor textarea {
                width: 100%;
                min-height: 42px;
                padding: 9px;
                border: 1px solid var(--border);
                border-radius: 7px;
                background: white;
                color: var(--text);
                font: inherit;
            }

            .custom-activity-editor textarea {
                min-height: 90px;
                resize: vertical;
            }

            .custom-activity-editor .wide {
                grid-column: 1 / -1;
            }

            .custom-activity-editor .editor-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                grid-column: 1 / -1;
            }

            .custom-activity-editor .editor-message {
                grid-column: 1 / -1;
                margin: 0;
                font-weight: 600;
            }

            @media (max-width: 600px) {
                .custom-activity-editor form {
                    grid-template-columns: 1fr;
                }

                .custom-activity-editor .wide,
                .custom-activity-editor .editor-actions,
                .custom-activity-editor .editor-message {
                    grid-column: 1;
                }
            }
        `;
        document.head.appendChild(style);

        function makeField(form, labelText, name, value, type = "text") {
            const label = document.createElement("label");
            label.textContent = labelText;

            const input = document.createElement(
                type === "textarea" ? "textarea" : "input"
            );

            if (type !== "textarea") input.type = type;
            input.name = name;
            input.value = value ?? "";

            label.appendChild(input);
            form.appendChild(label);

            return input;
        }

        function makeSelect(form, labelText, name, value, options) {
            const label = document.createElement("label");
            label.textContent = labelText;

            const select = document.createElement("select");
            select.name = name;

            options.forEach(option => {
                const item = document.createElement("option");
                item.value = option.value;
                item.textContent = option.label;
                select.appendChild(item);
            });

            select.value = value || options[0].value;
            label.appendChild(select);
            form.appendChild(label);

            return select;
        }

        function openEditor(activity, card) {
            document.querySelector(".custom-activity-editor")?.remove();

            const editor = document.createElement("div");
            editor.className = "custom-activity-editor";

            const heading = document.createElement("h4");
            heading.textContent = `Edit: ${activity.name}`;

            const form = document.createElement("form");

            const name = makeField(
                form, "Activity name", "name", activity.name
            );

            const destination = makeField(
                form, "Destination", "destination", activity.destination
            );

            const region = makeField(
                form, "Region", "region", activity.region
            );

            const description = makeField(
                form, "Description", "description",
                activity.description, "textarea"
            );
            description.parentElement.classList.add("wide");

            const categories = makeField(
                form, "Categories (comma separated)", "category",
                (activity.category || []).join(", ")
            );

            const cost = makeSelect(
                form, "Cost", "cost", activity.cost,
                [
                    { value: "free", label: "Free" },
                    { value: "under25", label: "Under $25" },
                    { value: "under50", label: "Under $50" },
                    { value: "under100", label: "Under $100" },
                    { value: "variable", label: "Variable / unknown" }
                ]
            );

            const estimatedCost = makeField(
                form, "Estimated cost per person ($)", "estimatedCost",
                activity.estimatedCost ?? "", "number"
            );
            estimatedCost.min = "0";
            estimatedCost.step = "0.01";

            const duration = makeField(
                form, "Duration (hours)", "durationHours",
                activity.durationHours, "number"
            );
            duration.min = "0.25";
            duration.step = "0.25";

            const dogPolicy = makeSelect(
                form, "Dog access", "dogPolicy", activity.dogPolicy,
                [
                    { value: "friendly", label: "Dog-friendly" },
                    { value: "verify", label: "Needs verification" },
                    { value: "restricted", label: "Dogs not permitted" }
                ]
            );

            const environment = makeSelect(
                form, "Indoor or outdoor", "indoorOutdoor",
                activity.indoorOutdoor,
                [
                    { value: "outdoor", label: "Outdoor" },
                    { value: "indoor", label: "Indoor" },
                    { value: "mixed", label: "Both" }
                ]
            );

            const actions = document.createElement("div");
            actions.className = "editor-actions";

            const save = document.createElement("button");
            save.type = "submit";
            save.className = "add-activity-button";
            save.textContent = "Save changes";

            const cancel = document.createElement("button");
            cancel.type = "button";
            cancel.className = "reset-filters";
            cancel.textContent = "Cancel";
            cancel.addEventListener("click", () => editor.remove());

            actions.append(save, cancel);

            const message = document.createElement("p");
            message.className = "editor-message";
            message.setAttribute("aria-live", "polite");

            form.append(actions, message);
            editor.append(heading, form);

            card.insertAdjacentElement("afterend", editor);

            form.addEventListener("submit", event => {
                event.preventDefault();

                const updated = {
                    ...activity,
                    name: name.value.trim(),
                    destination: destination.value.trim(),
                    region: region.value.trim(),
                    description: description.value.trim(),
                    category: categories.value
                        .split(",")
                        .map(value => value.trim().toLowerCase()
                            .replaceAll(" ", "-"))
                        .filter(Boolean),
                    cost: cost.value,
                    estimatedCost: estimatedCost.value === ""
                        ? null
                        : Number(estimatedCost.value),
                    durationHours: Number(duration.value),
                    dogPolicy: dogPolicy.value,
                    indoorOutdoor: environment.value
                };

                if (
                    !updated.name ||
                    !updated.destination ||
                    !updated.region ||
                    !updated.description ||
                    !updated.category.length ||
                    !Number.isFinite(updated.durationHours) ||
                    updated.durationHours <= 0 ||
                    (
                        updated.estimatedCost !== null &&
                        (
                            !Number.isFinite(updated.estimatedCost) ||
                            updated.estimatedCost < 0
                        )
                    )
                ) {
                    message.textContent =
                        "Check the required fields and numerical values.";
                    return;
                }

                const index = planner.data.activities.findIndex(
                    item => item.id === activity.id
                );

                if (index === -1) {
                    message.textContent =
                        "This activity could not be found.";
                    return;
                }

                const previous = planner.data.activities[index];
                planner.data.activities[index] = updated;

                if (!planner.saveData()) {
                    planner.data.activities[index] = previous;
                    message.textContent =
                        "Unable to save changes. Check browser storage.";
                    return;
                }

                editor.remove();

                if (typeof renderActivityBrowser === "function") {
                    renderActivityBrowser();
                }

                if (typeof renderMyActivities === "function") {
                    renderMyActivities();
                }

                if (typeof renderDayPlanner === "function") {
                    renderDayPlanner();
                }

                document.dispatchEvent(
                    new CustomEvent("adventureplanner:datachanged")
                );
            });
        }

        function addEditButtons() {
            const section = document.getElementById("my-activities");
            const list = section?.querySelector(".my-activities-list");

            if (!list) return;

            const activities = planner.data.activities || [];
            const cards = [...list.querySelectorAll(".activity-card")];

            cards.forEach((card, index) => {
                if (card.querySelector(".custom-activity-edit-button")) {
                    return;
                }

                const activity = activities[index];
                if (!activity) return;

                const button = document.createElement("button");
                button.type = "button";
                button.className = "custom-activity-edit-button";
                button.textContent = "Edit activity";

                button.addEventListener("click", () => {
                    openEditor(activity, card);
                });

                const deleteButton = card.querySelector("button");
                if (deleteButton) {
                    deleteButton.insertAdjacentElement("beforebegin", button);
                } else {
                    card.appendChild(button);
                }
            });
        }

        addEditButtons();

        const observer = new MutationObserver(addEditButtons);
        observer.observe(main, {
            childList: true,
            subtree: true
        });

        console.log("Custom activity editor initialised.");
    }

    document.addEventListener("DOMContentLoaded", initialise);
})();
