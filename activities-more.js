
"use strict";

/*
 * Adventure Planner — Additional Experience Library
 * Loaded after activities-extra.js and before app.js.
 */

(() => {
    const activities = [
        {
            id: "scarborough-marina-sunset",
            name: "Scarborough Marina Sunset",
            destination: "Scarborough",
            region: "Moreton Bay",
            category: ["waterfront", "sunset", "photography", "relaxation"],
            description: "Enjoy an evening beside the marina, watch the boats and find a spot to enjoy the sunset over the bay.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "redcliffe-heritage-walk",
            name: "Redcliffe Heritage and Waterfront Walk",
            destination: "Redcliffe",
            region: "Moreton Bay",
            category: ["walking", "history", "waterfront", "photography"],
            description: "Combine the foreshore with Redcliffe's historic streets and landmarks for a relaxed self-guided exploration.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "redcliffe-sunset-picnic",
            name: "Redcliffe Sunset Picnic",
            destination: "Redcliffe",
            region: "Moreton Bay",
            category: ["picnic", "sunset", "waterfront", "relaxation"],
            description: "Pack dinner and enjoy an unhurried picnic beside the water as the sun goes down over Moreton Bay.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "bribie-pumicestone-passage",
            name: "Pumicestone Passage Waterfront",
            destination: "Bribie Island",
            region: "Moreton Bay",
            category: ["waterfront", "nature", "photography", "relaxation"],
            description: "Explore the calm-water scenery along Pumicestone Passage, with opportunities for birdwatching and a picnic.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "bribie-bongaree-foreshore",
            name: "Bongaree Foreshore and Jetty",
            destination: "Bribie Island",
            region: "Moreton Bay",
            category: ["waterfront", "walking", "picnic", "photography"],
            description: "Enjoy the foreshore, jetty and views across the passage in Bribie's relaxed bayside township.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "noosa-national-park-lookouts",
            name: "Noosa Coastal Lookouts",
            destination: "Noosa",
            region: "Sunshine Coast",
            category: ["scenic", "lookout", "photography", "walking", "nature"],
            description: "Explore the coastal scenery and viewpoints around Noosa. Some walking tracks pass through national park areas where dogs are not permitted.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2.5,
            dogPolicy: "restricted",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "noosa-main-beach-evening",
            name: "Noosa Main Beach Evening",
            destination: "Noosa",
            region: "Sunshine Coast",
            category: ["beach", "sunset", "walking", "relaxation"],
            description: "Spend the late afternoon on the beachfront, enjoy the coastal atmosphere and watch the changing light over the water.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "maleny-glasshouse-views",
            name: "Maleny Hinterland Viewpoints",
            destination: "Maleny",
            region: "Sunshine Coast Hinterland",
            category: ["scenic", "photography", "scenic-drive", "nature"],
            description: "Explore the countryside around Maleny and stop at suitable public viewpoints for views towards the Glass House Mountains.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "maleny-botanic-gardens",
            name: "Maleny Botanic Gardens and Bird World",
            destination: "Maleny",
            region: "Sunshine Coast Hinterland",
            category: ["gardens", "wildlife", "photography", "attraction"],
            description: "Explore the landscaped gardens and mountain views. Admission applies; check current animal encounter options and visitor conditions.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 3,
            dogPolicy: "restricted",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "kenilworth-country-bakery",
            name: "Kenilworth Country Bakery Visit",
            destination: "Kenilworth",
            region: "Sunshine Coast Hinterland",
            category: ["food", "township", "local-produce"],
            description: "Visit the well-known country bakery and browse the village. Allow time to enjoy the local food and shops.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "wellington-point-picnic",
            name: "Wellington Point Waterfront Picnic",
            destination: "Wellington Point",
            region: "Redlands",
            category: ["picnic", "waterfront", "relaxation", "scenic"],
            description: "Take a picnic to the waterfront reserve and enjoy views across Moreton Bay. Check tide conditions if walking towards King Island.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "cleveland-raby-bay-walk",
            name: "Raby Bay Marina and Foreshore",
            destination: "Cleveland",
            region: "Redlands",
            category: ["waterfront", "walking", "food", "photography"],
            description: "Wander around the marina and foreshore, enjoy the boats and consider stopping at a waterfront café.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "wynnum-esplanade-evening",
            name: "Wynnum Esplanade Evening Walk",
            destination: "Wynnum",
            region: "Brisbane",
            category: ["waterfront", "walking", "sunset", "relaxation"],
            description: "Enjoy a relaxed bayside walk along the esplanade and take in the changing colours over Moreton Bay.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "brisbane-city-riverwalk",
            name: "Brisbane River and City Centre Walk",
            destination: "Brisbane City",
            region: "Brisbane",
            category: ["walking", "waterfront", "photography", "culture"],
            description: "Explore the central riverfront, bridges and city streets on a self-guided walk. Choose your own distance and stopping points.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "mount-coot-tha-sunset",
            name: "Mount Coot-tha Sunset and City Views",
            destination: "Mount Coot-tha",
            region: "Brisbane",
            category: ["sunset", "lookout", "photography", "scenic"],
            description: "Visit the summit lookout in the late afternoon and watch the city lights appear after sunset.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "mooloolaba-spit-sunset",
            name: "Mooloolaba Spit Sunset",
            destination: "Mooloolaba",
            region: "Sunshine Coast",
            category: ["sunset", "beach", "waterfront", "photography"],
            description: "Enjoy the coastal atmosphere around the Spit and find a spot to watch the evening light over the water.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "caloundra-kings-beach",
            name: "Kings Beach and Caloundra Foreshore",
            destination: "Caloundra",
            region: "Sunshine Coast",
            category: ["beach", "waterfront", "walking", "picnic"],
            description: "Explore the Kings Beach area and nearby coastal foreshore, with ocean views and places to stop for a break.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "eumundi-village-exploration",
            name: "Eumundi Village Beyond the Markets",
            destination: "Eumundi",
            region: "Sunshine Coast Hinterland",
            category: ["township", "heritage", "food", "shopping"],
            description: "Explore the village streets, local shops and cafés outside market browsing hours.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "dayboro-country-picnic",
            name: "Dayboro Countryside Picnic",
            destination: "Dayboro",
            region: "Moreton Bay Hinterland",
            category: ["picnic", "countryside", "scenic", "relaxation"],
            description: "Make a relaxed country outing of Dayboro, with a picnic and time to explore the surrounding village and countryside.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "wivenhoe-dam-scenic-drive",
            name: "Wivenhoe Dam Scenic Drive and Lookouts",
            destination: "Wivenhoe Dam",
            region: "Brisbane Hinterland",
            category: ["scenic-drive", "photography", "nature", "lookout"],
            description: "Explore the dam surrounds by car and stop at publicly accessible viewpoints. Check access restrictions before travelling.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        }
    ];

    const existing = new Set(
        (window.ADVENTURE_ACTIVITIES || []).map(activity => activity.id)
    );

    const newActivities = activities.filter(
        activity => !existing.has(activity.id)
    );

    window.ADVENTURE_ACTIVITIES = [
        ...(window.ADVENTURE_ACTIVITIES || []),
        ...newActivities
    ];

    console.log(
        `${newActivities.length} additional experiences loaded.`
    );
})();
