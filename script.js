/*
    Psychopolitics of Dominance | script.js
    Enhances the reading experience with dynamic Table of Contents,
    scroll progress indication, and active section highlighting.
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Cache ---
    const paperContent = document.querySelector('.paper-content');
    const tocNav = document.getElementById('toc-nav');
    const sections = document.querySelectorAll('.section-chapter'); // Main paper sections
    const readingProgressBar = document.getElementById('reading-progress-bar');
    const siteHeader = document.querySelector('.site-header');

    // --- State Variables ---
    let observer; // Intersection Observer for active TOC links

    // --- Initialization ---
    generateTableOfContents();
    setupEventListeners();
    setupIntersectionObserver(); // For scroll spy

    // --- Functions ---

    /**
     * Dynamically generates the Table of Contents from h2 and h3 headings in the paper content.
     */
    function generateTableOfContents() {
        const tocList = document.createElement('ul');
        let currentLevel1Item = null;

        sections.forEach((section, index) => {
            const h2 = section.querySelector('h2');
            if (h2) {
                // Ensure the section has an ID for direct linking
                if (!section.id) {
                    section.id = `section-${h2.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                }

                // Create L1 TOC item (Chapter H2)
                currentLevel1Item = document.createElement('li');
                const h2Link = document.createElement('a');
                h2Link.href = `#${section.id}`;
                // Use data-level if present, otherwise just the text content for the TOC link
                h2Link.textContent = `${h2.getAttribute('data-level') ? h2.getAttribute('data-level') + '. ' : ''}${h2.textContent.replace(/^I?\w+\.\s+/, '')}`; // Removes "I. " or "II. " from TOC link
                currentLevel1Item.appendChild(h2Link);
                tocList.appendChild(currentLevel1Item);

                // Check for H3s within this section to create L2 TOC items
                const h3s = section.querySelectorAll('h3');
                if (h3s.length > 0) {
                    const subList = document.createElement('ul');
                    h3s.forEach(h3 => {
                        // Ensure the h3 has an ID
                        if (!h3.id) {
                            // Basic ID generation for H3s
                            let h3Text = h3.textContent.split(' - ')[0]; // Take only the number part (A, B, C or 1, 2, 3)
                            let h2DataLevel = h2.getAttribute('data-level') ? h2.getAttribute('data-level').toLowerCase().replace('.', '') : `chapter-${index + 1}`; // Ensure consistent base ID for h3
                            h3.id = `${h2DataLevel}-${h3Text.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
                        }

                        const subListItem = document.createElement('li');
                        const h3Link = document.createElement('a');
                        h3Link.href = `#${h3.id}`;
                        // For H3, capture just "A. Dopamine Hijacking" part, remove chapter number if present
                        let displayH3Text = h3.textContent.trim();
                        const match = displayH3Text.match(/^(?:[A-Z]\.|\d+\.)\s+(.*)/);
                        if (match && match[1]) {
                            displayH3Text = match[1]; // Get "Dopamine Hijacking"
                        }
                        h3Link.textContent = displayH3Text;
                        subListItem.appendChild(h3Link);
                        subList.appendChild(subListItem);
                    });
                    if (currentLevel1Item) {
                        currentLevel1Item.appendChild(subList);
                    }
                }
            }
        });
        tocNav.appendChild(tocList);
    }


    /**
     * Sets up global event listeners.
     */
    function setupEventListeners() {
        window.addEventListener('scroll', updateReadingProgress);
        window.addEventListener('scroll', handleHeaderShrink);
        window.addEventListener('resize', updateReadingProgress); // Adjust progress on resize
    }

    /**
     * Updates the reading progress bar based on scroll position.
     */
    function updateReadingProgress() {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / totalHeight) * 100;
        readingProgressBar.style.width = `${progress}%`;
    }

    /**
     * Adds/removes a 'scrolled' class to the header based on scroll position,
     * triggering CSS animations for header shrinkage.
     */
    function handleHeaderShrink() {
        if (window.scrollY > 50) { // Trigger after 50px scroll
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    }

    /**
     * Sets up Intersection Observer to highlight active sections in the TOC.
     */
    function setupIntersectionObserver() {
        const headerOffset = siteHeader.offsetHeight + 20; // Account for sticky header height + some buffer
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const tocLink = tocNav.querySelector(`a[href="#${id}"]`);

                if (tocLink) {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { // When at least 50% visible
                        // Remove active from all others
                        tocNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                        tocLink.classList.add('active');
                    } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
                        // This else if is to ensure if a section scrolls out from *above*, its active class is removed.
                        // However, the main logic for adding active class covers this for most cases.
                    }
                }
            });
        }, {
            rootMargin: `-${headerOffset}px 0px 0px 0px`, // Shrink the top margin of the viewport, effectively pushing up the "detection line"
            threshold: [0, 0.5, 1.0] // Observe at 0%, 50%, and 100% visibility
        });

        // Observe all main sections for TOC highlighting
        sections.forEach(section => {
            observer.observe(section);
        });

        // Fallback for initial load: highlight the top-most visible section
        // This is important because the observer might not trigger immediately on DOMContentLoaded
        updateActiveTOCLinkOnLoad();
    }

    /**
     * Special function to determine active TOC link immediately on load.
     */
    function updateActiveTOCLinkOnLoad() {
        const headerOffset = siteHeader.offsetHeight + 20;
        let foundActive = false;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Check if section is significantly visible in the viewport from the top, considering header.
            if (rect.top <= headerOffset && rect.bottom > headerOffset && !foundActive) {
                const id = section.getAttribute('id');
                const tocLink = tocNav.querySelector(`a[href="#${id}"]`);
                if (tocLink) {
                    tocNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                    tocLink.classList.add('active');
                    foundActive = true;
                }
            }
        });
        // If nothing matches (e.g., page is very short), activate the first link
        if (!foundActive && sections.length > 0) {
            const firstLink = tocNav.querySelector('a');
            if (firstLink) firstLink.classList.add('active');
        }
    }
});
