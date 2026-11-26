
"use strict";

/*
 * Adventure Planner — dedicated page navigation
 */

(() => {
    function initialiseNavigation() {
        if (document.getElementById("adventure-navigation")) return;

        const pages = [
            { id: "home", label: "Home", url: "index.html" },
            { id: "discover", label: "Discover", url: "discover.html" },
            { id: "plan-day", label: "Plan a Day", url: "plan-day.html" },
            { id: "holidays", label: "Holidays", url: "holidays.html" },
            { id: "my-adventures", label: "My Adventures", url: "my-adventures.html" },
            { id: "shortlist", label: "Shortlist", url: "shortlist.html" },
            { id: "map", label: "Map", url: "map.html" }
        ];

        const currentPage = document.body.dataset.page;
        const navigation = document.createElement("nav");

        navigation.id = "adventure-navigation";
        navigation.setAttribute("aria-label", "Main navigation");

        const links = document.createElement("div");
        links.className = "adventure-navigation-links";

        pages.forEach(page => {
            const link = document.createElement("a");
            link.href = page.url;
            link.textContent = page.label;

            if (page.id === currentPage) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }

            links.appendChild(link);
        });

        navigation.appendChild(links);

        const header = document.querySelector("header");

        if (header) {
            header.insertAdjacentElement("afterend", navigation);
        }

        const style = document.createElement("style");

        style.textContent = `
            #adventure-navigation {
                position: sticky;
                top: 0;
                z-index: 1000;
                width: 100%;
                background: rgba(247, 245, 241, .96);
                border-bottom: 1px solid var(--border);
                backdrop-filter: blur(12px);
            }

            .adventure-navigation-links {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 5px;
                width: min(100% - 28px, 1100px);
                margin: 0 auto;
                padding: 10px 0;
            }

            .adventure-navigation-links a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 38px;
                padding: 8px 14px;
                border-radius: 30px;
                color: var(--ink);
                text-decoration: none;
                font-size: .88rem;
                font-weight: 600;
                white-space: nowrap;
                transition: background .2s ease, color .2s ease;
            }

            .adventure-navigation-links a:hover {
                background: var(--sage);
            }

            .adventure-navigation-links a.active {
                background: var(--terracotta);
                color: white;
            }

            @media (max-width: 650px) {
                .adventure-navigation-links {
                    justify-content: flex-start;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    padding: 9px 0;
                    scrollbar-width: none;
                }

                .adventure-navigation-links::-webkit-scrollbar {
                    display: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    document.addEventListener("DOMContentLoaded", initialiseNavigation);
})();
