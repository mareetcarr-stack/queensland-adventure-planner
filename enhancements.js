"use strict";

/*
 * Adventure Planner — consolidated interface refinements.
 * Loaded after the page's existing scripts. Keeps the existing data schema
 * and localStorage key; archived itineraries are represented by ID only.
 */

(() => {
    const planner = window.AdventurePlanner;
    if (!planner) return;

    const page = document.body.dataset.page || "";
    const ARCHIVE_KEY = "archivedItineraries";
    let refreshQueued = false;

    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    function emitChange() {
        document.dispatchEvent(new CustomEvent("adventureplanner:datachanged"));
    }

    function scheduleRefresh() {
        if (refreshQueued) return;
        refreshQueued = true;
        window.setTimeout(() => {
            refreshQueued = false;
            applyRefinements();
        }, 30);
    }

    function getArchiveIds() {
        if (!Array.isArray(planner.data[ARCHIVE_KEY])) {
            planner.data[ARCHIVE_KEY] = [];
        }
        return new Set(planner.data[ARCHIVE_KEY]);
    }

    function saveArchiveIds(ids) {
        planner.data[ARCHIVE_KEY] = [...ids];
        if (!planner.saveData()) {
            window.alert("Unable to save the archive change. Check browser storage.");
            return false;
        }
        emitChange();
        return true;
    }

    function addDatalist(input, id, values) {
        if (!input) return;
        const list = document.getElementById(id) || document.createElement("datalist");
        list.id = id;
        list.replaceChildren();
        [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b)).forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            list.appendChild(option);
        });
        if (!list.isConnected) document.body.appendChild(list);
        input.setAttribute("list", id);
    }

    function refineActivityForm() {
        const form = document.querySelector("#add-activity .activity-form");
        if (!form || form.dataset.refined === "true") return;
        form.dataset.refined = "true";

        const heading = document.querySelector("#add-activity h2");
        if (heading) heading.textContent = "Add an Activity";

        const activities = planner.getActivities();
        const destinationInput = form.elements.namedItem("destination");
        const regionInput = form.elements.namedItem("region");
        const categoryInput = form.elements.namedItem("category");

        addDatalist(destinationInput, "activity-destinations", activities.map(item => item.destination));
        addDatalist(regionInput, "activity-regions", activities.map(item => item.region));
        addDatalist(categoryInput, "activity-categories", [
            ...activities.flatMap(item => item.category || []),
            "beach", "coastal", "walking", "hiking", "waterfall", "lookout",
            "wildlife", "history", "heritage", "museum", "garden", "market",
            "food", "scenic-drive", "water-activities", "family-friendly"
        ]);

        if (destinationInput) destinationInput.placeholder = "Start typing a destination or choose a suggestion";
        if (regionInput) regionInput.placeholder = "Start typing a region or choose a suggestion";
        if (categoryInput) categoryInput.placeholder = "e.g. beach, walking, wildlife (comma separated)";

        const estimated = form.elements.namedItem("estimatedCost");
        if (estimated) {
            estimated.value = "";
            const wrapper = estimated.closest("label, .form-field");
            if (wrapper) wrapper.hidden = true;
        }

        const cost = form.elements.namedItem("cost");
        if (cost) {
            const wrapper = cost.closest("label, .form-field");
            if (wrapper) wrapper.hidden = true;
        }

        const petSelect = form.elements.namedItem("dogPolicy");
        if (petSelect) {
            const label = petSelect.closest("label");
            const caption = label?.querySelector("span");
            if (caption) caption.textContent = "Pet access";
            [...petSelect.options].forEach(option => {
                option.textContent = option.textContent
                    .replace(/Dog-friendly/gi, "Pet-friendly")
                    .replace(/Dogs not permitted/gi, "Pets not permitted")
                    .replace(/Dog access/gi, "Pet access");
            });
        }

        const submit = form.querySelector('button[type="submit"]');
        if (submit) submit.textContent = "Add Activity";
    }

    function refineCustomEditor() {
        document.querySelectorAll(".custom-activity-editor").forEach(editor => {
            const estimated = editor.querySelector('[name="estimatedCost"]');
            if (estimated) {
                estimated.value = "";
                const wrapper = estimated.closest("label");
                if (wrapper) wrapper.hidden = true;
            }
            const cost = editor.querySelector('[name="cost"]');
            if (cost) {
                const wrapper = cost.closest("label");
                if (wrapper) wrapper.hidden = true;
            }
            const pet = editor.querySelector('[name="dogPolicy"]');
            if (pet) {
                const caption = pet.closest("label")?.firstChild;
                if (caption && caption.nodeType === Node.TEXT_NODE) caption.textContent = "Pet access";
                [...pet.options].forEach(option => {
                    option.textContent = option.textContent
                        .replace(/Dog-friendly/gi, "Pet-friendly")
                        .replace(/Dogs not permitted/gi, "Pets not permitted");
                });
            }
            const category = editor.querySelector('[name="category"]');
            if (category) category.placeholder = "e.g. beach, walking, wildlife (comma separated)";
        });
    }

    function refineDiscover() {
        document.querySelectorAll("#discover-results .discover-card").forEach(card => {
            const details = card.querySelector(".discover-details");
            if (details) {
                [...details.children].forEach(item => {
                    if (/\bfree\b|\bcost\b|\$\s?\d/i.test(item.textContent)) item.remove();
                    item.textContent = item.textContent
                        .replace(/Dog-friendly/gi, "Pet-friendly")
                        .replace(/Not pet-friendly/gi, "Pets not permitted");
                });
            }
            const button = card.querySelector("button");
            if (button) button.classList.add("discover-complete-button");
        });
    }

    function refineDayPlanner() {
        const summary = document.querySelector("#day-planner .day-planner-summary");
        if (summary) {
            [...summary.querySelectorAll("p")].forEach(paragraph => {
                if (/cost|figure|exclude travel|meal/i.test(paragraph.textContent)) paragraph.remove();
            });
        }
        document.querySelectorAll("#day-planner .day-planner-choice").forEach(choice => {
            [...choice.querySelectorAll("span")].forEach(span => {
                if (/cost/i.test(span.textContent)) span.remove();
            });
        });
        document.querySelectorAll("#day-planner .generated-day").forEach(card => {
            card.querySelectorAll(".generated-day-summary").forEach(node => {
                if (/cost/i.test(node.textContent)) node.remove();
            });
        });
    }

    function improveGeneratedNarrative() {
        document.querySelectorAll(".generated-day").forEach(card => {
            const overview = card.querySelector(".generated-day-overview");
            const items = [...card.querySelectorAll(".generated-activity")];
            if (!overview || !items.length || overview.dataset.narrativeRefined === "true") return;

            const experiences = items.map(item => {
                const name = item.querySelector("strong")?.textContent?.replace(/^\d+\.\s*/, "") || "an experience";
                const spans = [...item.querySelectorAll("span")].map(span => span.textContent.trim()).filter(Boolean);
                const description = spans.find(value => value.length > 55 && !/hours|pet-friendly|pets not permitted/i.test(value));
                return { name, description };
            });

            let narrative;
            if (experiences.length === 1) {
                narrative = `Spend the day discovering ${experiences[0].name}. ${experiences[0].description || "Take your time exploring the area and enjoy the experience at your own pace."} Allow time around the activity to explore nearby, stop for refreshments and enjoy the journey.`;
            } else {
                const first = experiences[0];
                const middle = experiences.slice(1, -1);
                const last = experiences[experiences.length - 1];
                const names = experiences.map(item => item.name);
                const joined = names.length === 2 ? `${names[0]} and ${names[1]}` : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
                narrative = `Make a day of exploring ${card.querySelector("h4")?.textContent || "the area"}, beginning with ${first.name.toLowerCase()}${first.description ? ` — ${first.description}` : ""}. ${middle.length ? `Continue on to ${middle.map(item => item.name).join(" and ")}, then ` : "From there, "}finish with ${last.name.toLowerCase()}${last.description ? `, ${last.description}` : ""}. Together, ${joined} create a varied outing, with time to pause for refreshments and enjoy the surroundings between stops.`;
            }
            overview.textContent = narrative;
            overview.dataset.narrativeRefined = "true";
        });
    }

    function refineShortlist() {
        const search = document.querySelector("#my-shortlist .shortlist-add-controls input[type='search']");
        if (search) {
            search.placeholder = "Search by activity, destination, region or interest…";
            search.setAttribute("aria-label", "Search activities by name, destination, region or interest");
            search.title = "Type a keyword to narrow the experience list below.";
        }
        document.querySelectorAll("#my-shortlist .shortlist-card .shortlist-meta").forEach(node => {
            node.textContent = node.textContent.replace(/Dog-friendly/gi, "Pet-friendly");
        });
    }

    function refineMap() {
        const controls = document.querySelector(".map-view-controls");
        if (controls) controls.classList.add("map-controls-refined");
    }

    function refineMyAdventures() {
        const dashboard = document.getElementById("my-adventures-dashboard");
        if (!dashboard) return;

        // Order is handled by page-refinements.js (welcome → dashboard → history)

        const holidayGroup = [...dashboard.querySelectorAll(".adventure-dashboard-group")]
            .find(group => /Holiday Plans/.test(group.querySelector("h3")?.textContent || ""));
        if (holidayGroup) holidayGroup.remove();

        const customGroup = [...dashboard.querySelectorAll(".adventure-dashboard-group")]
            .find(group => /Personal Activities/.test(group.querySelector("h3")?.textContent || ""));
        if (customGroup) customGroup.remove();

        const completedGroup = [...dashboard.querySelectorAll(".adventure-dashboard-group")]
            .find(group => /Experiences I've Completed/.test(group.querySelector("h3")?.textContent || ""));
        if (completedGroup && !completedGroup.querySelector("details.completed-experiences")) {
            const heading = completedGroup.querySelector("h3");
            const cards = [...completedGroup.querySelectorAll(":scope > .adventure-history-card")];
            if (cards.length) {
                const details = document.createElement("details");
                details.className = "completed-experiences";
                const summary = make("summary", "", `${cards.length} completed experience${cards.length === 1 ? "" : "s"} — show list`);
                const list = make("div", "completed-experiences-list");
                list.append(...cards);
                details.append(summary, list);
                heading?.insertAdjacentElement("afterend", details);
            }
        }

        const archiveIds = getArchiveIds();
        const itineraryGroup = [...dashboard.querySelectorAll(".adventure-dashboard-group")]
            .find(group => /Saved Day Itineraries/.test(group.querySelector("h3")?.textContent || ""));
        if (!itineraryGroup) return;

        const itineraries = [...(planner.data.savedItineraries || [])]
            .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        const cards = [...itineraryGroup.querySelectorAll(".adventure-history-card")];
        cards.forEach((card, index) => {
            const itinerary = itineraries[index];
            if (!itinerary) return;
            card.hidden = archiveIds.has(itinerary.id);
            if (card.querySelector(".itinerary-archive-button")) return;
            const actions = card.querySelector(".adventure-history-actions");
            if (!actions) return;
            const button = make("button", "itinerary-archive-button", "Archive itinerary");
            button.type = "button";
            button.addEventListener("click", () => {
                const updated = getArchiveIds();
                updated.add(itinerary.id);
                if (saveArchiveIds(updated)) scheduleRefresh();
            });
            actions.appendChild(button);
        });

        let archiveGroup = dashboard.querySelector(".archived-itineraries-group");
        if (!archiveGroup) {
            archiveGroup = make("section", "adventure-dashboard-group archived-itineraries-group");
            itineraryGroup.insertAdjacentElement("afterend", archiveGroup);
        }
        archiveGroup.replaceChildren(make("h3", "", "Archived Itineraries"));
        const archived = itineraries.filter(item => archiveIds.has(item.id));
        const details = document.createElement("details");
        details.className = "archived-itineraries-details";
        details.appendChild(make("summary", "", `${archived.length} archived itinerary${archived.length === 1 ? "" : "s"} — show archive`));
        const list = make("div", "archived-itineraries-list");
        if (!archived.length) {
            list.appendChild(make("p", "", "Archived itineraries will be kept here for future reference."));
        } else {
            archived.forEach(itinerary => {
                const card = make("article", "adventure-history-card archived-itinerary-card");
                const date = itinerary.date ? new Date(`${itinerary.date}T12:00:00`).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date not recorded";
                card.appendChild(make("h4", "", date));
                const names = (itinerary.activityIds || []).map(id => planner.getActivities().find(activity => activity.id === id)).filter(Boolean).map(activity => activity.name);
                card.appendChild(make("p", "", names.join(" · ") || "No activities recorded"));
                const restore = make("button", "", "Restore to saved itineraries");
                restore.type = "button";
                restore.addEventListener("click", () => {
                    const updated = getArchiveIds();
                    updated.delete(itinerary.id);
                    if (saveArchiveIds(updated)) scheduleRefresh();
                });
                card.appendChild(restore);
                list.appendChild(card);
            });
        }
        details.appendChild(list);
        archiveGroup.appendChild(details);

        const statCards = [...dashboard.querySelectorAll(".adventure-dashboard-stats .dashboard-stat-card")];
        if (statCards[1]) {
            const activeCount = itineraries.filter(item => !archiveIds.has(item.id)).length;
            const value = statCards[1].querySelector(".dashboard-stat-value");
            const label = statCards[1].querySelector(".dashboard-stat-label");
            const detail = statCards[1].querySelector(".dashboard-stat-detail");
            if (value) value.textContent = String(activeCount);
            if (label) label.textContent = "Saved day itineraries";
            if (detail) detail.textContent = "Active plans";
        }
        if (statCards[2]) statCards[2].remove();
    }

    function applyRefinements() {
        refineActivityForm();
        refineCustomEditor();
        if (page === "discover") refineDiscover();
        if (page === "plan-day") {
            refineDayPlanner();
            improveGeneratedNarrative();
            refineMap();
        }
        if (page === "shortlist") refineShortlist();
        if (page === "my-adventures") refineMyAdventures();
    }

    function initialise() {
        applyRefinements();
        document.addEventListener("adventureplanner:datachanged", scheduleRefresh);
        window.addEventListener("pageshow", scheduleRefresh);
        window.addEventListener("focus", scheduleRefresh);

        // The day generator and dashboard render asynchronously in response
        // to their own events. Re-apply only to newly inserted page content.
        const results = document.getElementById("discover-results") || document.getElementById("generated-day-results");
        if (results) {
            const observer = new MutationObserver(() => {
                if (page === "discover") refineDiscover();
                if (page === "plan-day") {
                    improveGeneratedNarrative();
                    refineDayPlanner();
                }
            });
            observer.observe(results, { childList: true, subtree: true });
        }

        document.addEventListener("click", event => {
            if (event.target.closest(".custom-activity-edit-button")) {
                window.setTimeout(refineCustomEditor, 0);
            }
        }, true);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, { once: true });
    } else {
        initialise();
    }
})();
