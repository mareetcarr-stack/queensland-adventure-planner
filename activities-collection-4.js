
"use strict";

/*
 * Adventure Planner — Experience Collection 4
 * Additional Brisbane, Moreton Bay, Sunshine Coast and Gold Coast ideas.
 */

(() => {
    const activities = [
        {
            id: "nudgee-beach-wetlands",
            name: "Nudgee Beach and Wetlands Exploration",
            destination: "Nudgee Beach",
            region: "Brisbane",
            category: ["nature", "birdwatching", "walking", "photography"],
            description: "Explore the coastal environment, mangroves and birdlife around Nudgee Beach. Check local dog-access rules before visiting.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "sandgate-coastal-exploration",
            name: "Sandgate Village and Foreshore",
            destination: "Shorncliffe",
            region: "Brisbane",
            category: ["waterfront", "township", "food", "walking"],
            description: "Explore the historic bayside area around Sandgate and Shorncliffe, with cafés, foreshore scenery and coastal views.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 2.5,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "brisbane-powerhouse-visit",
            name: "Brisbane Powerhouse Visit",
            destination: "New Farm",
            region: "Brisbane",
            category: ["arts", "culture", "architecture", "entertainment"],
            description: "Explore the riverside arts and cultural venue. Look for exhibitions, performances, comedy and special events.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 2.5,
            dogPolicy: "restricted",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "qagoma-cultural-visit",
            name: "QAGOMA Gallery Exploration",
            destination: "South Brisbane",
            region: "Brisbane",
            category: ["arts", "culture", "museums", "indoor"],
            description: "Spend time exploring the Queensland Art Gallery and Gallery of Modern Art, including changing exhibitions and collections.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 3,
            dogPolicy: "restricted",
            indoorOutdoor: "indoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "queensland-museum-visit",
            name: "Queensland Museum and Cultural Precinct",
            destination: "South Brisbane",
            region: "Brisbane",
            category: ["history", "science", "museums", "culture"],
            description: "Explore natural history, science and Queensland stories at the museum. Check current exhibitions and any ticketed displays.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 2.5,
            dogPolicy: "restricted",
            indoorOutdoor: "indoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "brisbane-citycat-ferry",
            name: "Brisbane CityCat River Journey",
            destination: "Brisbane City",
            region: "Brisbane",
            category: ["ferry", "waterfront", "sightseeing", "unique"],
            description: "Take a CityCat journey along the Brisbane River and enjoy a different perspective of the city, bridges and riverside suburbs. Check fares and timetable.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "samford-village-country-day",
            name: "Samford Village Country Escape",
            destination: "Dayboro",
            region: "Moreton Bay Hinterland",
            category: ["township", "food", "countryside", "scenic"],
            description: "Enjoy a relaxed country-style outing around the Samford area, with village stops, local food and surrounding countryside.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "glass-house-mountains-scenic-drive",
            name: "Glass House Mountains Scenic Drive",
            destination: "Beerburrum",
            region: "Sunshine Coast Hinterland",
            category: ["scenic-drive", "lookout", "photography", "nature"],
            description: "Take a scenic drive through the Glass House Mountains area, stopping at suitable public viewpoints and picnic locations. Check access and track conditions.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "yandina-ginger-factory",
            name: "The Ginger Factory",
            destination: "Woombye",
            region: "Sunshine Coast",
            category: ["food", "attraction", "shopping", "local-produce"],
            description: "Explore the Ginger Factory, its gardens, food outlets and attractions. Check current admission arrangements and opening times.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 2.5,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "coolum-beach-coastal-day",
            name: "Coolum Beach and Coastal Exploration",
            destination: "Mooloolaba",
            region: "Sunshine Coast",
            category: ["beach", "walking", "scenic", "relaxation"],
            description: "Enjoy a coastal outing around Coolum, with beach time, a village stop and ocean views. Check beach access rules for dogs.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "peregian-beach-village",
            name: "Peregian Beach Village and Foreshore",
            destination: "Noosa",
            region: "Sunshine Coast",
            category: ["beach", "township", "food", "shopping"],
            description: "Explore the village square, independent shops and cafés, then enjoy the coastal atmosphere around Peregian Beach.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 2.5,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "point-danger-lookout",
            name: "Point Danger Lighthouse and Lookout",
            destination: "Burleigh Heads",
            region: "Gold Coast",
            category: ["lookout", "lighthouse", "scenic", "photography"],
            description: "Visit the headland lookout on the Queensland–New South Wales border for coastal views and whale-watching opportunities in season.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "currumbin-rock-pools",
            name: "Currumbin Rock Pools Outing",
            destination: "Burleigh Heads",
            region: "Gold Coast",
            category: ["swimming", "nature", "picnic", "water"],
            description: "Enjoy a freshwater swimming and picnic outing in the Currumbin Valley. Check water conditions, parking and local access rules.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "tallebudgera-creek-day",
            name: "Tallebudgera Creek Picnic and Swim",
            destination: "Burleigh Heads",
            region: "Gold Coast",
            category: ["swimming", "picnic", "waterfront", "relaxation"],
            description: "Spend a relaxed day beside the clear waters of Tallebudgera Creek. Check swimming conditions and dog access at the chosen section.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "burleigh-sunset-picnic",
            name: "Burleigh Heads Sunset Picnic",
            destination: "Burleigh Heads",
            region: "Gold Coast",
            category: ["sunset", "picnic", "scenic", "photography"],
            description: "Pack dinner and enjoy the evening light over the coastline from a suitable public picnic area outside restricted parkland.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 1.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "tamborine-mountain-scenic-drive",
            name: "Tamborine Mountain Scenic Drive",
            destination: "Tamborine Mountain",
            region: "Gold Coast Hinterland",
            category: ["scenic-drive", "lookout", "nature", "photography"],
            description: "Explore the mountain roads, countryside views and accessible public lookouts. Check park boundaries before taking dogs on walking tracks.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 3,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: true,
            status: "not-visited"
        },
        {
            id: "mooloolaba-seafood-waterfront",
            name: "Mooloolaba Waterfront Dining",
            destination: "Mooloolaba",
            region: "Sunshine Coast",
            category: ["food", "waterfront", "dining"],
            description: "Make an evening of the waterfront dining precinct. Choose a restaurant and check menus, prices and booking requirements.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "noosa-river-ferry",
            name: "Noosa River Ferry Experience",
            destination: "Noosa",
            region: "Sunshine Coast",
            category: ["ferry", "waterfront", "sightseeing", "relaxation"],
            description: "Enjoy a scenic ferry trip along the Noosa River, with the option to explore different stops along the way. Check current timetable and fares.",
            cost: "paid",
            estimatedCost: null,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "kenilworth-country-drive",
            name: "Kenilworth Countryside Drive",
            destination: "Kenilworth",
            region: "Sunshine Coast Hinterland",
            category: ["scenic-drive", "countryside", "photography", "relaxation"],
            description: "Explore the rural scenery around Kenilworth, with optional stops in the village for local produce and refreshments.",
            cost: "free",
            estimatedCost: 0,
            durationHours: 2.5,
            dogPolicy: "verify",
            indoorOutdoor: "outdoor",
            overnightSuitable: false,
            status: "not-visited"
        },
        {
            id: "redcliffe-waterfront-dinner",
            name: "Redcliffe Waterfront Evening",
            destination: "Redcliffe",
            region: "Moreton Bay",
            category: ["dining", "waterfront", "sunset", "relaxation"],
            description: "Enjoy an evening along the Redcliffe waterfront, with the option of dinner or a casual takeaway picnic overlooking the bay.",
            cost: "variable",
            estimatedCost: null,
            durationHours: 2,
            dogPolicy: "verify",
            indoorOutdoor: "mixed",
            overnightSuitable: false,
            status: "not-visited"
        }
    ];

    const existingIds = new Set(
        (window.ADVENTURE_ACTIVITIES || []).map(activity => activity.id)
    );

    const additions = activities.filter(
        activity => !existingIds.has(activity.id)
    );

    window.ADVENTURE_ACTIVITIES = [
        ...(window.ADVENTURE_ACTIVITIES || []),
        ...additions
    ];

    console.log(`${additions.length} new experiences loaded.`);
})();
