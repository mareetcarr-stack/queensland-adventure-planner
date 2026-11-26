
"use strict";

/*
 * Calendar Export
 * Exports saved day itineraries and multi-day holidays as .ics files.
 * Compatible with Google Calendar, Apple Calendar and Outlook.
 */

(() => {
    const planner = window.AdventurePlanner;

    if (!planner) {
        console.error("Adventure Planner was not found.");
        return;
    }

    const activities = () => planner.getActivities();

    const formatDate = value => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
            return null;
        }

        return value.replaceAll("-", "");
    };

    const nextDate = value => {
        const date = new Date(`${value}T12:00:00`);
        date.setDate(date.getDate() + 1);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const escapeICS = value =>
        String(value ?? "")
            .replace(/\\/g, "\\\\")
            .replace(/\r?\n/g, "\\n")
            .replace(/,/g, "\\,")
            .replace(/;/g, "\\;");

    function foldLine(line) {
        const parts = [];
        let current = "";
        let length = 0;

        for (const character of line) {
            const charLength = new TextEncoder().encode(character).length;

            if (length + charLength > 73) {
                parts.push(current);
                current = " " + character;
                length = 1 + charLength;
            } else {
                current += character;
                length += charLength;
            }
        }

        parts.push(current);
        return parts.join("\r\n");
    }

    function makeEvent(title, date, description, uid) {
        const start = formatDate(date);
        const end = formatDate(nextDate(date));

        if (!start || !end) return null;

        return [
            "BEGIN:VEVENT",
            `UID:${escapeICS(uid)}@adventure-planner`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
            `DTSTART;VALUE=DATE:${start}`,
            `DTEND;VALUE=DATE:${end}`,
            `SUMMARY:${escapeICS(title)}`,
            `DESCRIPTION:${escapeICS(description)}`,
            "END:VEVENT"
        ].join("\r\n");
    }

    function getActivityDetails(ids) {
        return (ids || [])
            .map(id => activities().find(activity => activity.id === id))
            .filter(Boolean);
    }

    function describeActivities(items) {
        if (!items.length) return "No activities planned.";

        return items.map(activity => {
            const cost = activity.estimatedCost == null
                ? "Cost unconfirmed"
                : activity.estimatedCost === 0
                    ? "Free"
                    : `Estimated cost: $${activity.estimatedCost}`;

            return [
                activity.name,
                `Destination: ${activity.destination}`,
                `Duration: ${activity.durationHours || 0} hours`,
                cost,
                activity.description || ""
            ].filter(Boolean).join("\n");
        }).join("\n\n");
    }

    function downloadCalendar(filename, events, calendarName) {
        if (!events.length) {
            window.alert("There are no valid calendar events to export.");
            return;
        }

        const content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Adventure Planner//Calendar Export//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            `X-WR-CALNAME:${escapeICS(calendarName)}`,
            ...events,
            "END:VCALENDAR"
        ].map(foldLine).join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + content + "\r\n"],
            { type: "text/calendar;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function exportDayItinerary(itinerary) {
        const items = getActivityDetails(itinerary.activityIds);

        const event = makeEvent(
            `Adventure Planner: ${items.map(item => item.name).join(", ") || "Day trip"}`,
            itinerary.date,
            describeActivities(items),
            itinerary.id
        );

        downloadCalendar(
            `adventure-day-${itinerary.date}.ics`,
            event ? [event] : [],
            "Adventure Planner"
        );
    }

    function exportHoliday(holiday) {
        const events = [];

        (holiday.days || []).forEach((day, index) => {
            const items = getActivityDetails(day.activityIds);
            const names = items.map(item => item.name);

            const event = makeEvent(
                `${holiday.name} — Day ${index + 1}${names.length ? ": " + names.join(", ") : ""}`,
                day.date,
                [
                    holiday.name,
                    `Day ${index + 1}`,
                    describeActivities(items)
                ].join("\n\n"),
                `${holiday.id}-${day.date}`
            );

            if (event) events.push(event);
        });

        downloadCalendar(
            `${holiday.name || "holiday"}.ics`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "") + ".ics",
            events,
            holiday.name || "Adventure Planner Holiday"
        );
    }

    function createSection() {
        const section = document.createElement("section");
        section.className = "feature";
        section.id = "calendar-export";

        const heading = document.createElement("h2");
        heading.textContent = "Export to Calendar";

        const intro = document.createElement("p");
        intro.textContent =
            "Download your saved adventures and holiday schedules as calendar events.";

        const dayHeading = document.createElement("h3");
        dayHeading.textContent = "Saved Day Itineraries";

        const dayList = document.createElement("div");

        const holidayHeading = document.createElement("h3");
        holidayHeading.textContent = "Saved Holidays";

        const holidayList = document.createElement("div");

        section.append(
            heading,
            intro,
            dayHeading,
            dayList,
            holidayHeading,
            holidayList
        );

        const main = document.querySelector("main");
        const footer = document.querySelector("footer");

        if (footer && footer.parentElement === main) {
            main.insertBefore(section, footer);
        } else {
            main.appendChild(section);
        }

        function makeButton(label, callback) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "reset-filters";
            button.textContent = label;
            button.addEventListener("click", callback);
            return button;
        }

        function render() {
            dayList.replaceChildren();
            holidayList.replaceChildren();

            const itineraries = planner.data.savedItineraries || [];
            const holidays = planner.data.savedHolidayPlans || [];

            if (!itineraries.length) {
                dayList.textContent = "No saved day itineraries yet.";
            } else {
                itineraries.forEach(itinerary => {
                    const row = document.createElement("div");
                    row.className = "calendar-export-row";

                    const date = document.createElement("span");
                    date.textContent = new Date(
                        `${itinerary.date}T12:00:00`
                    ).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    });

                    row.append(
                        date,
                        makeButton("Export .ics", () =>
                            exportDayItinerary(itinerary)
                        )
                    );

                    dayList.appendChild(row);
                });
            }

            if (!holidays.length) {
                holidayList.textContent = "No saved holidays yet.";
            } else {
                holidays.forEach(holiday => {
                    const row = document.createElement("div");
                    row.className = "calendar-export-row";

                    const name = document.createElement("span");
                    name.textContent = holiday.name;

                    row.append(
                        name,
                        makeButton("Export holiday .ics", () =>
                            exportHoliday(holiday)
                        )
                    );

                    holidayList.appendChild(row);
                });
            }
        }

        render();

        window.addEventListener("adventureplanner:datachanged", render);
        window.addEventListener("focus", render);
        window.addEventListener("pageshow", render);

        console.log("Calendar export initialised.");
    }

    document.addEventListener("DOMContentLoaded", createSection);
})();
