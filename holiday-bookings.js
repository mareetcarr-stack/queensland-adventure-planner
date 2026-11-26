
"use strict";

/*
 * Holiday Booking and Notes Manager
 * Stores booking details and notes against individual saved holidays.
 * Do not store passwords, payment card details or sensitive identity data.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    if (!Array.isArray(planner.data.holidayBookings)) {
        planner.data.holidayBookings = [];
    }

    const categories = [
        "Accommodation",
        "Transport",
        "Ferry",
        "Tour or activity",
        "Restaurant",
        "Other"
    ];

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "holiday-bookings";

    const heading = document.createElement("h2");
    heading.textContent = "📋 Holiday Bookings & Notes";

    const intro = document.createElement("p");
    intro.textContent =
        "Keep your reservation details, booking references, addresses and important trip notes together.";

    const holidaySelect = document.createElement("select");
    holidaySelect.setAttribute("aria-label", "Select holiday");

    const form = document.createElement("form");
    form.className = "booking-form";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "e.g. Noosa beachfront apartment";
    nameInput.maxLength = 150;
    nameInput.required = true;

    const categorySelect = document.createElement("select");
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    const dateInput = document.createElement("input");
    dateInput.type = "date";

    const timeInput = document.createElement("input");
    timeInput.type = "time";

    const referenceInput = document.createElement("input");
    referenceInput.type = "text";
    referenceInput.placeholder = "Booking reference (optional)";
    referenceInput.maxLength = 100;

    const addressInput = document.createElement("input");
    addressInput.type = "text";
    addressInput.placeholder = "Address or meeting point (optional)";
    addressInput.maxLength = 250;

    const contactInput = document.createElement("input");
    contactInput.type = "text";
    contactInput.placeholder = "Contact details (optional)";
    contactInput.maxLength = 150;

    const notesInput = document.createElement("textarea");
    notesInput.rows = 4;
    notesInput.placeholder =
        "Additional details, check-in instructions, cancellation conditions, things to remember...";
    notesInput.maxLength = 3000;

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "add-activity-button";
    saveButton.textContent = "Save Booking";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "reset-filters";
    cancelButton.textContent = "Cancel editing";
    cancelButton.hidden = true;

    const message = document.createElement("p");
    message.className = "booking-message";

    form.append(
        makeField("Booking or item name", nameInput),
        makeField("Category", categorySelect),
        makeField("Date", dateInput),
        makeField("Time", timeInput),
        makeField("Booking reference", referenceInput),
        makeField("Address or meeting point", addressInput),
        makeField("Contact details", contactInput),
        makeField("Notes", notesInput),
        saveButton,
        cancelButton,
        message
    );

    const listHeading = document.createElement("h3");
    listHeading.textContent = "Saved Bookings";

    const bookingList = document.createElement("div");
    bookingList.className = "holiday-booking-list";

    const notesHeading = document.createElement("h3");
    notesHeading.textContent = "General Holiday Notes";

    const generalNotes = document.createElement("textarea");
    generalNotes.rows = 5;
    generalNotes.maxLength = 5000;
    generalNotes.placeholder =
        "General reminders, places to visit, things to organise...";

    const notesSave = document.createElement("button");
    notesSave.type = "button";
    notesSave.className = "reset-filters";
    notesSave.textContent = "Save Holiday Notes";

    const notesMessage = document.createElement("p");
    notesMessage.className = "booking-message";

    section.append(
        heading,
        intro,
        makeField("Select holiday", holidaySelect),
        form,
        listHeading,
        bookingList,
        notesHeading,
        generalNotes,
        notesSave,
        notesMessage
    );

    function makeField(labelText, control) {
        const label = document.createElement("label");
        label.className = "form-field";

        const caption = document.createElement("span");
        caption.textContent = labelText;

        label.append(caption, control);
        return label;
    }

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");

    if (footer && footer.parentElement === main) {
        main.insertBefore(section, footer);
    } else {
        main.appendChild(section);
    }

    let editingId = null;

    function holidays() {
        return planner.data.savedHolidayPlans || [];
    }

    function records() {
        return planner.data.holidayBookings;
    }

    function selectedHoliday() {
        return holidays().find(
            holiday => holiday.id === holidaySelect.value
        );
    }

    function saveData() {
        if (!planner.saveData()) {
            message.textContent =
                "Unable to save. Check your browser storage.";
            return false;
        }

        window.dispatchEvent(
            new CustomEvent("adventureplanner:datachanged")
        );

        return true;
    }

    function formatDate(value) {
        if (!value) return "Date not specified";

        return new Date(`${value}T12:00:00`).toLocaleDateString(
            "en-AU",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    function resetForm() {
        editingId = null;
        form.reset();
        saveButton.textContent = "Save Booking";
        cancelButton.hidden = true;
        message.textContent = "";
    }

    function renderHolidayOptions() {
        const previous = holidaySelect.value;
        holidaySelect.replaceChildren();

        const list = holidays();

        if (!list.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Create a holiday first";
            holidaySelect.appendChild(option);

            holidaySelect.disabled = true;
            form.hidden = true;
            listHeading.hidden = true;
            notesHeading.hidden = true;
            generalNotes.hidden = true;
            notesSave.hidden = true;
            bookingList.replaceChildren();
            return;
        }

        holidaySelect.disabled = false;
        form.hidden = false;
        listHeading.hidden = false;
        notesHeading.hidden = false;
        generalNotes.hidden = false;
        notesSave.hidden = false;

        list.forEach(holiday => {
            const option = document.createElement("option");
            option.value = holiday.id;
            option.textContent = holiday.name;
            holidaySelect.appendChild(option);
        });

        if (list.some(item => item.id === previous)) {
            holidaySelect.value = previous;
        }

        render();
    }

    function render() {
        const holiday = selectedHoliday();

        bookingList.replaceChildren();

        if (!holiday) return;

        const holidayRecords = records()
            .filter(record => record.holidayId === holiday.id)
            .sort((a, b) => {
                return (a.date || "9999-99-99").localeCompare(
                    b.date || "9999-99-99"
                );
            });

        generalNotes.value = holiday.generalNotes || "";

        if (!holidayRecords.length) {
            const empty = document.createElement("p");
            empty.textContent =
                "No bookings recorded for this holiday yet.";
            bookingList.appendChild(empty);
            return;
        }

        holidayRecords.forEach(record => {
            const card = document.createElement("article");
            card.className = "holiday-booking-card";

            const title = document.createElement("h4");
            title.textContent = record.name;

            const category = document.createElement("span");
            category.className = "booking-category";
            category.textContent = record.category;

            const details = document.createElement("div");
            details.className = "booking-details";

            const fields = [
                ["Date", formatDate(record.date)],
                ["Time", record.time || ""],
                ["Reference", record.reference || ""],
                ["Address", record.address || ""],
                ["Contact", record.contact || ""],
                ["Notes", record.notes || ""]
            ];

            fields.forEach(([label, value]) => {
                if (!value) return;

                const line = document.createElement("p");
                const strong = document.createElement("strong");
                strong.textContent = `${label}: `;
                line.append(strong, document.createTextNode(value));
                details.appendChild(line);
            });

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "reset-filters";
            editButton.textContent = "Edit";

            editButton.addEventListener("click", () => {
                editingId = record.id;
                nameInput.value = record.name;
                categorySelect.value = record.category;
                dateInput.value = record.date || "";
                timeInput.value = record.time || "";
                referenceInput.value = record.reference || "";
                addressInput.value = record.address || "";
                contactInput.value = record.contact || "";
                notesInput.value = record.notes || "";

                saveButton.textContent = "Update Booking";
                cancelButton.hidden = false;
                message.textContent = "Editing booking.";

                form.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "reset-filters";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                if (!window.confirm(`Delete "${record.name}"?`)) return;

                const index = records().findIndex(
                    item => item.id === record.id
                );

                if (index !== -1) {
                    records().splice(index, 1);

                    if (saveData()) {
                        if (editingId === record.id) resetForm();
                        render();
                    }
                }
            });

            const actions = document.createElement("div");
            actions.className = "booking-card-actions";
            actions.append(editButton, deleteButton);

            card.append(title, category, details, actions);
            bookingList.appendChild(card);
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const holiday = selectedHoliday();

        if (!holiday) {
            message.textContent = "Select a holiday first.";
            return;
        }

        const name = nameInput.value.trim();

        if (!name) {
            message.textContent = "Enter a booking name.";
            return;
        }

        const record = {
            id: editingId || `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            holidayId: holiday.id,
            name,
            category: categorySelect.value,
            date: dateInput.value,
            time: timeInput.value,
            reference: referenceInput.value.trim(),
            address: addressInput.value.trim(),
            contact: contactInput.value.trim(),
            notes: notesInput.value.trim(),
            updatedAt: new Date().toISOString()
        };

        if (editingId) {
            const index = records().findIndex(
                item => item.id === editingId
            );

            if (index === -1) {
                message.textContent = "The booking could not be found.";
                resetForm();
                return;
            }

            records()[index] = record;
        } else {
            records().push({
                ...record,
                createdAt: new Date().toISOString()
            });
        }

        if (saveData()) {
            resetForm();
            message.textContent = "Booking saved.";
            render();
        }
    });

    cancelButton.addEventListener("click", resetForm);

    holidaySelect.addEventListener("change", () => {
        resetForm();
        notesMessage.textContent = "";
        render();
    });

    notesSave.addEventListener("click", () => {
        const holiday = selectedHoliday();

        if (!holiday) return;

        holiday.generalNotes = generalNotes.value.trim();

        if (saveData()) {
            notesMessage.textContent = "Holiday notes saved.";
        }
    });

    window.addEventListener(
        "adventureplanner:datachanged",
        renderHolidayOptions
    );

    window.addEventListener("focus", renderHolidayOptions);
    window.addEventListener("pageshow", renderHolidayOptions);

    renderHolidayOptions();

    console.log("Holiday Booking Manager initialised.");
})();
