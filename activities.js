
"use strict";

/*
 * Adventure Planner
 * Activity database
 *
 * Each experience is stored separately.
 * A destination can contain multiple experiences.
 */

const ADVENTURE_ACTIVITIES = [

    {
        id: "redcliffe-botanic-gardens",
        name: "Redcliffe Botanic Gardens",
        destination: "Redcliffe",
        region: "Moreton Bay",
        category: ["gardens", "picnic", "nature"],
        description: "Explore the gardens and enjoy a relaxed picnic.",
        cost: "free",
        durationHours: 2,
        dogPolicy: "verify",
        indoorOutdoor: "outdoor",
        overnightSuitable: false,
        status: "not-visited"
    },

    {
        id: "woody-point-jetty",
        name: "Woody Point Jetty",
        destination: "Woody Point",
        region: "Moreton Bay",
        category: ["waterfront", "scenic", "walking"],
        description: "Enjoy waterfront views and a relaxed walk.",
        cost: "free",
        durationHours: 1,
        dogPolicy: "verify",
        indoorOutdoor: "outdoor",
        overnightSuitable: false,
        status: "not-visited"
    },

    {
        id: "bribie-island-exploration",
        name: "Explore Bribie Island",
        destination: "Bribie Island",
        region: "Sunshine Coast",
        category: ["island", "beach", "nature", "scenic"],
        description: "Discover beaches, waterfront areas and island scenery.",
        cost: "free",
        durationHours: 5,
        dogPolicy: "verify",
        indoorOutdoor: "outdoor",
        overnightSuitable: true,
        status: "not-visited"
    },

    {
        id: "maleny-township",
        name: "Explore Maleny",
        destination: "Maleny",
        region: "Sunshine Coast Hinterland",
        category: ["township", "shopping", "food", "scenic"],
        description: "Explore the hinterland township, shops and local food.",
        cost: "variable",
        durationHours: 3,
        dogPolicy: "verify",
        indoorOutdoor: "mixed",
        overnightSuitable: true,
        status: "not-visited"
    },

    {
        id: "noosa-river-picnic",
        name: "Noosa River Picnic",
        destination: "Noosa",
        region: "Sunshine Coast",
        category: ["picnic", "waterfront", "relaxation"],
        description: "Enjoy a picnic beside the Noosa River.",
        cost: "free",
        durationHours: 2,
        dogPolicy: "verify",
        indoorOutdoor: "outdoor",
        overnightSuitable: false,
        status: "not-visited"
    },

    {
        id: "noosa-hastings-street",
        name: "Explore Hastings Street",
        destination: "Noosa",
        region: "Sunshine Coast",
        category: ["shopping", "food", "township"],
        description: "Browse boutiques, cafés and restaurants.",
        cost: "variable",
        durationHours: 2,
        dogPolicy: "verify",
        indoorOutdoor: "mixed",
        overnightSuitable: false,
        status: "not-visited"
    },

    {
        id: "kenilworth-cheese",
        name: "Kenilworth Cheese Experience",
        destination: "Kenilworth",
        region: "Sunshine Coast Hinterland",
        category: ["food", "farm", "local-produce"],
        description: "Discover local cheese and dairy products.",
        cost: "variable",
        durationHours: 2,
        dogPolicy: "verify",
        indoorOutdoor: "mixed",
        overnightSuitable: false,
        status: "not-visited"
    },

    {
        id: "big-pineapple",
        name: "Visit the Big Pineapple",
        destination: "Woombye",
        region: "Sunshine Coast",
        category: ["attraction", "photography", "food"],
        description: "Visit the iconic Big Pineapple site and explore its attractions.",
        cost: "variable",
        durationHours: 2,
        dogPolicy: "verify",
        indoorOutdoor: "mixed",
        overnightSuitable: false,
        status: "not-visited"
    }

];

if (typeof window !== "undefined") {
    window.ADVENTURE_ACTIVITIES = ADVENTURE_ACTIVITIES;
}
