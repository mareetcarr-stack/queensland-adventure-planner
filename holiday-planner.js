
"use strict";

/*
 * Holiday Planner
 * Creates and saves multi-day trips using the shared Adventure Planner
 * activity database and local browser storage.
 */

(() => {
    const STORAGE_KEY = "adventurePlannerData";
    const root = document.getElementById("holiday-planner-root");

    if (!root) {
        console.error("Holiday Planner container was not found.");
        return;
    }

    function readStoredActivities() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            return Array.isArray(stored.activities) ? stored.activities : [];
        } catch (error) {
            console.error("Could not read personal activities:", error);
            return [];
        }
    }

    const activities = [
        ...(window.ADVENTURE_ACTIVITIES || []),
        ...readStoredActivities()
    ];

    function readHolidayPlans() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            return Array.isArray(stored.savedHolidayPlans)
                ? stored.savedHolidayPlans
                : [];
        } catch (error) {
            console.error("Could not read saved holiday plans:", error);
            return [];
        }
    }

    function saveHolidayPlans(plans) {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            stored.savedHolidayPlans = plans;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            return true;
        } catch (error) {
            console.error("Could not save holiday plans:", error);
            return false;
        }
    }

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function makeDateString(date) {
        const local = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        );

        return local.toISOString().slice(0, 10);
    }

    function formatDate(dateString) {
        return new Date(dateString + "T12:00:00").toLocaleDateString(
            "en-AU",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    function daysBetween(start, end) {
        const dates = [];
        const cursor = new Date(start + "T12:00:00");
        const finalDate = new Date(end + "T12:00:00");

        while (cursor <= finalDate) {
            dates.push(makeDateString(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }

        return dates;
    }

    const section = makeElement("section", "holiday-planner-section");
    const heading = makeElement("h2", "", "Build a Holiday");

    const intro = makeElement(
        "p",
        "",
        "Create a multi-day trip, then choose different experiences for each day. Your plans are saved in this browser."
    );

    const form = makeElement("form", "activity-form");

    const tripNameLabel = makeElement("label", "form-field");
    tripNameLabel.append(
        makeElement("span", "", "Holiday name")
    );

    const tripNameInput = document.createElement("input");
    tripNameInput.type = "text";
    tripNameInput.placeholder = "e.g. Sunshine Coast getaway";
    tripNameInput.required = true;
    tripNameLabel.appendChild(tripNameInput);

    const startLabel = makeElement("label", "form-field");
    startLabel.append(
        makeElement("span", "", "Start date")
    );

    const startInput = document.createElement("input");
    startInput.type = "date";
    startInput.required = true;
    startLabel.appendChild(startInput);

    const endLabel = makeElement("label", "form-field");
    endLabel.append(
        makeElement("span", "", "End date")
    );

    const endInput = document.createElement("input");
    endInput.type = "date";
    endInput.required = true;
    endLabel.appendChild(endInput);

    const today = makeDateString(new Date());

    startInput.min = today;
    endInput.min = today;

    startInput.addEventListener("change", () => {
        endInput.min = startInput.value || today;

        if (
            endInput.value &&
            endInput.value < startInput.value
        ) {
            endInput.value = startInput.value;
        }
    });

    const buildButton = makeElement(
        "button",
        "add-activity-button",
        "Create trip schedule"
    );

    buildButton.type = "submit";

    form.append(
        tripNameLabel,
        startLabel,
        endLabel,
        buildButton
    );

    const message = makeElement("p", "", "");
    message.id = "holiday-planner-message";

    const editor = makeElement("div", "holiday-editor");
    editor.id = "holiday-editor";
    editor.hidden = true;

    const saveButton = makeElement(
        "button",
        "add-activity-button",
        "Save Holiday"
    );

    saveButton.type = "button";

    const editorMessage = makeElement("p", "", "");
    editorMessage.id = "holiday-editor-message";

    const savedHeading = makeElement(
        "h3",
        "",
        "My Saved Holidays"
    );

    const savedList = makeElement(
        "div",
        "saved-holiday-list"
    );

    section.append(
        heading,
        intro,
        form,
        message,
        editor,
        savedHeading,
        savedList
    );

    root.appendChild(section);

    let currentTrip = null;
    let dayEditors = [];

    function getAllAssignedIds() {
        return new Set(
            currentTrip.days.flatMap(day => day.activityIds)
        );
    }

    function refreshAllDayOptions() {
        dayEditors.forEach(dayEditor => {
            dayEditor.populateOptions();
        });
    }

    function createDayEditor(dayPlan, dayIndex) {
        const card = makeElement(
            "article",
            "activity-card holiday-day-card"
        );

        const dayHeading = makeElement(
            "h3",
            "",
            `Day ${dayIndex + 1} — ${formatDate(dayPlan.date)}`
        );

        const destinationNote = makeElement(
            "p",
            "",
            "Choose experiences for this day. Activities already allocated to another day are excluded."
        );

        const search = document.createElement("input");
        search.type = "search";
        search.placeholder = "Search activities or destinations...";
        search.setAttribute(
            "aria-label",
            `Search activities for day ${dayIndex + 1}`
        );

        const selectLabel = makeElement(
            "label",
            "form-field"
        );

        selectLabel.append(
            makeElement("span", "", "Available activity")
        );

        const select = document.createElement("select");
        selectLabel.appendChild(select);

        const addButton = makeElement(
            "button",
            "reset-filters",
            "Add activity to this day"
        );

        addButton.type = "button";

        const assignedList = makeElement(
            "div",
            "holiday-assigned-list"
        );

        const daySummary = makeElement(
            "p",
            "holiday-day-summary"
        );

        function populateOptions() {
            const term = search.value.trim().toLowerCase();
            const assignedElsewhere = getAllAssignedIds();

            select.replaceChildren();

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select an activity...";
            select.appendChild(placeholder);

            const available = activities.filter(activity => {
                if (assignedElsewhere.has(activity.id)) {
                    return false;
                }

                const searchable = [
                    activity.name,
                    activity.destination,
                    activity.region,
                    activity.description,
                    ...(activity.category || [])
                ].join(" ").toLowerCase();

                return !term || searchable.includes(term);
            });

            available
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(activity => {
                    const option = document.createElement("option");
                    option.value = activity.id;
                    option.textContent =
                        `${activity.name} — ${activity.destination}`;

                    select.appendChild(option);
                });

            if (available.length === 0) {
                const none = document.createElement("option");
                none.value = "";
                none.textContent = "No available activities match";
                select.appendChild(none);
            }
        }

        function renderAssigned() {
            assignedList.replaceChildren();

            const assigned = dayPlan.activityIds
                .map(id => activities.find(activity => activity.id === id))
                .filter(Boolean);

            if (assigned.length === 0) {
                assignedList.appendChild(
                    makeElement(
                        "p",
                        "",
                        "No activities allocated yet."
                    )
                );
            }

            assigned.forEach(activity => {
                const item = makeElement(
                    "div",
                    "holiday-assigned-item"
                );

                const details = makeElement(
                    "span",
                    "",
                    `${activity.name} · ${activity.durationHours || 0} hours`
                );

                const remove = makeElement(
                    "button",
                    "reset-filters",
                    "Remove"
                );

                remove.type = "button";

                remove.addEventListener("click", () => {
                    dayPlan.activityIds =
                        dayPlan.activityIds.filter(
                            id => id !== activity.id
                        );

                    renderAssigned();
                    refreshAllDayOptions();
                });

                item.append(details, remove);
                assignedList.appendChild(item);
            });

            const totalHours = assigned.reduce(
                (total, activity) =>
                    total + Number(activity.durationHours || 0),
                0
            );

            const knownCost = assigned
                .filter(activity =>
                    activity.estimatedCost !== null &&
                    activity.estimatedCost !== undefined
                )
                .reduce(
                    (total, activity) =>
                        total + Number(activity.estimatedCost),
                    0
                );

            const unknownCosts = assigned.filter(
                activity =>
                    activity.estimatedCost === null ||
                    activity.estimatedCost === undefined
            ).length;

            daySummary.textContent =
                `${assigned.length} activities · ` +
                `${totalHours.toFixed(1)} hours · ` +
                `Known activity costs: $${knownCost.toFixed(2)}` +
                (
                    unknownCosts
                        ? ` · ${unknownCosts} cost(s) unconfirmed`
                        : ""
                );
        }

        addButton.addEventListener("click", () => {
            if (!select.value) {
                return;
            }

            if (getAllAssignedIds().has(select.value)) {
                editorMessage.textContent =
                    "That activity is already allocated to another day.";

                return;
            }

            dayPlan.activityIds.push(select.value);

            editorMessage.textContent = "";

            renderAssigned();
            refreshAllDayOptions();
        });

        search.addEventListener("input", populateOptions);

        card.append(
            dayHeading,
            destinationNote,
            search,
            selectLabel,
            addButton,
            assignedList,
            daySummary
        );

        renderAssigned();
        populateOptions();

        return {
            card,
            populateOptions
        };
    }

    function renderEditor() {
        editor.replaceChildren();
        dayEditors = [];

        const title = makeElement(
            "h3",
            "",
            currentTrip.name
        );

        const dates = makeElement(
            "p",
            "",
            `${formatDate(currentTrip.startDate)} to ` +
            `${formatDate(currentTrip.endDate)} · ` +
            `${currentTrip.days.length} days`
        );

        editor.append(title, dates);

        currentTrip.days.forEach((dayPlan, index) => {
            const dayEditor = createDayEditor(
                dayPlan,
                index
            );

            dayEditors.push(dayEditor);
            editor.appendChild(dayEditor.card);
        });

        editor.append(
            saveButton,
            editorMessage
        );

        editor.hidden = false;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = tripNameInput.value.trim();
        const startDate = startInput.value;
        const endDate = endInput.value;

        if (
            !name ||
            !startDate ||
            !endDate ||
            endDate < startDate
        ) {
            message.textContent =
                "Please enter a holiday name and a valid date range.";

            return;
        }

        const dates = daysBetween(
            startDate,
            endDate
        );

        if (dates.length > 60) {
            message.textContent =
                "Please create trips of 60 days or fewer.";

            return;
        }

        currentTrip = {
            name,
            startDate,
            endDate,
            days: dates.map(date => ({
                date,
                activityIds: []
            }))
        };

        editorMessage.textContent = "";
        message.textContent = "";

        renderEditor();
    });

    saveButton.addEventListener("click", () => {
        if (!currentTrip) {
            return;
        }

        const assignedCount = currentTrip.days.reduce(
            (total, day) =>
                total + day.activityIds.length,
            0
        );

        if (assignedCount === 0) {
            editorMessage.textContent =
                "Add at least one activity before saving your holiday.";

            return;
        }

        const plans = readHolidayPlans();

        const plan = {
            id: `holiday-${Date.now()}`,
            name: currentTrip.name,
            startDate: currentTrip.startDate,
            endDate: currentTrip.endDate,
            days: currentTrip.days.map(day => ({
                date: day.date,
                activityIds: [...day.activityIds]
            })),
            createdAt: new Date().toISOString()
        };

        plans.push(plan);

        if (!saveHolidayPlans(plans)) {
            editorMessage.textContent =
                "Unable to save. Check your browser storage.";

            return;
        }

        editorMessage.textContent =
            "Holiday saved successfully.";

        renderSavedHolidays();
    });

    function renderSavedHolidays() {
        savedList.replaceChildren();

        const plans = readHolidayPlans().sort(
            (a, b) => a.startDate.localeCompare(b.startDate)
        );

        if (plans.length === 0) {
            savedList.appendChild(
                makeElement(
                    "p",
                    "",
                    "You haven't saved any holidays yet."
                )
            );

            return;
        }

        plans.forEach(plan => {
            const card = makeElement(
                "article",
                "activity-card"
            );

            const title = makeElement(
                "h3",
                "",
                plan.name
            );

            const dateRange = makeElement(
                "p",
                "",
                `${formatDate(plan.startDate)} to ${formatDate(plan.endDate)}`
            );

            const dayList = makeElement(
                "div",
                "saved-holiday-days"
            );

            let totalActivities = 0;
            let totalHours = 0;
            let knownCost = 0;
            let unknownCosts = 0;

            (plan.days || []).forEach((day, index) => {
                const dayBlock = makeElement(
                    "div",
                    "saved-holiday-day"
                );

                dayBlock.appendChild(
                    makeElement(
                        "strong",
                        "",
                        `Day ${index + 1} — ${formatDate(day.date)}`
                    )
                );

                const list = document.createElement("ul");

                (day.activityIds || []).forEach(id => {
                    const activity = activities.find(
                        item => item.id === id
                    );

                    if (!activity) {
                        return;
                    }

                    totalActivities += 1;
                    totalHours += Number(
                        activity.durationHours || 0
                    );

                    if (
                        activity.estimatedCost === null ||
                        activity.estimatedCost === undefined
                    ) {
                        unknownCosts += 1;
                    } else {
                        knownCost += Number(
                            activity.estimatedCost
                        );
                    }

                    const li = document.createElement("li");
                    li.textContent = activity.name;
                    list.appendChild(li);
                });

                if (!list.children.length) {
                    dayBlock.appendChild(
                        makeElement(
                            "p",
                            "",
                            "No activities planned."
                        )
                    );
                } else {
                    dayBlock.appendChild(list);
                }

                dayList.appendChild(dayBlock);
            });

            const summary = makeElement(
                "p",
                "",
                `${totalActivities} activities · ` +
                `${totalHours.toFixed(1)} hours · ` +
                `Known activity costs: $${knownCost.toFixed(2)}` +
                (
                    unknownCosts
                        ? ` · ${unknownCosts} cost(s) unconfirmed`
                        : ""
                )
            );

            const deleteButton = makeElement(
                "button",
                "reset-filters",
                "Delete holiday"
            );

            deleteButton.type = "button";

            deleteButton.addEventListener("click", () => {
                if (!window.confirm(
                    `Delete the holiday "${plan.name}"?`
                )) {
                    return;
                }

                const remaining = readHolidayPlans().filter(
                    item => item.id !== plan.id
                );

                if (saveHolidayPlans(remaining)) {
                    renderSavedHolidays();
                } else {
                    window.alert(
                        "Unable to delete this holiday."
                    );
                }
            });

            card.append(
                title,
                dateRange,
                dayList,
                summary,
                deleteButton
            );

            savedList.appendChild(card);
        });
    }

    renderSavedHolidays();

    console.log(
        "Holiday Planner initialised successfully."
    );
})();
