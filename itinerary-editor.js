
"use strict";

/*
 * Saved Day Itinerary Editor
 * Edit the date and activities in an existing saved itinerary.
 */

(() => {
    function initialise() {
        if (!window.AdventurePlanner) return;

        const planner = window.AdventurePlanner;

        const style = document.createElement("style");
        style.textContent = `
            .itinerary-edit-button {
                margin: 10px 8px 0 0;
                padding: 9px 13px;
                border: 1px solid var(--border);
                border-radius: 7px;
                background: var(--forest);
                color: white;
                font: inherit;
                cursor: pointer;
            }

            .itinerary-editor {
                margin-top: 14px;
                padding: 16px;
                border-radius: 10px;
                background: var(--surface);
            }

            .itinerary-editor label {
                display: block;
                margin: 12px 0 6px;
                font-weight: 600;
            }

            .itinerary-editor input[type="date"],
            .itinerary-editor input[type="search"] {
                width: 100%;
                min-height: 42px;
                padding: 9px;
                border: 1px solid var(--border);
                border-radius: 7px;
                background: white;
                font: inherit;
            }

            .itinerary-editor-list {
                display: grid;
                gap: 8px;
                margin: 14px 0;
                max-height: 360px;
                overflow-y: auto;
            }

            .itinerary-editor-choice {
                display: flex !important;
                align-items: flex-start;
                gap: 10px;
                margin: 0 !important;
                padding: 10px;
                border-radius: 7px;
                background: white;
                font-weight: 400 !important;
            }

            .itinerary-editor-choice input {
                width: 18px;
                height: 18px;
                margin-top: 3px;
                flex-shrink: 0;
            }

            .itinerary-editor-choice span {
                display: block;
                line-height: 1.45;
            }

            .itinerary-editor-choice strong {
                display: block;
                color: var(--forest);
            }

            .itinerary-editor-choice small {
                color: var(--muted);
            }

            .itinerary-editor-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 14px;
            }

            .itinerary-editor-message {
                margin-top: 10px;
                color: var(--forest);
                font-weight: 600;
            }
        `;

        document.head.appendChild(style);

        function localDateString() {
            const date = new Date();
            date.setMinutes(
                date.getMinutes() - date.getTimezoneOffset()
            );
            return date.toISOString().slice(0, 10);
        }

        function createButton(text, className, action) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = className;
            button.textContent = text;

            button.addEventListener("click", event => {
                event.stopPropagation();
                action();
            });

            return button;
        }

        function openEditor(card, itinerary) {
            card.querySelector(".itinerary-editor")?.remove();

            const editor = document.createElement("div");
            editor.className = "itinerary-editor";

            // Prevent the dashboard's global click/change listeners
            // from rebuilding the card while the editor is in use.
            editor.addEventListener("click", event => {
                event.stopPropagation();
            });

            editor.addEventListener("change", event => {
                event.stopPropagation();
            });

            editor.addEventListener("input", event => {
                event.stopPropagation();
            });

            const dateLabel = document.createElement("label");
            dateLabel.textContent = "Itinerary date";

            const dateInput = document.createElement("input");
            dateInput.type = "date";
            dateInput.value = itinerary.date || localDateString();
            dateInput.min = localDateString();

            dateLabel.appendChild(dateInput);

            const searchLabel = document.createElement("label");
            searchLabel.textContent = "Find experiences";

            const search = document.createElement("input");
            search.type = "search";
            search.placeholder = "Search activities or destinations...";

            searchLabel.appendChild(search);

            const list = document.createElement("div");
            list.className = "itinerary-editor-list";

            const message = document.createElement("p");
            message.className = "itinerary-editor-message";
            message.setAttribute("aria-live", "polite");

            const selected = new Set(itinerary.activityIds || []);
            const activities = planner.getActivities();

            function renderChoices() {
                list.replaceChildren();

                const term = search.value.trim().toLowerCase();

                const matches = activities.filter(activity => {
                    if (!term) return true;

                    return [
                        activity.name,
                        activity.destination,
                        activity.region,
                        activity.description
                    ].join(" ").toLowerCase().includes(term);
                });

                if (!matches.length) {
                    const empty = document.createElement("p");
                    empty.textContent = "No matching activities found.";
                    list.appendChild(empty);
                    return;
                }

                matches.forEach(activity => {
                    const label = document.createElement("label");
                    label.className = "itinerary-editor-choice";

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = selected.has(activity.id);

                    checkbox.addEventListener("change", () => {
                        if (checkbox.checked) {
                            selected.add(activity.id);
                        } else {
                            selected.delete(activity.id);
                        }
                    });

                    const details = document.createElement("span");

                    const name = document.createElement("strong");
                    name.textContent = activity.name;

                    const location = document.createElement("small");
                    location.textContent =
                        `${activity.destination} · ${activity.region} · ${activity.durationHours || 0} hours`;

                    details.append(name, location);
                    label.append(checkbox, details);
                    list.appendChild(label);
                });
            }

            search.addEventListener("input", renderChoices);

            const actions = document.createElement("div");
            actions.className = "itinerary-editor-actions";

            const save = createButton(
                "Save changes",
                "add-activity-button",
                () => {
                    if (!dateInput.value) {
                        message.textContent = "Please choose a date.";
                        return;
                    }

                    if (dateInput.value < localDateString()) {
                        message.textContent =
                            "Please choose today or a future date.";
                        return;
                    }

                    if (!selected.size) {
                        message.textContent =
                            "Select at least one experience.";
                        return;
                    }

                    const previous = {
                        date: itinerary.date,
                        activityIds: [...itinerary.activityIds]
                    };

                    itinerary.date = dateInput.value;
                    itinerary.activityIds = [...selected];

                    if (!planner.saveData()) {
                        itinerary.date = previous.date;
                        itinerary.activityIds = previous.activityIds;

                        message.textContent =
                            "Unable to save changes. Check browser storage.";
                        return;
                    }

                    editor.remove();

                    document.dispatchEvent(
                        new CustomEvent("adventureplanner:datachanged")
                    );

                    if (typeof renderDayPlanner === "function") {
                        renderDayPlanner();
                    }
                }
            );

            const cancel = createButton(
                "Cancel",
                "reset-filters",
                () => editor.remove()
            );

            actions.append(save, cancel);

            editor.append(
                dateLabel,
                searchLabel,
                list,
                actions,
                message
            );

            card.appendChild(editor);
            renderChoices();

            editor.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }

        function addEditButtons() {
            const dashboard = document.getElementById(
                "my-adventures-dashboard"
            );

            if (!dashboard) return;

            const groups = [
                ...dashboard.querySelectorAll(".adventure-dashboard-group")
            ];

            const itineraryGroup = groups.find(group =>
                group.querySelector("h3")?.textContent.includes(
                    "Saved Day Itineraries"
                )
            );

            if (!itineraryGroup) return;

            const itineraries = [
                ...(planner.data.savedItineraries || [])
            ].sort((a, b) =>
                (b.date || "").localeCompare(a.date || "")
            );

            const cards = [
                ...itineraryGroup.querySelectorAll(
                    ".adventure-history-card"
                )
            ];

            cards.forEach((card, index) => {
                if (card.querySelector(".itinerary-edit-button")) return;

                const itinerary = itineraries[index];
                if (!itinerary) return;

                const edit = createButton(
                    "Edit itinerary",
                    "itinerary-edit-button",
                    () => openEditor(card, itinerary)
                );

                const buttons = card.querySelector(
                    ".adventure-history-actions"
                );

                if (buttons) buttons.prepend(edit);
                else card.appendChild(edit);
            });
        }

        const dashboard = document.getElementById(
            "my-adventures-dashboard"
        );

        if (dashboard) {
            const observer = new MutationObserver(() => {
                addEditButtons();
            });

            observer.observe(dashboard, {
                childList: true,
                subtree: true
            });
        }

        addEditButtons();

        console.log("Saved itinerary editor initialised.");
    }

    document.addEventListener("DOMContentLoaded", initialise);
})();
