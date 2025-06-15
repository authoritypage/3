
/*
    NUEVA - Web3 & NFT Development Agency | script.js
    Handles interactive elements like responsive navigation, scroll effects,
    and form validation.
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Cache ---
    const navToggleBtn = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-list a');
    const siteHeader = document.querySelector('.site-header');
    const currentYearSpan = document.getElementById('current-year');
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');

    // --- Initialization ---
    setCurrentYear();
    setupEventListeners();
    setupScrollAnimations();

    // Force the dark theme for this specific design
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme'); // Not strictly needed if no toggle, but good for clarity


    // --- Functions ---

    /**
     * Sets up all event listeners for UI interactions.
     */
    function setupEventListeners() {
        // Toggle mobile navigation
        navToggleBtn.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
            navToggleBtn.setAttribute('aria-expanded', !isExpanded);
        });

        // Close mobile nav when a link is clicked (smooth scroll implicitly handles moving to section)
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                if (mainNav.classList.contains('nav-open')) {
                    // Slight delay to allow smooth scroll to start before closing menu
                    setTimeout(() => {
                        mainNav.classList.remove('nav-open');
                        navToggleBtn.setAttribute('aria-expanded', 'false');
                    }, 300);
                }
            });
        });

        // Shrink header on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // Arbitrary scroll threshold
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }

            // Highlight current nav link based on scroll position
            highlightCurrentNavLink();
        });

        // Contact Form Submission (Example: client-side validation & fake submission)
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    /**
     * Sets the current year in the footer.
     */
    function setCurrentYear() {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    /**
     * Handles contact form submission, including basic validation.
     * @param {Event} event - The form submission event.
     */
    function handleContactFormSubmit(event) {
        event.preventDefault(); // Prevent default form submission

        formStatus.textContent = '';
        formStatus.classList.remove('success', 'error');

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            formStatus.textContent = 'Please fill in all required fields.';
            formStatus.classList.add('error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            formStatus.textContent = 'Please enter a valid email address.';
            formStatus.classList.add('error');
            return;
        }

        // Simulate API call or form submission
        setTimeout(() => {
            formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
            formStatus.classList.add('success');
            contactForm.reset(); // Clear form
        }, 1500); // Simulate network delay
    }

    /**
     * Sets up Intersection Observer for scroll-triggered animations.
     */
    function setupScrollAnimations() {
        const animateElements = document.querySelectorAll('.animate-fade-in');

        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of element is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // observer.unobserve(entry.target); // Optional: animate only once
                } else {
                    entry.target.classList.remove('is-visible'); // Optional: reset when out of view
                }
            });
        }, observerOptions);

        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Highlights the current navigation link based on scroll position relative to sections.
     * Adjusted to consider header height.
     */
    function highlightCurrentNavLink() {
        const sections = document.querySelectorAll('main section[id]');
        const scrollPosition = window.scrollY + siteHeader.offsetHeight + 10; // Offset by header height plus some padding

        sections.forEach(section => {
            if (section.offsetTop <= scrollPosition && section.offsetTop + section.offsetHeight > scrollPosition) {
                const currentId = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('current');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('current');
                    }
                });
            }
        });

        // Special handling for the very top (Hero section)
        if (window.scrollY === 0) {
            navLinks.forEach(link => link.classList.remove('current'));
            const homeLink = document.querySelector('.nav-list a[href="#hero"]');
            if (homeLink) {
                homeLink.classList.add('current');
            }
        }
    }

    // Initial highlight on load
    highlightCurrentNavLink();

});
