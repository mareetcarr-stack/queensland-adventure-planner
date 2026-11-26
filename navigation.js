"use strict";

/*
 * Adventure Planner — Quick Navigation
 * Adds a sticky navigation bar linking to the app's main sections.
 */

(() => {
    function initialiseNavigation() {
        if (document.getElementById("adventure-navigation")) return;

        const main = document.querySelector("main");
        if (!main) return;

        const sections = [
            {
                id: "activity-browser",
                label: "Discover",
                find: () => document.getElementById("activity-browser")
            },
            {
                id: "day-generator",
                label: "Plan a Day",
                find: () => {
                    const panel = document.querySelector(".day-generator");
                    return panel?.closest(".feature") || null;
                }
            },
            {
                id: "holiday-planner-feature",
                label: "Holiday Planner",
                find: () => document.getElementById("holiday-planner-feature")
            },
            {
                id: "my-adventures",
                label: "My Adventures",
                find: () => document.getElementById("my-adventures")
            },
            {
                id: "my-shortlist",
                label: "Shortlist",
                find: () => document.getElementById("my-shortlist")
            },
            {
                id: "adventure-map",
                label: "Map",
                find: () => document.getElementById("adventure-map")
            }
        ];

        const navigation = document.createElement("nav");
        navigation.id = "adventure-navigation";
        navigation.setAttribute("aria-label", "Main navigation");

        const links = document.createElement("div");
        links.className = "adventure-navigation-links";

        sections.forEach(section => {
            const target = section.find();
            if (!target) return;

            if (!target.id) target.id = section.id;

            const link = document.createElement("a");
            link.href = `#${target.id}`;
            link.textContent = section.label;

            links.appendChild(link);
        });

        if (!links.children.length) return;

        navigation.appendChild(links);

        const header = document.querySelector("header");

        if (header) {
            header.insertAdjacentElement("afterend", navigation);
        } else {
            main.insertAdjacentElement("beforebegin", navigation);
        }

        const style = document.createElement("style");
        style.textContent = `
            #adventure-navigation {
                position: sticky;
                top: 0;
                z-index: 1000;
                width: 100%;
                background: var(--forest);
                border-top: 1px solid rgba(255,255,255,.15);
                box-shadow: 0 3px 10px rgba(0,0,0,.12);
            }

            .adventure-navigation-links {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 6px;
                width: min(100% - 24px, 1000px);
                margin: 0 auto;
                padding: 9px 0;
                overflow-x: auto;
                scrollbar-width: thin;
            }

            .adventure-navigation-links a {
                flex: 0 0 auto;
                padding: 8px 12px;
                border-radius: 7px;
                color: white;
                text-decoration: none;
                font-size: .88rem;
                font-weight: 600;
                white-space: nowrap;
            }

            .adventure-navigation-links a:hover,
            .adventure-navigation-links a:focus {
                background: rgba(255,255,255,.15);
                outline: none;
            }

            html {
                scroll-behavior: smooth;
                scroll-padding-top: 75px;
            }

            @media (max-width: 600px) {
                .adventure-navigation-links {
                    justify-content: flex-start;
                    padding: 8px 4px;
                }

                .adventure-navigation-links a {
                    padding: 8px 10px;
                    font-size: .82rem;
                }
            }
        `;

        document.head.appendChild(style);
    }

    document.addEventListener("DOMContentLoaded", initialiseNavigation);
})();
