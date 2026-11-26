
"use strict";

/*
 * Adventure Planner — Destination Corrections
 * Corrects destination groupings and adds missing map coordinates.
 */

(() => {
    const activities = window.ADVENTURE_ACTIVITIES || [];

    const corrections = {
        "coolum-beach-coastal-day": {
            destination: "Coolum Beach",
            description: "Enjoy a coastal outing around Coolum Beach, with beach time, a village stop and ocean views. Check beach access rules for dogs."
        },
        "peregian-beach-village": {
            destination: "Peregian Beach"
        },
        "point-danger-lookout": {
            destination: "Point Danger"
        },
        "currumbin-rock-pools": {
            destination: "Currumbin Valley"
        },
        "tallebudgera-creek-day": {
            destination: "Tallebudgera Creek"
        },
        "burleigh-sunset-picnic": {
            destination: "Burleigh Heads"
        },
        "samford-village-country-day": {
            destination: "Samford"
        },
        "coolum-beach-coastal-day": {
            destination: "Coolum Beach"
        },
        "mooloolaba-seafood-waterfront": {
            destination: "Mooloolaba"
        },
        "noosa-river-ferry": {
            destination: "Noosa"
        }
    };

    activities.forEach(activity => {
        const correction = corrections[activity.id];
        if (!correction) return;

        Object.assign(activity, correction);
    });

    console.log("Adventure destination corrections applied.");
})();
