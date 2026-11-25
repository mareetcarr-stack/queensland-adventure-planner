
"use strict";

/*
 * Adventure Planner
 * Activity management, browser and completion tracking
 */

const AdventurePlanner = (() => {

    const CONFIG = {
        appName: "Adventure Planner",
        homeLocation: "Clontarf, Queensland",
        storageKey: "adventurePlannerData"
    };

    const DEFAULT_DATA = {
        activities: [],
        completedActivities: [],
        savedItineraries: [],
        preferences: {
            maximumDriveHours: 2,
            budget: "any",
            dogPreference: "any",
            accommodation: "return-home"
        }
    };

    function loadData() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);

            if (stored) {
                const parsed = JSON.parse(stored);

                return {
                    ...DEFAULT_DATA,
                    ...parsed,
                    preferences: {
                        ...DEFAULT_DATA.preferences,
                        ...(parsed.preferences || {})
                    }
                };
            }
        } catch (error) {
            console.error("Unable to load saved data:", error);
        }

        return structuredClone(DEFAULT_DATA);
    }

    const data = loadData();

    function saveData() {
        try {
            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(data)
            );
            return true;
        } catch (error) {
            console.error("Unable to save data:", error);
            return false;
        }
    }

    function getActivities() {
        const original = window.ADVENTURE_ACTIVITIES || [];
        const custom = data.activities || [];

        return [
            ...original,
            ...custom
        ];
    }

    function isCompleted(activityId) {
        return data.completedActivities.includes(activityId);
    }

    function toggleCompleted(activityId) {
        if (isCompleted(activityId)) {
            data.completedActivities =
                data.completedActivities.filter(id => id !== activityId);
        } else {
            data.completedActivities.push(activityId);
        }

        saveData();
    }

    function addActivity(activity) {
        const id = `custom-${Date.now()}`;

        const newActivity = {
            ...activity,
            id,
            status: "not-visited",
            custom: true
        };

        data.activities.push(newActivity);

        if (saveData()) {
            return newActivity;
        }

        data.activities.pop();
        return null;
    }

    return {
        config: CONFIG,
        data,
        saveData,
        getActivities,
        isCompleted,
        toggleCompleted,
        addActivity
    };

})();


/*
 * Add activity form
 */

function createAddActivityForm() {

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "add-activity";

    const heading = document.createElement("h2");
    heading.textContent = "Add an Adventure";

    const introduction = document.createElement("p");
    introduction.textContent =
        "Add your own discoveries and experiences to your personal database.";

    const form = document.createElement("form");
    form.className = "activity-form";

    function createInput(labelText, name, type = "text", required = true) {

        const wrapper = document.createElement("label");
        wrapper.className = "form-field";

        const label = document.createElement("span");
        label.textContent = labelText;

        const input = document.createElement("input");
        input.type = type;
        input.name = name;
        input.required = required;

        if (type === "number") {
            input.min = "0";
        }

        wrapper.append(label, input);
        form.appendChild(wrapper);

        return input;
    }

    function createSelect(labelText, name, options) {

        const wrapper = document.createElement("label");
        wrapper.className = "form-field";

        const label = document.createElement("span");
        label.textContent = labelText;

        const select = document.createElement("select");
        select.name = name;
        select.required = true;

        options.forEach(option => {
            const element = document.createElement("option");
            element.value = option.value;
            element.textContent = option.label;
            select.appendChild(element);
        });

        wrapper.append(label, select);
        form.appendChild(wrapper);

        return select;
    }

    createInput("Activity name", "name");
    createInput("Destination", "destination");
    createInput("Region", "region");

    const description = document.createElement("textarea");
    description.name = "description";
    description.placeholder = "Describe the experience...";
    description.required = true;

    const descriptionWrapper = document.createElement("label");
    descriptionWrapper.className = "form-field";

    const descriptionLabel = document.createElement("span");
    descriptionLabel.textContent = "Description";

    descriptionWrapper.append(descriptionLabel, description);
    form.appendChild(descriptionWrapper);

    const categoryInput = createInput(
        "Categories (comma separated)",
        "category"
    );

    createSelect("Cost", "cost", [
        { value: "free", label: "Free" },
        { value: "under25", label: "Under $25" },
        { value: "under50", label: "Under $50" },
        { value: "under100", label: "Under $100" },
        { value: "variable", label: "Variable / unknown" }
    ]);

    createInput("Estimated cost per person ($)", "estimatedCost", "number", false);
    createInput("Duration (hours)", "durationHours", "number");

    createSelect("Dog access", "dogPolicy", [
        { value: "friendly", label: "Dog-friendly" },
        { value: "verify", label: "Needs verification" },
        { value: "restricted", label: "Dogs not permitted" }
    ]);

    createSelect("Indoor or outdoor", "indoorOutdoor", [
        { value: "outdoor", label: "Outdoor" },
        { value: "indoor", label: "Indoor" },
        { value: "mixed", label: "Both" }
    ]);

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Add to My Adventures";
    submit.className = "add-activity-button";

    const message = document.createElement("p");
    message.id = "add-activity-message";

    form.append(submit, message);

    form.addEventListener("submit", event => {

        event.preventDefault();

        const formData = new FormData(form);

        const estimatedCostValue = formData.get("estimatedCost");

        const activity = {
            name: formData.get("name").trim(),
            destination: formData.get("destination").trim(),
            region: formData.get("region").trim(),
            description: formData.get("description").trim(),
            category: categoryInput.value
                .split(",")
                .map(value => value.trim().toLowerCase().replaceAll(" ", "-"))
                .filter(Boolean),
            cost: formData.get("cost"),
            estimatedCost: estimatedCostValue === ""
                ? null
                : Number(estimatedCostValue),
            durationHours: Number(formData.get("durationHours")),
            dogPolicy: formData.get("dogPolicy"),
            indoorOutdoor: formData.get("indoorOutdoor"),
            overnightSuitable: false
        };

        if (
            !activity.name ||
            !activity.destination ||
            !activity.region ||
            !activity.description ||
            !activity.category.length ||
            !Number.isFinite(activity.durationHours) ||
            activity.durationHours <= 0 ||
            (
                activity.estimatedCost !== null &&
                (
                    !Number.isFinite(activity.estimatedCost) ||
                    activity.estimatedCost < 0
                )
            )
        ) {
            message.textContent = "Please check all required fields.";
            return;
        }

        const added = AdventurePlanner.addActivity(activity);

        if (added) {
            message.textContent =
                `${added.name} has been added successfully.`;

            form.reset();

            renderActivityBrowser();
        } else {
            message.textContent =
                "Unable to save this activity. Check your browser storage.";
        }
    });

    section.append(heading, introduction, form);

    document.querySelector("main").appendChild(section);
}


