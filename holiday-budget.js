
"use strict";

/*
 * Holiday Budget Planner
 * Adds per-holiday budgets and compares them with recorded expenses.
 * Uses the existing Adventure Planner data store.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "holiday-budget";

    const heading = document.createElement("h2");
    heading.textContent = "🎯 Holiday Budgets";

    const intro = document.createElement("p");
    intro.textContent =
        "Set a spending limit for each holiday and monitor your actual expenditure as you add expenses.";

    const holidaySelect = document.createElement("select");
    holidaySelect.setAttribute("aria-label", "Select holiday");

    const budgetForm = document.createElement("form");
    budgetForm.className = "budget-form";

    const budgetLabel = document.createElement("label");
    budgetLabel.className = "form-field";

    const budgetCaption = document.createElement("span");
    budgetCaption.textContent = "Total holiday budget (AUD $)";

    const budgetInput = document.createElement("input");
    budgetInput.type = "number";
    budgetInput.min = "0";
    budgetInput.step = "0.01";
    budgetInput.placeholder = "e.g. 1500";
    budgetInput.required = true;

    budgetLabel.append(budgetCaption, budgetInput);

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "add-activity-button";
    saveButton.textContent = "Save Budget";

    const message = document.createElement("p");
    message.id = "holiday-budget-message";

    budgetForm.append(budgetLabel, saveButton, message);

    const dashboard = document.createElement("div");
    dashboard.className = "holiday-budget-dashboard";

    const comparisonHeading = document.createElement("h3");
    comparisonHeading.textContent = "Budget Overview";

    const comparison = document.createElement("div");
    comparison.className = "budget-comparison";

    const allBudgetsHeading = document.createElement("h3");
    allBudgetsHeading.textContent = "All Holiday Budgets";

    const allBudgets = document.createElement("div");
    allBudgets.className = "all-holiday-budgets";

    section.append(
        heading,
        intro,
        comparisonHeading,
        makeField("Select holiday", holidaySelect),
        budgetForm,
        dashboard,
        allBudgetsHeading,
        allBudgets
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

    function holidays() {
        return planner.data.savedHolidayPlans || [];
    }

    function expenses() {
        return planner.data.holidayExpenses || [];
    }

    function selectedHoliday() {
        return holidays().find(
            holiday => holiday.id === holidaySelect.value
        );
    }

    function currency(value) {
        return new Intl.NumberFormat("en-AU", {
            style: "currency",
            currency: "AUD"
        }).format(value);
    }

    function makeStat(label, value, className = "") {
        const card = document.createElement("div");
        card.className = `budget-stat ${className}`.trim();

        const title = document.createElement("span");
        title.textContent = label;

        const amount = document.createElement("strong");
        amount.textContent = value;

        card.append(title, amount);
        return card;
    }

    function getHolidayFigures(holiday) {
        const records = expenses().filter(
            expense => expense.holidayId === holiday.id
        );

        const spent = records.reduce(
            (total, expense) => total + Number(expense.amount || 0),
            0
        );

        const budget = Number(holiday.budget || 0);
        const days = Math.max(1, (holiday.days || []).length);

        return {
            records,
            spent,
            budget,
            remaining: budget - spent,
            percentage: budget > 0 ? spent / budget * 100 : 0,
            days,
            dailyBudget: budget > 0 ? budget / days : 0,
            dailySpend: spent / days
        };
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
            budgetForm.hidden = true;
            comparison.hidden = true;
            renderAllBudgets();
            return;
        }

        holidaySelect.disabled = false;
        budgetForm.hidden = false;
        comparison.hidden = false;

        list.forEach(holiday => {
            const option = document.createElement("option");
            option.value = holiday.id;
            option.textContent = holiday.name;
            holidaySelect.appendChild(option);
        });

        if (list.some(holiday => holiday.id === previous)) {
            holidaySelect.value = previous;
        }

        renderSelectedHoliday();
        renderAllBudgets();
    }

    function renderSelectedHoliday() {
        const holiday = selectedHoliday();

        comparison.replaceChildren();
        dashboard.replaceChildren();

        if (!holiday) return;

        budgetInput.value = holiday.budget ?? "";

        const figures = getHolidayFigures(holiday);
        const {
            budget,
            spent,
            remaining,
            percentage,
            days,
            dailyBudget,
            dailySpend
        } = figures;

        if (!budget) {
            const empty = document.createElement("p");
            empty.textContent =
                "Enter a budget above to start tracking this holiday.";
            comparison.appendChild(empty);
            return;
        }

        comparison.append(
            makeStat("Total budget", currency(budget)),
            makeStat("Actual spending", currency(spent)),
            makeStat(
                remaining >= 0 ? "Budget remaining" : "Over budget",
                currency(Math.abs(remaining)),
                remaining >= 0 ? "within-budget" : "over-budget"
            ),
            makeStat("Budget per day", currency(dailyBudget)),
            makeStat("Average daily spending", currency(dailySpend))
        );

        const progressSection = document.createElement("div");
        progressSection.className = "budget-progress-section";

        const progressLabel = document.createElement("div");
        progressLabel.className = "budget-progress-label";

        const used = document.createElement("strong");
        used.textContent = `${percentage.toFixed(1)}% of budget used`;

        const total = document.createElement("span");
        total.textContent =
            `${currency(spent)} of ${currency(budget)}`;

        progressLabel.append(used, total);

        const track = document.createElement("div");
        track.className = "budget-progress-track";
        track.setAttribute("role", "progressbar");
        track.setAttribute("aria-valuemin", "0");
        track.setAttribute("aria-valuemax", "100");
        track.setAttribute(
            "aria-valuenow",
            Math.min(100, percentage).toFixed(1)
        );

        const bar = document.createElement("div");
        bar.className = "budget-progress-bar";
        bar.style.width = `${Math.min(100, percentage)}%`;

        if (percentage > 100) {
            bar.classList.add("budget-progress-over");
        } else if (percentage >= 80) {
            bar.classList.add("budget-progress-warning");
        }

        track.appendChild(bar);
        progressSection.append(progressLabel, track);

        const note = document.createElement("p");
        note.textContent = percentage > 100
            ? `You have exceeded your budget by ${currency(Math.abs(remaining))}.`
            : percentage >= 80
                ? "You have used at least 80% of your budget."
                : `${currency(remaining)} remains available across ${days} days.`;

        progressSection.appendChild(note);
        dashboard.appendChild(progressSection);
    }

    function renderAllBudgets() {
        allBudgets.replaceChildren();

        if (!holidays().length) {
            const empty = document.createElement("p");
            empty.textContent = "No saved holidays yet.";
            allBudgets.appendChild(empty);
            return;
        }

        holidays().forEach(holiday => {
            const figures = getHolidayFigures(holiday);

            const card = document.createElement("article");
            card.className = "activity-card budget-holiday-card";

            const name = document.createElement("h3");
            name.textContent = holiday.name;

            const dates = document.createElement("p");
            dates.textContent =
                `${holiday.startDate} to ${holiday.endDate}`;

            const budget = document.createElement("p");
            budget.textContent = figures.budget
                ? `Budget: ${currency(figures.budget)}`
                : "Budget not set";

            const spent = document.createElement("p");
            spent.textContent =
                `Spent: ${currency(figures.spent)}`;

            const balance = document.createElement("p");

            if (!figures.budget) {
                balance.textContent = "Set a budget to see your balance.";
            } else if (figures.remaining >= 0) {
                balance.textContent =
                    `Remaining: ${currency(figures.remaining)}`;
            } else {
                balance.textContent =
                    `Over budget: ${currency(Math.abs(figures.remaining))}`;
            }

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "reset-filters";
            editButton.textContent = "Manage budget";

            editButton.addEventListener("click", () => {
                holidaySelect.value = holiday.id;
                renderSelectedHoliday();
                section.scrollIntoView({
                    behaviour: "smooth",
                    block: "start"
                });
                budgetInput.focus();
            });

            card.append(name, dates, budget, spent, balance, editButton);
            allBudgets.appendChild(card);
        });
    }

    budgetForm.addEventListener("submit", event => {
        event.preventDefault();

        const holiday = selectedHoliday();

        if (!holiday) {
            message.textContent = "Select a holiday first.";
            return;
        }

        const amount = Number(budgetInput.value);

        if (!Number.isFinite(amount) || amount <= 0) {
            message.textContent =
                "Enter a budget greater than zero.";
            return;
        }

        const previous = holiday.budget;
        holiday.budget = Math.round(amount * 100) / 100;

        if (!planner.saveData()) {
            holiday.budget = previous;
            message.textContent =
                "Unable to save your budget. Check browser storage.";
            return;
        }

        message.textContent = "Holiday budget saved.";
        renderSelectedHoliday();
        renderAllBudgets();

        window.dispatchEvent(
            new CustomEvent("adventureplanner:datachanged")
        );
    });

    holidaySelect.addEventListener("change", () => {
        message.textContent = "";
        renderSelectedHoliday();
    });

    window.addEventListener("adventureplanner:datachanged", renderHolidayOptions);
    window.addEventListener("focus", renderHolidayOptions);
    window.addEventListener("pageshow", renderHolidayOptions);

    renderHolidayOptions();

    console.log("Holiday Budget Planner initialised.");
})();
