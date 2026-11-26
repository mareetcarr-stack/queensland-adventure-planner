
"use strict";

/*
 * Adventure Planner — Main Navigation
 * Home is the primary day-planning experience.
 */

(() => {
    function init() {
        if (document.getElementById("adventure-navigation")) return;

        const pages = [
            { id: "home", label: "Home", url: "index.html" },
            { id: "discover", label: "Discover", url: "discover.html" },
            {
                id: "my-adventures",
                label: "My Adventures",
                url: "my-adventures.html"
            },
            {
                id: "shortlist",
                label: "My Shortlist",
                url: "shortlist.html?view=saved"
            }
        ];

        const nav = document.createElement("nav");
        nav.id = "adventure-navigation";
        nav.setAttribute("aria-label", "Main navigation");

        const links = document.createElement("div");
        links.className = "adventure-navigation-links";

        pages.forEach(page => {
            const link = document.createElement("a");
            link.href = page.url;
            link.textContent = page.label;

            if (page.id === document.body.dataset.page) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }

            links.appendChild(link);
        });

        nav.appendChild(links);

        const header = document.querySelector("header");

        if (header) {
            header.insertAdjacentElement("afterend", nav);
        }

        const css = document.createElement("style");

        css.textContent = `
            #adventure-navigation {
                position: sticky;
                top: 0;
                z-index: 1000;
                width: 100%;
                background: rgba(247,245,241,.97);
                border-bottom: 1px solid var(--border);
                backdrop-filter: blur(12px);
            }

            .adventure-navigation-links {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 7px;
                width: min(100% - 28px, 1100px);
                margin: 0 auto;
                padding: 10px 0;
            }

            .adventure-navigation-links a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 40px;
                padding: 8px 16px;
                border-radius: 30px;
                color: var(--ink);
                text-decoration: none;
                font-size: .9rem;
                font-weight: 600;
                white-space: nowrap;
            }

            .adventure-navigation-links a:hover {
                background: var(--sage);
            }

            .adventure-navigation-links a.active {
                background: var(--sage-dark);
                color: white;
            }

            @media(max-width:650px) {
                .adventure-navigation-links {
                    justify-content: flex-start;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    scrollbar-width: none;
                }

                .adventure-navigation-links::-webkit-scrollbar {
                    display: none;
                }
            }
        `;

        document.head.appendChild(css);
    }

    document.addEventListener("DOMContentLoaded", init);
})();