/*
 * Activity browser and filters
 */

function renderActivityBrowser() {

    const existing = document.getElementById("activity-browser");

    if (existing) {
        existing.remove();
    }

    const activities = AdventurePlanner.getActivities();

    const section = document.createElement("section");
    section.className = "feature";
    section.id = "activity-browser";

    const heading = document.createElement("h2");
    heading.textContent = "Discover Adventures";

    const introduction = document.createElement("p");
    introduction.textContent =
        "Find experiences that match your interests and preferences.";

    const search = document.createElement("input");
    search.type = "search";
    search.id = "activity-search";
    search.placeholder = "Search activities or destinations...";

    const filters = document.createElement("div");
    filters.className = "activity-filters";

    function createFilter(labelText, options, name) {

        const wrapper = document.createElement("label");
        wrapper.className = "filter-field";

        const label = document.createElement("span");
        label.textContent = labelText;

        const select = document.createElement("select");
        select.id = `filter-${name}`;

        options.forEach(option => {
            const element = document.createElement("option");
            element.value = option.value;
            element.textContent = option.label;
            select.appendChild(element);
        });

        wrapper.append(label, select);
        filters.appendChild(wrapper);

        select.addEventListener("change", renderActivities);

        return select;
    }

    const regions = [...new Set(activities.map(a => a.region))].sort();

    const regionFilter = createFilter(
        "Region",
        [
            { value: "all", label: "All regions" },
            ...regions.map(region => ({
                value: region,
                label: region
            }))
        ],
        "region"
    );

    const categories = [...new Set(
        activities.flatMap(a => a.category || [])
    )].sort();

    const categoryFilter = createFilter(
        "Category",
        [
            { value: "all", label: "All categories" },
            ...categories.map(category => ({
                value: category,
                label: category.replaceAll("-", " ")
            }))
        ],
        "category"
    );

    const budgetFilter = createFilter(
        "Budget",
        [
            { value: "any", label: "Any budget" },
            { value: "0", label: "Free" },
            { value: "25", label: "Under $25" },
            { value: "50", label: "Under $50" },
            { value: "100", label: "Under $100" }
        ],
        "budget"
    );

    const durationFilter = createFilter(
        "Duration",
        [
            { value: "any", label: "Any duration" },
            { value: "2", label: "Up to 2 hours" },
            { value: "4", label: "Up to 4 hours" },
            { value: "8", label: "Up to 8 hours" }
        ],
        "duration"
    );

    const dogFilter = createFilter(
        "Dog preference",
        [
            { value: "any", label: "No preference" },
            { value: "friendly", label: "Dog-friendly only" },
            { value: "verify", label: "Needs verification" },
            { value: "restricted", label: "No dogs" }
        ],
        "dog"
    );

    const completionFilter = createFilter(
        "Completion status",
        [
            { value: "all", label: "All activities" },
            { value: "incomplete", label: "Not yet completed" },
            { value: "complete", label: "Completed" }
        ],
        "completion"
    );

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Clear filters";
    resetButton.className = "reset-filters";

    const count = document.createElement("p");
    count.id = "activity-count";

    const progress = document.createElement("p");
    progress.id = "activity-progress";

    const results = document.createElement("div");
    results.id = "activity-results";

    section.append(
        heading,
        introduction,
        search,
        filters,
        resetButton,
        count,
        progress,
        results
    );

    document.querySelector("main").appendChild(section);

    function renderActivities() {

        results.replaceChildren();

        const term = search.value.trim().toLowerCase();

        const selectedRegion = regionFilter.value;
        const selectedCategory = categoryFilter.value;
        const selectedBudget = budgetFilter.value;
        const selectedDuration = durationFilter.value;
        const selectedDog = dogFilter.value;
        const selectedCompletion = completionFilter.value;

        const completedCount = activities.filter(
            activity => AdventurePlanner.isCompleted(activity.id)
        ).length;

        progress.textContent =
            `Your progress: ${completedCount} of ${activities.length} experiences completed`;

        const filtered = activities.filter(activity => {

            const searchableText = [
                activity.name,
                activity.destination,
                activity.region,
                activity.description,
                ...(activity.category || [])
            ].join(" ").toLowerCase();

            if (term && !searchableText.includes(term)) return false;

            if (
                selectedRegion !== "all" &&
                activity.region !== selectedRegion
            ) return false;

            if (
                selectedCategory !== "all" &&
                !(activity.category || []).includes(selectedCategory)
            ) return false;

            if (selectedBudget !== "any") {

                if (
                    activity.estimatedCost === null ||
                    activity.estimatedCost === undefined
                ) return false;

                const limit = Number(selectedBudget);

                if (limit === 0 && activity.estimatedCost !== 0) return false;
                if (limit > 0 && activity.estimatedCost >= limit) return false;
            }

            if (
                selectedDuration !== "any" &&
                activity.durationHours > Number(selectedDuration)
            ) return false;

            if (
                selectedDog !== "any" &&
                activity.dogPolicy !== selectedDog
            ) return false;

            const completed = AdventurePlanner.isCompleted(activity.id);

            if (selectedCompletion === "complete" && !completed) return false;
            if (selectedCompletion === "incomplete" && completed) return false;

            return true;
        });

        count.textContent =
            `Showing ${filtered.length} of ${activities.length} experiences`;

        if (filtered.length === 0) {
            const empty = document.createElement("p");
            empty.textContent =
                "No matching activities. Try changing your filters.";
            results.appendChild(empty);
            return;
        }

        filtered.forEach(activity => {

            const completed = AdventurePlanner.isCompleted(activity.id);

            const card = document.createElement("article");
            card.className = "activity-card";

            const name = document.createElement("h3");
            name.textContent = activity.name;

            const destination = document.createElement("p");
            destination.textContent =
                `${activity.destination} · ${activity.region}`;

            const description = document.createElement("p");
            description.textContent = activity.description;

            const cost = document.createElement("p");
            cost.textContent =
                activity.estimatedCost === null ||
                activity.estimatedCost === undefined
                    ? "Cost: To be confirmed"
                    : activity.estimatedCost === 0
                        ? "Cost: Free"
                        : `Estimated cost: $${activity.estimatedCost}`;

            const duration = document.createElement("p");
            duration.textContent =
                `Duration: ${activity.durationHours} hours`;

            const dogLabels = {
                friendly: "Dog-friendly",
                verify: "Dog access needs verification",
                restricted: "Dogs not permitted"
            };

            const dog = document.createElement("p");
            dog.textContent =
                dogLabels[activity.dogPolicy] || "Dog policy unknown";

            const status = document.createElement("p");
            status.textContent = completed
                ? "✓ Experience completed"
                : "Not yet completed";

            const completeButton = document.createElement("button");
            completeButton.type = "button";
            completeButton.className = "reset-filters";
            completeButton.textContent = completed
                ? "Mark as not completed"
                : "Mark as completed";

            completeButton.addEventListener("click", () => {
                AdventurePlanner.toggleCompleted(activity.id);
                renderActivityBrowser();
            });

            card.append(
                name,
                destination,
                description,
                cost,
                duration,
                dog,
                status,
                completeButton
            );

            results.appendChild(card);
        });
    }

    search.addEventListener("input", renderActivities);

    resetButton.addEventListener("click", () => {
        search.value = "";
        regionFilter.value = "all";
        categoryFilter.value = "all";
        budgetFilter.value = "any";
        durationFilter.value = "any";
        dogFilter.value = "any";
        completionFilter.value = "all";

        renderActivities();
    });

    renderActivities();
}


/*
 * Initialise application
 */

document.addEventListener("DOMContentLoaded", () => {

    console.log(
        `${AdventurePlanner.config.appName} initialised successfully.`
    );

    renderActivityBrowser();
    createAddActivityForm();

});
