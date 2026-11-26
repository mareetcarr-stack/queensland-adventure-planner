
"use strict";

/*
 * Experience Journal
 * Records visit dates, ratings and personal notes for activities.
 * Data is stored in AdventurePlanner.data and included in backups.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    if (!planner.data.experienceJournal) {
        planner.data.experienceJournal = {};
    }

    const journal = planner.data.experienceJournal;

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "experience-journal";

    const heading = document.createElement("h2");
    heading.textContent = "📖 My Experience Journal";

    const intro = document.createElement("p");
    intro.textContent =
        "Keep a personal record of places you've visited, what you thought of them and whether you'd recommend returning.";

    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search activities or destinations...";
    search.setAttribute("aria-label", "Search journal activities");

    const filter = document.createElement("select");
    filter.setAttribute("aria-label", "Filter journal activities");

    [
        ["all", "All experiences"],
        ["completed", "Completed experiences"],
        ["recorded", "Journal entries"],
        ["unrecorded", "Not yet recorded"]
    ].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        filter.appendChild(option);
    });

    const count = document.createElement("p");
    count.className = "journal-count";

    const results = document.createElement("div");
    results.className = "journal-results";

    section.append(
        heading,
        intro,
        search,
        filter,
        count,
        results
    );

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");

    if (footer && footer.parentElement === main) {
        main.insertBefore(section, footer);
    } else {
        main.appendChild(section);
    }

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;

        return element;
    }

    function save() {
        planner.data.experienceJournal = journal;

        if (!planner.saveData()) {
            window.alert(
                "Your journal entry could not be saved. Check your browser storage."
            );
            return false;
        }

        window.dispatchEvent(
            new CustomEvent("adventureplanner:datachanged")
        );

        return true;
    }

    function createEditor(activity, card) {
        const existing = card.querySelector(".journal-editor");

        if (existing) {
            existing.remove();
            return;
        }

        const entry = journal[activity.id] || {};

        const editor = makeElement("div", "journal-editor");

        const dateLabel = makeElement("label", "form-field");
        dateLabel.appendChild(
            makeElement("span", "", "Date visited")
        );

        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = entry.dateVisited || "";
        dateLabel.appendChild(dateInput);

        const ratingLabel = makeElement("label", "form-field");
        ratingLabel.appendChild(
            makeElement("span", "", "Your rating")
        );

        const rating = document.createElement("select");

        [
            ["", "Not rated"],
            ["1", "★☆☆☆☆ — Poor"],
            ["2", "★★☆☆☆ — Below average"],
            ["3", "★★★☆☆ — Good"],
            ["4", "★★★★☆ — Very good"],
            ["5", "★★★★★ — Excellent"]
        ].forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            rating.appendChild(option);
        });

        rating.value = entry.rating ? String(entry.rating) : "";
        ratingLabel.appendChild(rating);

        const notesLabel = makeElement("label", "form-field");
        notesLabel.appendChild(
            makeElement("span", "", "Personal notes")
        );

        const notes = document.createElement("textarea");
        notes.value = entry.notes || "";
        notes.placeholder =
            "What did you enjoy? What would you do differently? Any tips for next time?";
        notes.rows = 5;
        notesLabel.appendChild(notes);

        const actions = makeElement("div", "journal-actions");

        const saveButton = makeElement(
            "button",
            "add-activity-button",
            "Save journal entry"
        );
        saveButton.type = "button";

        const cancelButton = makeElement(
            "button",
            "reset-filters",
            "Cancel"
        );
        cancelButton.type = "button";

        const message = makeElement("p", "journal-message");

        saveButton.addEventListener("click", () => {
            const ratingValue = rating.value
                ? Number(rating.value)
                : null;

            if (
                ratingValue !== null &&
                (!Number.isInteger(ratingValue) ||
                    ratingValue < 1 ||
                    ratingValue > 5)
            ) {
                message.textContent = "Please choose a valid rating.";
                return;
            }

            const updatedEntry = {
                dateVisited: dateInput.value,
                rating: ratingValue,
                notes: notes.value.trim(),
                updatedAt: new Date().toISOString()
            };

            if (
                !updatedEntry.dateVisited &&
                updatedEntry.rating === null &&
                !updatedEntry.notes
            ) {
                delete journal[activity.id];
            } else {
                journal[activity.id] = updatedEntry;
            }

            if (save()) render();
        });

        cancelButton.addEventListener("click", () => {
            editor.remove();
        });

        actions.append(saveButton, cancelButton);

        editor.append(
            dateLabel,
            ratingLabel,
            notesLabel,
            actions,
            message
        );

        card.appendChild(editor);
    }

    function render() {
        results.replaceChildren();

        const allActivities = planner.getActivities();
        const term = search.value.trim().toLowerCase();

        const selectedFilter = filter.value;

        const filtered = allActivities.filter(activity => {
            const entry = journal[activity.id];
            const completed = planner.isCompleted(activity.id);

            const searchable = [
                activity.name,
                activity.destination,
                activity.region,
                activity.description
            ].join(" ").toLowerCase();

            if (term && !searchable.includes(term)) return false;

            if (selectedFilter === "completed" && !completed) return false;
            if (selectedFilter === "recorded" && !entry) return false;
            if (selectedFilter === "unrecorded" && entry) return false;

            return true;
        });

        const recordedCount = Object.keys(journal).filter(id =>
            allActivities.some(activity => activity.id === id)
        ).length;

        count.textContent =
            `${recordedCount} journal entries · ${filtered.length} experiences shown`;

        if (!filtered.length) {
            results.appendChild(
                makeElement(
                    "p",
                    "",
                    "No experiences match your search."
                )
            );
            return;
        }

        filtered.forEach(activity => {
            const entry = journal[activity.id] || {};
            const card = makeElement("article", "journal-card");

            card.appendChild(
                makeElement("h3", "", activity.name)
            );

            card.appendChild(
                makeElement(
                    "p",
                    "journal-location",
                    `${activity.destination} · ${activity.region}`
                )
            );

            if (entry.dateVisited) {
                card.appendChild(
                    makeElement(
                        "p",
                        "",
                        `Visited: ${new Date(
                            `${entry.dateVisited}T12:00:00`
                        ).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}`
                    )
                );
            }

            if (entry.rating) {
                card.appendChild(
                    makeElement(
                        "p",
                        "journal-rating",
                        `${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)}`
                    )
                );
            }

            if (entry.notes) {
                card.appendChild(
                    makeElement("p", "journal-notes", entry.notes)
                );
            }

            const editButton = makeElement(
                "button",
                "reset-filters",
                entry ? "Edit entry" : "Add journal entry"
            );
            editButton.type = "button";

            editButton.addEventListener("click", () => {
                createEditor(activity, card);
            });

            card.appendChild(editButton);
            results.appendChild(card);
        });
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    window.addEventListener("adventureplanner:datachanged", render);
    window.addEventListener("focus", render);
    window.addEventListener("pageshow", render);

    render();

    console.log("Experience Journal initialised.");
})();
