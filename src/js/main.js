// Main JavaScript file (Lab 4)
// DOM manipulation, events, form validation

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== DOM Elements =====
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-list a');
    const navToggle = document.getElementById('nav-toggle');
    const sections = document.querySelectorAll('section[id]');
    const contactForm = document.getElementById('contact-form');
    const projectCards = document.querySelectorAll('.project-card');

    // ===== Header Shadow on Scroll =====
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll);

    // ===== Active Navigation on Scroll =====
    function highlightActiveSection() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveSection);

    // ===== Smooth Scroll for Navigation =====
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetSection = document.querySelector(href);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Close mobile menu after click
                    if (navToggle) {
                        navToggle.checked = false;
                    }
                }
            }
        });
    });

    // ===== Form Validation =====
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        // Validation patterns
        const patterns = {
            name: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]{2,50}$/,
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: /^.{10,1000}$/
        };

        // Error messages
        const errorMessages = {
            name: 'Name must be 2-50 characters (letters only)',
            email: 'Please enter a valid email address',
            message: 'Message must be at least 10 characters'
        };

        // Create error element
        function createErrorElement(input, message) {
            let errorEl = input.parentElement.querySelector('.error-message');
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                input.parentElement.appendChild(errorEl);
            }
            errorEl.textContent = message;
            return errorEl;
        }

        // Remove error element
        function removeError(input) {
            const errorEl = input.parentElement.querySelector('.error-message');
            if (errorEl) {
                errorEl.remove();
            }
        }

        // Validate single field
        function validateField(input, pattern, errorMessage) {
            const value = input.value.trim();

            if (value === '') {
                input.classList.remove('valid', 'invalid');
                removeError(input);
                return false;
            }

            if (pattern.test(value)) {
                input.classList.remove('invalid');
                input.classList.add('valid');
                removeError(input);
                return true;
            } else {
                input.classList.remove('valid');
                input.classList.add('invalid');
                createErrorElement(input, errorMessage);
                return false;
            }
        }

        // Real-time validation
        nameInput.addEventListener('input', () => {
            validateField(nameInput, patterns.name, errorMessages.name);
        });

        emailInput.addEventListener('input', () => {
            validateField(emailInput, patterns.email, errorMessages.email);
        });

        messageInput.addEventListener('input', () => {
            validateField(messageInput, patterns.message, errorMessages.message);
        });

        // Form submit
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const isNameValid = validateField(nameInput, patterns.name, errorMessages.name);
            const isEmailValid = validateField(emailInput, patterns.email, errorMessages.email);
            const isMessageValid = validateField(messageInput, patterns.message, errorMessages.message);

            if (isNameValid && isEmailValid && isMessageValid) {
                showNotification('Form submitted successfully!', 'success');
                contactForm.reset();

                // Remove valid classes
                [nameInput, emailInput, messageInput].forEach(input => {
                    input.classList.remove('valid');
                });
            } else {
                showNotification('Please fill in all fields correctly', 'error');
            }
        });
    }

    // ===== Notification System =====
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto hide
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ===== Project Modal =====
    const modalHTML = `
        <div class="modal" id="project-modal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('project-modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalClose = modal.querySelector('.modal-close');
    const modalOverlay = modal.querySelector('.modal-overlay');

    // Project details buttons
    projectCards.forEach(card => {
        const detailsBtn = card.querySelector('.project-details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const title = card.querySelector('h3').textContent;
                const description = card.querySelector('.project-description').textContent;
                const techTags = card.querySelectorAll('.tech-tag');
                const features = card.querySelectorAll('.project-features li');

                modalBody.innerHTML = `
                    <h2>${title}</h2>
                    <p class="modal-description">${description}</p>
                    <h3>Technologies</h3>
                    <div class="modal-tech">
                        ${Array.from(techTags).map(t => `<span class="tech-tag">${t.textContent}</span>`).join('')}
                    </div>
                    ${features.length > 0 ? `
                        <h3>Key Features</h3>
                        <ul class="modal-features">
                            ${Array.from(features).map(f => `<li>${f.textContent}</li>`).join('')}
                        </ul>
                    ` : ''}
                `;
                openModal();
            });
        }
    });

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ===== Back to Top Button =====
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    function toggleBackToTop() {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleBackToTop);

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ===== Typing Effect for Hero =====
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.innerHTML = '<span class="typing-text"></span><span class="typing-cursor">|</span>';
        const typingText = heroSubtitle.querySelector('.typing-text');
        const typingCursor = heroSubtitle.querySelector('.typing-cursor');

        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                typingText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                // Remove cursor after typing
                setTimeout(() => {
                    typingCursor.style.display = 'none';
                }, 1000);
            }
        }

        // Start typing after a short delay
        setTimeout(typeWriter, 500);
    }

    console.log('Portfolio loaded successfully');
});
