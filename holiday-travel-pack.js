
"use strict";

/*
 * Holiday Travel Pack
 * Creates a print-friendly itinerary and booking summary for each holiday.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "holiday-travel-pack";

    const heading = document.createElement("h2");
    heading.textContent = "🖨️ Printable Holiday Travel Pack";

    const intro = document.createElement("p");
    intro.textContent =
        "Create a printable document containing your itinerary, bookings, packing progress and holiday expenses.";

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Select holiday");

    const printButton = document.createElement("button");
    printButton.type = "button";
    printButton.className = "add-activity-button";
    printButton.textContent = "Generate Travel Pack";

    const message = document.createElement("p");
    message.className = "travel-pack-message";

    section.append(
        heading,
        intro,
        makeField("Select holiday", select),
        printButton,
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

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    const formatDate = value => {
        if (!value) return "Date not specified";

        const date = new Date(`${value}T12:00:00`);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-AU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const money = value =>
        value == null
            ? "Not recorded"
            : new Intl.NumberFormat("en-AU", {
                style: "currency",
                currency: "AUD"
            }).format(Number(value) || 0);

    function getHoliday() {
        return (planner.data.savedHolidayPlans || []).find(
            holiday => holiday.id === select.value
        );
    }

    function getActivity(id) {
        return planner.getActivities().find(
            activity => activity.id === id
        );
    }

    function renderOptions() {
        const previous = select.value;
        select.replaceChildren();

        const holidays = planner.data.savedHolidayPlans || [];

        if (!holidays.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Create a holiday first";
            select.appendChild(option);
            select.disabled = true;
            printButton.disabled = true;
            message.textContent = "No saved holidays are available.";
            return;
        }

        select.disabled = false;
        printButton.disabled = false;
        message.textContent = "";

        holidays.forEach(holiday => {
            const option = document.createElement("option");
            option.value = holiday.id;
            option.textContent = holiday.name;
            select.appendChild(option);
        });

        if (holidays.some(holiday => holiday.id === previous)) {
            select.value = previous;
        }
    }

    function activityHTML(activity) {
        if (!activity) return "";

        const cost = activity.estimatedCost == null
            ? "Cost not confirmed"
            : activity.estimatedCost === 0
                ? "Free"
                : `Estimated cost: ${money(activity.estimatedCost)}`;

        return `
            <article class="pack-activity">
                <h4>${escapeHTML(activity.name)}</h4>
                <p><strong>Destination:</strong> ${escapeHTML(activity.destination || "Not specified")}</p>
                <p><strong>Duration:</strong> ${escapeHTML(activity.durationHours || 0)} hours</p>
                <p><strong>Cost:</strong> ${escapeHTML(cost)}</p>
                <p>${escapeHTML(activity.description || "")}</p>
            </article>
        `;
    }

    function bookingsHTML(holiday) {
        const bookings = (planner.data.holidayBookings || [])
            .filter(item => item.holidayId === holiday.id)
            .sort((a, b) =>
                (a.date || "9999-99-99").localeCompare(
                    b.date || "9999-99-99"
                )
            );

        if (!bookings.length) {
            return "<p>No bookings recorded.</p>";
        }

        return bookings.map(item => `
            <article class="pack-booking">
                <h4>${escapeHTML(item.name)}</h4>
                <p><strong>Category:</strong> ${escapeHTML(item.category || "Other")}</p>
                ${item.date ? `<p><strong>Date:</strong> ${escapeHTML(formatDate(item.date))}</p>` : ""}
                ${item.time ? `<p><strong>Time:</strong> ${escapeHTML(item.time)}</p>` : ""}
                ${item.reference ? `<p><strong>Booking reference:</strong> ${escapeHTML(item.reference)}</p>` : ""}
                ${item.address ? `<p><strong>Address:</strong> ${escapeHTML(item.address)}</p>` : ""}
                ${item.contact ? `<p><strong>Contact:</strong> ${escapeHTML(item.contact)}</p>` : ""}
                ${item.notes ? `<p><strong>Notes:</strong> ${escapeHTML(item.notes)}</p>` : ""}
            </article>
        `).join("");
    }

    function packingHTML(holiday) {
        const list = (planner.data.holidayPackingLists || [])
            .find(item => item.holidayId === holiday.id);

        if (!list || !Array.isArray(list.items)) {
            return "<p>No packing checklist created.</p>";
        }

        const categories = {};

        list.items.forEach(item => {
            if (!categories[item.category]) categories[item.category] = [];
            categories[item.category].push(item);
        });

        const total = list.items.length;
        const packed = list.items.filter(item => item.packed).length;

        return `
            <p><strong>${packed} of ${total} items packed</strong></p>
            ${Object.entries(categories).map(([category, items]) => `
                <h4>${escapeHTML(category)}</h4>
                <ul class="pack-checklist">
                    ${items.map(item => `
                        <li>${item.packed ? "☑" : "☐"} ${escapeHTML(item.name)}</li>
                    `).join("")}
                </ul>
            `).join("")}
        `;
    }

    function expensesHTML(holiday) {
        const expenses = (planner.data.holidayExpenses || [])
            .filter(item => item.holidayId === holiday.id);

        const total = expenses.reduce(
            (sum, item) => sum + (Number(item.amount) || 0),
            0
        );

        if (!expenses.length) {
            return "<p>No expenses recorded.</p>";
        }

        return `
            <p><strong>Total recorded spending: ${money(total)}</strong></p>
            <table class="pack-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.map(item => `
                        <tr>
                            <td>${escapeHTML(formatDate(item.date))}</td>
                            <td>${escapeHTML(item.description || "")}</td>
                            <td>${escapeHTML(item.category || "")}</td>
                            <td>${escapeHTML(money(item.amount))}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    function buildDocument(holiday) {
        const activities = planner.getActivities();
        const days = [...(holiday.days || [])].sort(
            (a, b) => a.date.localeCompare(b.date)
        );

        const itinerary = days.map((day, index) => {
            const items = (day.activityIds || [])
                .map(id => activities.find(activity => activity.id === id))
                .filter(Boolean);

            return `
                <section class="pack-day">
                    <h3>Day ${index + 1} — ${escapeHTML(formatDate(day.date))}</h3>
                    ${items.length
                        ? items.map(activityHTML).join("")
                        : "<p>No activities scheduled.</p>"}
                </section>
            `;
        }).join("");

        const budget = Number(holiday.budget) || 0;

        const documentHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${escapeHTML(holiday.name)} — Travel Pack</title>
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        color: #263b35;
                        line-height: 1.5;
                        max-width: 850px;
                        margin: 35px auto;
                        padding: 0 24px;
                    }
                    h1, h2, h3, h4 { color: #183b35; }
                    h1 { font-size: 30px; margin-bottom: 5px; }
                    h2 {
                        border-bottom: 2px solid #28564b;
                        padding-bottom: 7px;
                        margin-top: 32px;
                    }
                    h3 {
                        background: #edf1eb;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    .subtitle { color: #687871; }
                    .pack-day, .pack-booking, .pack-activity {
                        margin: 14px 0;
                        padding: 12px 16px;
                        border: 1px solid #e5e9e2;
                        border-radius: 6px;
                        break-inside: avoid;
                    }
                    .pack-activity h4, .pack-booking h4 {
                        margin: 0 0 8px;
                    }
                    .pack-activity p, .pack-booking p {
                        margin: 5px 0;
                    }
                    .pack-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .pack-table th, .pack-table td {
                        border: 1px solid #ddd;
                        padding: 7px;
                        text-align: left;
                    }
                    .pack-table th { background: #edf1eb; }
                    .pack-checklist { columns: 2; }
                    .pack-checklist li { margin-bottom: 5px; }
                    .notes {
                        white-space: pre-wrap;
                        border: 1px solid #e5e9e2;
                        padding: 14px;
                        border-radius: 6px;
                    }
                    .print-actions {
                        margin: 20px 0;
                    }
                    button {
                        padding: 11px 18px;
                        border: 0;
                        border-radius: 6px;
                        background: #183b35;
                        color: white;
                        font-size: 15px;
                        cursor: pointer;
                    }
                    @media print {
                        body { margin: 0; padding: 0; max-width: none; }
                        .print-actions { display: none; }
                        h2, h3 { break-after: avoid; }
                        a { color: inherit; }
                    }
                    @page { margin: 16mm; }
                </style>
            </head>
            <body>
                <div class="print-actions">
                    <button onclick="window.print()">Print / Save as PDF</button>
                </div>

                <h1>${escapeHTML(holiday.name)}</h1>
                <p class="subtitle">
                    ${escapeHTML(formatDate(holiday.startDate))}
                    to
                    ${escapeHTML(formatDate(holiday.endDate))}
                </p>
                <p>Adventure Planner travel pack</p>

                <h2>Holiday Itinerary</h2>
                ${itinerary || "<p>No daily itinerary has been added.</p>"}

                <h2>Bookings and Reservations</h2>
                ${bookingsHTML(holiday)}

                <h2>General Holiday Notes</h2>
                <div class="notes">${escapeHTML(holiday.generalNotes || "No general notes recorded.")}</div>

                <h2>Packing Checklist</h2>
                ${packingHTML(holiday)}

                <h2>Holiday Expenses</h2>
                ${expensesHTML(holiday)}

                ${budget > 0
                    ? `<p><strong>Planned holiday budget:</strong> ${escapeHTML(money(budget))}</p>`
                    : ""}
                
                <footer>
                    <p class="subtitle">Generated ${escapeHTML(new Date().toLocaleDateString("en-AU"))} using Adventure Planner.</p>
                </footer>
            </body>
            </html>
        `;

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            message.textContent =
                "The travel pack was blocked by your browser. Allow pop-ups for this site and try again.";
            return;
        }

        printWindow.document.open();
        printWindow.document.write(documentHTML);
        printWindow.document.close();
        printWindow.focus();
    }

    printButton.addEventListener("click", () => {
        const holiday = getHoliday();

        if (!holiday) {
            message.textContent = "Select a holiday first.";
            return;
        }

        buildDocument(holiday);
    });

    window.addEventListener("adventureplanner:datachanged", renderOptions);
    window.addEventListener("focus", renderOptions);
    window.addEventListener("pageshow", renderOptions);

    renderOptions();

    console.log("Holiday Travel Pack initialised.");
})();
