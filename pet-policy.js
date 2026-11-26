
"use strict";

/*
 * Adventure Planner — Pet Access Policy
 * Applies a consistent petFriendly boolean to every activity.
 * Specific activity exceptions take precedence over general rules.
 */

(() => {
    const activities = window.ADVENTURE_ACTIVITIES || [];

    const exceptions = {
        "redcliffe-botanic-gardens": true,
        "woody-point-jetty": true,
        "bribie-island-exploration": true,
        "nudgee-beach-wetlands": true,
        "brisbane-powerhouse-visit": false,
        "qagoma-cultural-visit": false,
        "queensland-museum-visit": false,
        "husk-distillers-visit": true,
        "nightcap-national-park": false
    };

    const restrictedPatterns =
        /\b(national park|national parks|wildlife sanctuary|zoo|museum|gallery|art gallery|indoor attraction|aquarium)\b/i;

    const publicOutdoorPatterns =
        /\b(park|beach|foreshore|waterfront|jetty|lookout|picnic|coastal walk|scenic drive|village|township|gardens|river walk|marina|headland)\b/i;

    activities.forEach(activity => {
        const searchable = [
            activity.name,
            activity.destination,
            activity.description,
            ...(activity.category || [])
        ].join(" ");

        let petFriendly;

        if (Object.prototype.hasOwnProperty.call(exceptions, activity.id)) {
            petFriendly = exceptions[activity.id];
        } else if (restrictedPatterns.test(searchable)) {
            petFriendly = false;
        } else if (activity.dogPolicy === "restricted") {
            petFriendly = false;
        } else if (activity.dogPolicy === "friendly") {
            petFriendly = true;
        } else {
            petFriendly = publicOutdoorPatterns.test(searchable) &&
                activity.indoorOutdoor !== "indoor";
        }

        activity.petFriendly = petFriendly;
        activity.dogPolicy = petFriendly ? "friendly" : "restricted";
    });

    console.log("Pet access classifications applied.");
})();
