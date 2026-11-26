
"use strict";

/*
 * Holiday Packing Checklist
 * Creates a separate saved checklist for every holiday.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    if (!Array.isArray(planner.data.holidayPackingLists)) {
        planner.data.holidayPackingLists = [];
    }

    const suggestions = {
        "Essentials": [
            "Wallet and bank cards",
            "Driving licence",
            "Phone",
            "Phone charger",
            "Power bank",
            "Sunglasses",
            "Keys",
            "Booking confirmations"
        ],
        "Clothing": [
            "Everyday clothes",
            "Underwear and socks",
            "Sleepwear",
            "Comfortable walking shoes",
            "Sandals",
            "Jumper or jacket",
            "Swimwear",
            "Hat"
        ],
        "Toiletries and health": [
            "Toothbrush and toothpaste",
            "Shampoo and conditioner",
            "Deodorant",
            "Sunscreen",
            "Insect repellent",
            "Personal medication",
            "First aid kit",
            "Personal toiletries"
        ],
        "Food and outdoor": [
            "Water bottles",
            "Snacks",
            "Picnic blanket",
            "Reusable shopping bags",
            "Cooler bag",
            "Towels",
            "Torch",
            "Camping or outdoor equipment"
        ],
        "Dog supplies": [
            "Dog food",
            "Food and water bowls",
            "Lead and harness",
            "Dog bedding",
            "Poo bags",
            "Dog towels",
            "Dog medication",
            "Vaccination records"
        ],
        "Travel and accommodation": [
            "Accommodation details",
            "Travel itinerary",
            "Camera",
            "Headphones",
            "Laundry bag",
            "Reusable coffee cup",
            "Umbrella or raincoat"
        ]
    };

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "holiday-packing";

    const heading = document.createElement("h2");
    heading.textContent = "🧳 Holiday Packing Checklist";

    const intro = document.createElement("p");
    intro.textContent =
        "Prepare for each trip with a reusable packing checklist. Tick items off as you pack.";

    const holidaySelect = document.createElement("select");
    holidaySelect.setAttribute("aria-label", "Select holiday");

    const progress = document.createElement("div");
    progress.className = "packing-progress";

    const progressText = document.createElement("p");
    const progressTrack = document.createElement("div");
    progressTrack.className = "packing-progress-track";

    const progressBar = document.createElement("div");
    progressBar.className = "packing-progress-bar";

    progressTrack.appendChild(progressBar);
    progress.append(progressText, progressTrack);

    const categoryContainer = document.createElement("div");
    categoryContainer.className = "packing-categories";

    const addForm = document.createElement("form");
    addForm.className = "packing-add-form";

    const addInput = document.createElement("input");
    addInput.type = "text";
    addInput.placeholder = "Add your own packing item...";
    addInput.maxLength = 120;
    addInput.required = true;

    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.className = "add-activity-button";
    addButton.textContent = "Add Item";

    addForm.append(addInput, addButton);

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "reset-filters";
    resetButton.textContent = "Reset checklist";

    const message = document.createElement("p");
    message.className = "packing-message";

    section.append(
        heading,
        intro,
        makeField("Select holiday", holidaySelect),
        progress,
        categoryContainer,
        addForm,
        resetButton,
        message
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

    function getHolidays() {
        return planner.data.savedHolidayPlans || [];
    }

    function getLists() {
        return planner.data.holidayPackingLists;
    }

    function getSelectedHoliday() {
        return getHolidays().find(
            holiday => holiday.id === holidaySelect.value
        );
    }

    function getList(holidayId) {
        return getLists().find(
            list => list.holidayId === holidayId
        );
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

    function createList(holiday) {
        const items = [];

        Object.entries(suggestions).forEach(([category, names]) => {
            names.forEach(name => {
                items.push({
                    id: `packing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                    name,
                    category,
                    packed: false,
                    custom: false
                });
            });
        });

        const list = {
            holidayId: holiday.id,
            items,
            createdAt: new Date().toISOString()
        };

        getLists().push(list);
        return list;
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
            progress.hidden = true;
            categoryContainer.replaceChildren();
            addForm.hidden = true;
            resetButton.hidden = true;
            return;
        }

        holidaySelect.disabled = false;
        progress.hidden = false;
        addForm.hidden = false;
        resetButton.hidden = false;

        holidays.forEach(holiday => {
            const option = document.createElement("option");
            option.value = holiday.id;
            option.textContent = holiday.name;
            holidaySelect.appendChild(option);
        });

        if (holidays.some(item => item.id === previous)) {
            holidaySelect.value = previous;
        }

        renderChecklist();
    }

    function renderChecklist() {
        categoryContainer.replaceChildren();

        const holiday = getSelectedHoliday();

        if (!holiday) return;

        let list = getList(holiday.id);

        if (!list) {
            list = createList(holiday);
            save();
        }

        const items = list.items || [];
        const packedCount = items.filter(item => item.packed).length;
        const percentage = items.length
            ? packedCount / items.length * 100
            : 0;

        progressText.textContent =
            `${packedCount} of ${items.length} items packed (${percentage.toFixed(0)}%)`;

        progressBar.style.width = `${percentage}%`;

        const grouped = new Map();

        items.forEach(item => {
            if (!grouped.has(item.category)) {
                grouped.set(item.category, []);
            }

            grouped.get(item.category).push(item);
        });

        grouped.forEach((categoryItems, category) => {
            const card = document.createElement("article");
            card.className = "packing-category";

            const title = document.createElement("h3");
            title.textContent = category;

            const count = document.createElement("span");
            count.className = "packing-category-count";

            const completed = categoryItems.filter(
                item => item.packed
            ).length;

            count.textContent =
                `${completed}/${categoryItems.length}`;

            const titleRow = document.createElement("div");
            titleRow.className = "packing-category-heading";
            titleRow.append(title, count);

            const itemList = document.createElement("div");
            itemList.className = "packing-items";

            categoryItems.forEach(item => {
                const row = document.createElement("div");
                row.className = "packing-item";

                const label = document.createElement("label");
                label.className = "packing-item-label";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = Boolean(item.packed);

                const name = document.createElement("span");
                name.textContent = item.name;

                if (item.packed) {
                    name.classList.add("packing-checked");
                }

                checkbox.addEventListener("change", () => {
                    item.packed = checkbox.checked;

                    if (save()) {
                        renderChecklist();
                    } else {
                        checkbox.checked = !checkbox.checked;
                        item.packed = checkbox.checked;
                    }
                });

                label.append(checkbox, name);
                row.appendChild(label);

                if (item.custom) {
                    const remove = document.createElement("button");
                    remove.type = "button";
                    remove.className = "packing-remove";
                    remove.textContent = "Remove";
                    remove.setAttribute(
                        "aria-label",
                        `Remove ${item.name}`
                    );

                    remove.addEventListener("click", () => {
                        const index = list.items.findIndex(
                            entry => entry.id === item.id
                        );

                        if (index !== -1) {
                            list.items.splice(index, 1);

                            if (save()) renderChecklist();
                        }
                    });

                    row.appendChild(remove);
                }

                itemList.appendChild(row);
            });

            card.append(titleRow, itemList);
            categoryContainer.appendChild(card);
        });
    }

    addForm.addEventListener("submit", event => {
        event.preventDefault();

        const holiday = getSelectedHoliday();
        const name = addInput.value.trim();

        if (!holiday || !name) return;

        let list = getList(holiday.id);

        if (!list) {
            list = createList(holiday);
        }

        const duplicate = list.items.some(
            item => item.name.toLowerCase() === name.toLowerCase()
        );

        if (duplicate) {
            message.textContent =
                "That item is already on this packing list.";
            return;
        }

        list.items.push({
            id: `packing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name,
            category: "My Custom Items",
            packed: false,
            custom: true
        });

        if (save()) {
            addInput.value = "";
            message.textContent = "Packing item added.";
            renderChecklist();
        }
    });

    resetButton.addEventListener("click", () => {
        const holiday = getSelectedHoliday();

        if (!holiday) return;

        if (!window.confirm(
            "Uncheck every item on this holiday's packing list?"
        )) return;

        const list = getList(holiday.id);

        if (!list) return;

        list.items.forEach(item => {
            item.packed = false;
        });

        if (save()) {
            message.textContent = "Checklist reset.";
            renderChecklist();
        }
    });

    holidaySelect.addEventListener("change", () => {
        message.textContent = "";
        renderChecklist();
    });

    window.addEventListener(
        "adventureplanner:datachanged",
        renderHolidayOptions
    );

    window.addEventListener("focus", renderHolidayOptions);
    window.addEventListener("pageshow", renderHolidayOptions);

    renderHolidayOptions();

    console.log("Holiday Packing Checklist initialised.");
})();
