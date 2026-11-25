
"use strict";

/*
 * Corrected activity details.
 * Loaded after all activity libraries and before app.js.
 */

(() => {
    const activities = window.ADVENTURE_ACTIVITIES || [];

    const husk = activities.find(
        activity => activity.id === "husk-distillers-visit"
    );

    if (husk) {
        husk.destination = "North Tumbulgum";
        husk.dogPolicy = "friendly";
        husk.description =
            "Visit Husk Farm Distillery, a working sugarcane and cattle farm with a cellar door, outdoor lawn, restaurant and guided farm-to-bottle tours. Dogs are welcome at designated tables but must be booked in advance, kept on a short leash and well behaved.";
        husk.durationHours = 3;
    }

    console.log("Adventure activity corrections applied.");
})();
