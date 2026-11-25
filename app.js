"use strict";

/*
 * Adventure Planner
 * Main application script
 *
 * This file will eventually manage:
 * - Activity discovery
 * - AI-generated recommendations
 * - Day trip itineraries
 * - Multi-week holiday planning
 * - Completed activity tracking
 * - Saved itineraries
 * - User preferences
 */

const AdventurePlanner = (() => {

    const CONFIG = {
        appName: "Adventure Planner",
        homeLocation: "Clontarf, Queensland",
        storageKey: "adventurePlannerData",
        defaultRegion: "South-East Queensland and Northern NSW"
    };

    const DEFAULT_DATA = {
        activities: [],
        completedActivities: [],
        savedItineraries: [],
        preferences: {
            maximumDriveHours: 2,
            budget: "any",
            dogPreference: "prefer",
            accommodation: "return-home"
        }
    };

    function loadData() {
        try {
            const storedData = localStorage.getItem(CONFIG.storageKey);

            if (storedData) {
                return {
                    ...DEFAULT_DATA,
                    ...JSON.parse(storedData)
                };
            }
        } catch (error) {
            console.error("Unable to load saved data:", error);
        }

        return structuredClone(DEFAULT_DATA);
    }

    function saveData(data) {
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

    const data = loadData();

    return {
        config: CONFIG,
        data,
        saveData: () => saveData(data)
    };

})();

document.addEventListener("DOMContentLoaded", () => {
    console.log(
        `${AdventurePlanner.config.appName} initialised successfully.`
    );
});
