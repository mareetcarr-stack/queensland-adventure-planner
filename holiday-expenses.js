
"use strict";

/*
 * Holiday Expense Tracker
 * Records actual spending against saved holiday plans.
 * Data is stored in AdventurePlanner.data.holidayExpenses.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    if (!Array.isArray(planner.data.holidayExpenses)) {
        planner.data.holidayExpenses = [];
    }

    const categories = [
        "Accommodation",
        "Fuel and transport",
        "Food and drinks",
        "Activities and attractions",
        "Shopping",
        "Ferries and tours",
        "Other"
    ];

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "holiday-expenses";

    const heading = document.createElement("h2");
    heading.textContent = "💰 Holiday Expense Tracker";

    const intro = document.createElement("p");
    intro.textContent =
        "Record what you actually spend on each trip and compare your expenditure across holidays.";

    const holidaySelect = document.createElement("select");
    holidaySelect.setAttribute("aria-label", "Select a holiday");

    const summary = document.createElement("div");
    summary.className = "expense-summary";

    const form = document.createElement("form");
    form.className = "expense-form";

    function makeField(labelText, control) {
        const label = document.createElement("label");
        label.className = "form-field";

        const caption = document.createElement("span");
        caption.textContent = labelText;

        label.append(caption, control);
        return label;
    }

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.required = true;

    const descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.placeholder = "e.g. Hotel in Noosa";
    descriptionInput.required = true;
    descriptionInput.maxLength = 120;

    const categorySelect = document.createElement("select");

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.min = "0.01";
    amountInput.step = "0.01";
    amountInput.placeholder = "0.00";
    amountInput.required = true;

    const notesInput = document.createElement("textarea");
    notesInput.rows = 2;
    notesInput.placeholder = "Optional notes";

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "add-activity-button";
    submit.textContent = "Add Expense";

    const message = document.createElement("p");
    message.id = "expense-message";

    form.append(
        makeField("Date", dateInput),
        makeField("Description", descriptionInput),
        makeField("Category", categorySelect),
        makeField("Amount (AUD $)", amountInput),
        makeField("Notes", notesInput),
        submit,
        message
    );

    const expenseHeading = document.createElement("h3");
    expenseHeading.textContent = "Recorded Expenses";

    const expenseList = document.createElement("div");
    expenseList.className = "expense-list";

    section.append(
        heading,
        intro,
        makeField("Select holiday", holidaySelect),
        summary,
        form,
        expenseHeading,
        expenseList
    );

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");

    if (footer && footer.parentElement === main) {
        main.insertBefore(section, footer);
    } else {
        main.appendChild(section);
    }

    function getHolidays() {
        return planner.data.savedHolidayPlans || [];
    }

    function getExpenses() {
        return planner.data.holidayExpenses;
    }

    function save() {
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

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-AU", {
            style: "currency",
            currency: "AUD"
        }).format(value);
    }

    function formatDate(value) {
        if (!value) return "Date not specified";

        return new Date(`${value}T12:00:00`).toLocaleDateString(
            "en-AU",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }

    function selectedHoliday() {
        return getHolidays().find(
            holiday => holiday.id === holidaySelect.value
        );
    }

    function renderHolidayOptions() {
        const previous = holidaySelect.value;

        holidaySelect.replaceChildren();

        const holidays = getHolidays();

        if (!holidays.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Create a holiday first";
            holidaySelect.appendChild(option);
            holidaySelect.disabled = true;
            render();
            return;
        }

        holidaySelect.disabled = false;

        holidays.forEach(holiday => {
            const option = document.createElement("option");
            option.value = holiday.id;
            option.textContent = holiday.name;
            holidaySelect.appendChild(option);
        });

        if (holidays.some(holiday => holiday.id === previous)) {
            holidaySelect.value = previous;
        }

        render();
    }

    function render() {
        const holiday = selectedHoliday();

        summary.replaceChildren();
        expenseList.replaceChildren();

        if (!holiday) {
            summary.textContent =
                "Save a holiday in Holiday Planner to start tracking expenses.";

            form.hidden = true;
            expenseHeading.hidden = true;
            return;
        }

        form.hidden = false;
        expenseHeading.hidden = false;

        const expenses = getExpenses().filter(
            expense => expense.holidayId === holiday.id
        );

        const total = expenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0
        );

        const dayCount = Math.max(1, (holiday.days || []).length);
        const dailyAverage = total / dayCount;

        const categoryTotals = categories
            .map(category => ({
                category,
                total: expenses
                    .filter(expense => expense.category === category)
                    .reduce(
                        (sum, expense) => sum + Number(expense.amount),
                        0
                    )
            }))
            .filter(item => item.total > 0)
            .sort((a, b) => b.total - a.total);

        const totalBox = document.createElement("div");
        totalBox.className = "expense-total";

        const totalLabel = document.createElement("span");
        totalLabel.textContent = "Total recorded spending";

        const totalValue = document.createElement("strong");
        totalValue.textContent = formatCurrency(total);

        totalBox.append(totalLabel, totalValue);

        const daily = document.createElement("p");
        daily.textContent =
            `Average per day: ${formatCurrency(dailyAverage)} over ${dayCount} days`;

        const count = document.createElement("p");
        count.textContent =
            `${expenses.length} expense${expenses.length === 1 ? "" : "s"} recorded`;

        summary.append(totalBox, daily, count);

        if (categoryTotals.length) {
            const categoryHeading = document.createElement("h4");
            categoryHeading.textContent = "Spending by category";
            summary.appendChild(categoryHeading);

            categoryTotals.forEach(item => {
                const row = document.createElement("div");
                row.className = "expense-category-row";

                const label = document.createElement("span");
                label.textContent = item.category;

                const amount = document.createElement("strong");
                amount.textContent = formatCurrency(item.total);

                row.append(label, amount);
                summary.appendChild(row);
            });
        }

        if (!expenses.length) {
            const empty = document.createElement("p");
            empty.textContent =
                "No expenses recorded for this holiday yet.";
            expenseList.appendChild(empty);
            return;
        }

        expenses
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .forEach(expense => {
                const card = document.createElement("article");
                card.className = "expense-card";

                const details = document.createElement("div");

                const name = document.createElement("strong");
                name.textContent = expense.description;

                const meta = document.createElement("p");
                meta.textContent =
                    `${formatDate(expense.date)} · ${expense.category}`;

                details.append(name, meta);

                if (expense.notes) {
                    const notes = document.createElement("p");
                    notes.textContent = expense.notes;
                    details.appendChild(notes);
                }

                const amount = document.createElement("strong");
                amount.className = "expense-amount";
                amount.textContent = formatCurrency(expense.amount);

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "reset-filters";
                deleteButton.textContent = "Delete";

                deleteButton.addEventListener("click", () => {
                    if (!window.confirm(
                        `Delete the expense "${expense.description}"?`
                    )) return;

                    const index = getExpenses().findIndex(
                        item => item.id === expense.id
                    );

                    if (index !== -1) {
                        getExpenses().splice(index, 1);

                        if (save()) render();
                    }
                });

                const actions = document.createElement("div");
                actions.className = "expense-actions";
                actions.append(amount, deleteButton);

                card.append(details, actions);
                expenseList.appendChild(card);
            });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const holiday = selectedHoliday();

        if (!holiday) {
            message.textContent = "Please select a saved holiday.";
            return;
        }

        const amount = Number(amountInput.value);

        if (
            !descriptionInput.value.trim() ||
            !dateInput.value ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            message.textContent =
                "Enter a description, date and valid expense amount.";
            return;
        }

        const expense = {
            id: `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            holidayId: holiday.id,
            date: dateInput.value,
            description: descriptionInput.value.trim(),
            category: categorySelect.value,
            amount: Math.round(amount * 100) / 100,
            notes: notesInput.value.trim(),
            createdAt: new Date().toISOString()
        };

        getExpenses().push(expense);

        if (save()) {
            descriptionInput.value = "";
            amountInput.value = "";
            notesInput.value = "";
            message.textContent = "Expense saved.";
            render();
        }
    });

    holidaySelect.addEventListener("change", render);

    dateInput.value = new Date().toLocaleDateString("en-CA");

    renderHolidayOptions();

    window.addEventListener("adventureplanner:datachanged", renderHolidayOptions);
    window.addEventListener("focus", renderHolidayOptions);
    window.addEventListener("pageshow", renderHolidayOptions);

    console.log("Holiday Expense Tracker initialised.");
})();
