
"use strict";

/*
 * Holiday Planner
 * Create, edit, save and delete multi-day holidays.
 * Uses the shared Adventure Planner data store and backup system.
 */

(() => {
    const root = document.getElementById("holiday-planner-root");

    if (!root) {
        console.error("Holiday Planner container was not found.");
        return;
    }

    const getActivities = () =>
        window.AdventurePlanner
            ? window.AdventurePlanner.getActivities()
            : window.ADVENTURE_ACTIVITIES || [];

    function readHolidayPlans() {
        try {
            if (
                window.AdventurePlanner &&
                Array.isArray(window.AdventurePlanner.data.savedHolidayPlans)
            ) {
                return window.AdventurePlanner.data.savedHolidayPlans;
            }

            const stored = JSON.parse(
                localStorage.getItem("adventurePlannerData") || "{}"
            );

            return Array.isArray(stored.savedHolidayPlans)
                ? stored.savedHolidayPlans
                : [];
        } catch (error) {
            console.error("Could not read saved holidays:", error);
            return [];
        }
    }

    function saveHolidayPlans(plans) {
        try {
            if (window.AdventurePlanner) {
                const previous = window.AdventurePlanner.data.savedHolidayPlans;

                window.AdventurePlanner.data.savedHolidayPlans = plans;

                if (window.AdventurePlanner.saveData()) {
                    return true;
                }

                window.AdventurePlanner.data.savedHolidayPlans = previous;
                return false;
            }

            const stored = JSON.parse(
                localStorage.getItem("adventurePlannerData") || "{}"
            );

            stored.savedHolidayPlans = plans;

            localStorage.setItem(
                "adventurePlannerData",
                JSON.stringify(stored)
            );

            return true;
        } catch (error) {
            console.error("Could not save holidays:", error);
            return false;
        }
    }

    function element(tag, className = "", text = "") {
        const node = document.createElement(tag);

        if (className) node.className = className;
        if (text !== "") node.textContent = text;

        return node;
    }

    function localDateString(date) {
        const local = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        );

        return local.toISOString().slice(0, 10);
    }

    function formatDate(value) {
        return new Date(value + "T12:00:00").toLocaleDateString(
            "en-AU",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    function getDateRange(start, end) {
        const dates = [];
        const cursor = new Date(start + "T12:00:00");
        const finalDate = new Date(end + "T12:00:00");

        while (cursor <= finalDate) {
            dates.push(localDateString(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }

        return dates;
    }

    const section = element("section", "holiday-planner-section");
    const heading = element("h2", "", "Build a Holiday");

    const intro = element(
        "p",
        "",
        "Create a multi-day trip and choose different experiences for each day. Your plans are saved with your Adventure Planner data and included in backups."
    );

    const form = element("form", "activity-form");

    const nameLabel = element("label", "form-field");
    nameLabel.appendChild(element("span", "", "Holiday name"));

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "e.g. Sunshine Coast getaway";
    nameInput.required = true;
    nameLabel.appendChild(nameInput);

    const startLabel = element("label", "form-field");
    startLabel.appendChild(element("span", "", "Start date"));

    const startInput = document.createElement("input");
    startInput.type = "date";
    startInput.required = true;
    startLabel.appendChild(startInput);

    const endLabel = element("label", "form-field");
    endLabel.appendChild(element("span", "", "End date"));

    const endInput = document.createElement("input");
    endInput.type = "date";
    endInput.required = true;
    endLabel.appendChild(endInput);

    const today = localDateString(new Date());
    startInput.min = today;
    endInput.min = today;

    startInput.addEventListener("change", () => {
        endInput.min = startInput.value || today;

        if (endInput.value && endInput.value < startInput.value) {
            endInput.value = startInput.value;
        }
    });

    const createButton = element(
        "button",
        "add-activity-button",
        "Create trip schedule"
    );
    createButton.type = "submit";

    form.append(nameLabel, startLabel, endLabel, createButton);

    const message = element("p", "", "");
    message.id = "holiday-planner-message";

    const editor = element("div", "holiday-editor");
    editor.id = "holiday-editor";
    editor.hidden = true;

    const editorMessage = element("p", "", "");
    editorMessage.id = "holiday-editor-message";

    const saveButton = element(
        "button",
        "add-activity-button",
        "Save Holiday"
    );
    saveButton.type = "button";

    const cancelButton = element(
        "button",
        "reset-filters",
        "Cancel editing"
    );
    cancelButton.type = "button";

    const savedHeading = element("h3", "", "My Saved Holidays");
    const savedList = element("div", "saved-holiday-list");

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

    function assignedActivityIds() {
        if (!currentTrip) return new Set();

        return new Set(
            currentTrip.days.flatMap(day => day.activityIds)
        );
    }

    function refreshDayOptions() {
        dayEditors.forEach(day => day.populateOptions());
    }

    function createDayEditor(day, index) {
        const card = element("article", "activity-card holiday-day-card");

        card.appendChild(
            element(
                "h3",
                "",
                `Day ${index + 1} — ${formatDate(day.date)}`
            )
        );

        card.appendChild(
            element(
                "p",
                "",
                "Choose experiences for this day. Activities allocated to another day are excluded."
            )
        );

        const search = document.createElement("input");
        search.type = "search";
        search.placeholder = "Search activities or destinations...";
        search.setAttribute(
            "aria-label",
            `Search activities for day ${index + 1}`
        );

        const selectLabel = element("label", "form-field");
        selectLabel.appendChild(element("span", "", "Available activity"));

        const select = document.createElement("select");
        selectLabel.appendChild(select);

        const addButton = element(
            "button",
            "reset-filters",
            "Add activity to this day"
        );
        addButton.type = "button";

        const assignedList = element("div", "holiday-assigned-list");
        const summary = element("p", "holiday-day-summary");

        function populateOptions() {
            const term = search.value.trim().toLowerCase();
            const alreadyAssigned = assignedActivityIds();

            select.replaceChildren();

            const placeholder = element(
                "option",
                "",
                "Select an activity..."
            );
            placeholder.value = "";
            select.appendChild(placeholder);

            const available = getActivities()
                .filter(activity => !alreadyAssigned.has(activity.id))
                .filter(activity => {
                    const searchable = [
                        activity.name,
                        activity.destination,
                        activity.region,
                        activity.description,
                        ...(activity.category || [])
                    ].join(" ").toLowerCase();

                    return !term || searchable.includes(term);
                })
                .sort((a, b) => a.name.localeCompare(b.name));

            available.forEach(activity => {
                const option = element(
                    "option",
                    "",
                    `${activity.name} — ${activity.destination}`
                );
                option.value = activity.id;
                select.appendChild(option);
            });

            if (!available.length) {
                const none = element(
                    "option",
                    "",
                    "No available activities match"
                );
                none.value = "";
                select.appendChild(none);
            }
        }

        function renderAssigned() {
            assignedList.replaceChildren();

            const activities = day.activityIds
                .map(id => getActivities().find(item => item.id === id))
                .filter(Boolean);

            if (!activities.length) {
                assignedList.appendChild(
                    element("p", "", "No activities allocated yet.")
                );
            }

            activities.forEach(activity => {
                const item = element("div", "holiday-assigned-item");

                const details = element(
                    "span",
                    "",
                    `${activity.name} · ${activity.durationHours || 0} hours`
                );

                const removeButton = element(
                    "button",
                    "reset-filters",
                    "Remove"
                );
                removeButton.type = "button";

                removeButton.addEventListener("click", () => {
                    day.activityIds = day.activityIds.filter(
                        id => id !== activity.id
                    );

                    renderAssigned();
                    refreshDayOptions();
                });

                item.append(details, removeButton);
                assignedList.appendChild(item);
            });

            const hours = activities.reduce(
                (total, activity) =>
                    total + Number(activity.durationHours || 0),
                0
            );

            const knownCost = activities
                .filter(activity =>
                    activity.estimatedCost !== null &&
                    activity.estimatedCost !== undefined
                )
                .reduce(
                    (total, activity) =>
                        total + Number(activity.estimatedCost),
                    0
                );

            const unknownCosts = activities.filter(
                activity =>
                    activity.estimatedCost === null ||
                    activity.estimatedCost === undefined
            ).length;

            summary.textContent =
                `${activities.length} activities · ${hours.toFixed(1)} hours · ` +
                `Known activity costs: $${knownCost.toFixed(2)}` +
                (unknownCosts
                    ? ` · ${unknownCosts} cost(s) unconfirmed`
                    : "");
        }

        addButton.addEventListener("click", () => {
            if (!select.value) return;

            if (assignedActivityIds().has(select.value)) {
                editorMessage.textContent =
                    "That activity is already allocated to another day.";
                return;
            }

            day.activityIds.push(select.value);
            editorMessage.textContent = "";

            renderAssigned();
            refreshDayOptions();
        });

        search.addEventListener("input", populateOptions);

        card.append(
            search,
            selectLabel,
            addButton,
            assignedList,
            summary
        );

        renderAssigned();
        populateOptions();

        return { card, populateOptions };
    }

    function renderEditor() {
        editor.replaceChildren();
        dayEditors = [];

        const title = element(
            "h3",
            "",
            currentTrip.id ? "Edit Holiday" : "Build Your Holiday"
        );

        const editNameLabel = element("label", "form-field");
        editNameLabel.appendChild(element("span", "", "Holiday name"));

        const editNameInput = document.createElement("input");
        editNameInput.type = "text";
        editNameInput.required = true;
        editNameInput.value = currentTrip.name;

        editNameInput.addEventListener("input", () => {
            currentTrip.name = editNameInput.value.trim();
        });

        editNameLabel.appendChild(editNameInput);

        const dates = element(
            "p",
            "",
            `${formatDate(currentTrip.startDate)} to ` +
            `${formatDate(currentTrip.endDate)} · ${currentTrip.days.length} days`
        );

        editor.append(title, editNameLabel, dates);

        currentTrip.days.forEach((day, index) => {
            const dayEditor = createDayEditor(day, index);
            dayEditors.push(dayEditor);
            editor.appendChild(dayEditor.card);
        });

        saveButton.textContent = currentTrip.id
            ? "Update Holiday"
            : "Save Holiday";

        editor.append(saveButton, cancelButton, editorMessage);
        editor.hidden = false;
    }

    function closeEditor() {
        currentTrip = null;
        dayEditors = [];
        editor.replaceChildren();
        editor.hidden = true;
        editorMessage.textContent = "";
        saveButton.textContent = "Save Holiday";
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const startDate = startInput.value;
        const endDate = endInput.value;

        if (!name || !startDate || !endDate || endDate < startDate) {
            message.textContent =
                "Please enter a holiday name and a valid date range.";
            return;
        }

        const dates = getDateRange(startDate, endDate);

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

        message.textContent = "";
        editorMessage.textContent = "";
        renderEditor();

        editor.scrollIntoView({
            behaviour: "smooth",
            block: "start"
        });
    });

    saveButton.addEventListener("click", () => {
        if (!currentTrip) return;

        currentTrip.name = currentTrip.name.trim();

        if (!currentTrip.name) {
            editorMessage.textContent =
                "Please enter a name for this holiday.";
            return;
        }

        const activityCount = currentTrip.days.reduce(
            (total, day) => total + day.activityIds.length,
            0
        );

        if (!activityCount) {
            editorMessage.textContent =
                "Add at least one activity before saving your holiday.";
            return;
        }

        const plans = readHolidayPlans();
        const existingIndex = currentTrip.id
            ? plans.findIndex(plan => plan.id === currentTrip.id)
            : -1;

        const updatedPlan = {
            id: currentTrip.id || `holiday-${Date.now()}`,
            name: currentTrip.name,
            startDate: currentTrip.startDate,
            endDate: currentTrip.endDate,
            days: currentTrip.days.map(day => ({
                date: day.date,
                activityIds: [...day.activityIds]
            })),
            createdAt: currentTrip.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            plans[existingIndex] = updatedPlan;
        } else {
            plans.push(updatedPlan);
        }

        if (!saveHolidayPlans(plans)) {
            editorMessage.textContent =
                "Unable to save. Check your browser storage.";
            return;
        }

        editorMessage.textContent = existingIndex >= 0
            ? "Holiday updated successfully."
            : "Holiday saved successfully and included in your Adventure Planner data.";

        renderSavedHolidays();
    });

    cancelButton.addEventListener("click", () => {
        closeEditor();
    });

    function editHoliday(plan) {
        currentTrip = {
            id: plan.id,
            name: plan.name,
            startDate: plan.startDate,
            endDate: plan.endDate,
            createdAt: plan.createdAt,
            days: (plan.days || []).map(day => ({
                date: day.date,
                activityIds: [...(day.activityIds || [])]
            }))
        };

        editorMessage.textContent = "";
        renderEditor();

        editor.scrollIntoView({
            behaviour: "smooth",
            block: "start"
        });
    }

    function renderSavedHolidays() {
        savedList.replaceChildren();

        const plans = [...readHolidayPlans()].sort(
            (a, b) => a.startDate.localeCompare(b.startDate)
        );

        if (!plans.length) {
            savedList.appendChild(
                element("p", "", "You haven't saved any holidays yet.")
            );
            return;
        }

        plans.forEach(plan => {
            const card = element("article", "activity-card");
            const title = element("h3", "", plan.name);

            const dateRange = element(
                "p",
                "",
                `${formatDate(plan.startDate)} to ${formatDate(plan.endDate)}`
            );

            const dayList = element("div", "saved-holiday-days");

            let totalActivities = 0;
            let totalHours = 0;
            let knownCost = 0;
            let unknownCosts = 0;

            (plan.days || []).forEach((day, index) => {
                const dayBlock = element("div", "saved-holiday-day");

                dayBlock.appendChild(
                    element(
                        "strong",
                        "",
                        `Day ${index + 1} — ${formatDate(day.date)}`
                    )
                );

                const list = document.createElement("ul");

                (day.activityIds || []).forEach(id => {
                    const activity = getActivities().find(
                        item => item.id === id
                    );

                    if (!activity) return;

                    totalActivities++;
                    totalHours += Number(activity.durationHours || 0);

                    if (
                        activity.estimatedCost === null ||
                        activity.estimatedCost === undefined
                    ) {
                        unknownCosts++;
                    } else {
                        knownCost += Number(activity.estimatedCost);
                    }

                    list.appendChild(
                        element("li", "", activity.name)
                    );
                });

                if (!list.children.length) {
                    dayBlock.appendChild(
                        element("p", "", "No activities planned.")
                    );
                } else {
                    dayBlock.appendChild(list);
                }

                dayList.appendChild(dayBlock);
            });

            const summary = element(
                "p",
                "",
                `${totalActivities} activities · ${totalHours.toFixed(1)} hours · ` +
                `Known activity costs: $${knownCost.toFixed(2)}` +
                (unknownCosts
                    ? ` · ${unknownCosts} cost(s) unconfirmed`
                    : "")
            );

            const actions = element("div", "holiday-actions");

            const editButton = element(
                "button",
                "reset-filters",
                "Edit holiday"
            );
            editButton.type = "button";
            editButton.addEventListener("click", () => editHoliday(plan));

            const deleteButton = element(
                "button",
                "reset-filters",
                "Delete holiday"
            );
            deleteButton.type = "button";

            deleteButton.addEventListener("click", () => {
                if (!window.confirm(`Delete the holiday "${plan.name}"?`)) {
                    return;
                }

                const remaining = readHolidayPlans().filter(
                    item => item.id !== plan.id
                );

                if (saveHolidayPlans(remaining)) {
                    if (currentTrip && currentTrip.id === plan.id) {
                        closeEditor();
                    }

                    renderSavedHolidays();
                } else {
                    window.alert("Unable to delete this holiday.");
                }
            });

            actions.append(editButton, deleteButton);
            card.append(title, dateRange, dayList, summary, actions);
            savedList.appendChild(card);
        });
    }

    renderSavedHolidays();

    console.log("Holiday Planner initialised successfully.");
})();
