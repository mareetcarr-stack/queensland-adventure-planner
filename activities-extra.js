
"use strict";

/*
 * Additional Adventure Planner experiences
 * Loaded after activities.js and before app.js.
 */

(() => {
    const additionalActivities = [
        {
            id: "eat-street-northshore",
            name: "Eat Street Northshore",
            destination: "Hamilton",
            region: "Brisbane",
            category: ["markets", "food", "nightlife", "unique"],
            description: "Explore the waterfront dining and entertainment precinct, with international street food, bars and live entertainment. Check opening days and admission arrangements.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "goboat-brisbane",
            name: "GoBoat Brisbane River",
            destination: "Brisbane City",
            region: "Brisbane",
            category: ["boating", "waterfront", "adventure", "unique"],
            description: "Hire a self-drive picnic boat and explore the Brisbane River. Booking and hire fees apply.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "harbour-town-shopping",
            name: "Harbour Town Premium Outlets",
            destination: "Biggera Waters",
            region: "Gold Coast",
            category: ["shopping", "food", "township"],
            description: "Browse the outlet shops, cafés and dining options at the Gold Coast's outlet shopping precinct.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "australia-zoo",
            name: "Australia Zoo",
            destination: "Beerwah",
            region: "Sunshine Coast",
            category: ["wildlife", "animals", "attraction", "family"],
            description: "Spend a day exploring the wildlife park and its animal exhibits and presentations. Check admission prices and daily programme.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 6,
            dogPolicy: "restricted",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "outback-spectacular",
            name: "Australian Outback Spectacular",
            destination: "Oxenford",
            region: "Gold Coast",
            category: ["show", "entertainment", "food", "unique"],
            description: "Experience the Australian-themed live arena show with dinner. Check current show dates and ticket packages.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 3,
            dogPolicy: "restricted",
            indoorOutdoor: "indoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "mt-coot-tha-lookout",
            name: "Mount Coot-tha Summit Lookout",
            destination: "Mount Coot-tha",
            region: "Brisbane",
            category: ["scenic", "lookout", "photography", "sunset"],
            description: "Enjoy panoramic views across Brisbane from the summit lookout. A good option for a scenic drive or sunset outing.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "sunshine-sons-distillery",
            name: "Sunshine & Sons Distillery",
            destination: "Woombye",
            region: "Sunshine Coast",
            category: ["distillery", "food", "drinks", "countryside"],
            description: "Visit the Sunshine Coast distillery for a tasting or tour. Check current bookings, opening hours and tasting options.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "margate-waterfront",
            name: "Margate Waterfront Walk",
            destination: "Margate",
            region: "Moreton Bay",
            category: ["waterfront", "walking", "picnic", "scenic"],
            description: "Enjoy a relaxed walk along the Margate foreshore, with bay views and places to stop for a picnic.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        }
    ];

    if (typeof window !== "undefined") {
        window.ADVENTURE_ACTIVITIES = [
            ...(window.ADVENTURE_ACTIVITIES || []),
            ...additionalActivities
        ];
    }

    console.log(
        `${additionalActivities.length} additional adventure activities loaded.`
    );
})();

