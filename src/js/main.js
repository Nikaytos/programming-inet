// Main JavaScript file (Lab 4 & Lab 5)
// DOM manipulation, events, form validation, AJAX

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== DOM Elements =====
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-list a');
    const navToggle = document.getElementById('nav-toggle');
    const sections = document.querySelectorAll('section[id]');
    const contactForm = document.getElementById('contact-form');
    const projectsGrid = document.getElementById('projects-grid');

    // ===== Lab 5: AJAX - Load Projects =====
    let projectsData = null;

    async function loadProjects() {
        try {
            const response = await fetch('data/projects.json');
            if (!response.ok) {
                throw new Error('Failed to load projects');
            }
            const data = await response.json();
            projectsData = data.projects;
            renderProjects(projectsData);
            console.log('Projects loaded via AJAX');
        } catch (error) {
            console.error('Error loading projects:', error);
            // Fallback: use inline data if fetch fails
            projectsData = getDefaultProjects();
            renderProjects(projectsData);
        }
    }

    function getDefaultProjects() {
        return [
            {
                id: 'project-sonna',
                title: 'SonnaLagoda',
                shortTitle: 'SL',
                description: 'Premium bedding e-commerce store with full-stack implementation.',
                fullDescription: 'Premium bedding e-commerce store with full-stack implementation. Features include product catalog with filtering, shopping cart functionality, user authentication system, admin panel for content management, and order processing.',
                tech: ['Next.js', 'React', 'NestJS', 'PostgreSQL', 'Prisma', 'Docker', 'TypeScript'],
                features: ['Product catalog', 'Shopping cart', 'User authentication', 'Admin panel', 'Responsive design']
            },
            {
                id: 'project-vlc',
                title: 'VLC AI Translate',
                shortTitle: 'VLC',
                description: 'CLI tool for translating subtitles using multiple translation providers.',
                fullDescription: 'Command-line tool for translating subtitles using multiple AI and translation providers. Supports SRT and VTT formats.',
                tech: ['Node.js', 'JavaScript', 'Google Gemini', 'DeepL API', 'Microsoft Translate', 'Commander.js', 'CLI'],
                features: ['Multiple providers', 'Batch processing', 'SRT and VTT formats', 'Progress tracking', 'Configurable settings']
            }
        ];
    }

    function renderProjects(projects) {
        if (!projectsGrid) return;

        projectsGrid.innerHTML = projects.map(project => `
            <article class="project-card" id="${project.id}" data-project='${JSON.stringify(project)}'>
                <div class="project-image">
                    <div class="project-placeholder">${project.shortTitle}</div>
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">
                        ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="#" class="btn btn-small project-details-btn">View Details</a>
                    </div>
                </div>
            </article>
        `).join('');

        // Attach event listeners to new buttons
        attachProjectListeners();
    }

    function attachProjectListeners() {
        document.querySelectorAll('.project-details-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.project-card');
                const project = JSON.parse(card.dataset.project);
                openProjectModal(project);
            });
        });
    }

    // Load projects on page load
    loadProjects();

    // ===== Lab 5: AJAX - Form Submission =====
    async function submitFormAjax(formData) {
        // Simulate AJAX request (no real backend)
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // Simulate success (90% chance) or failure (10% chance)
                if (Math.random() > 0.1) {
                    resolve({
                        success: true,
                        message: 'Message sent successfully!'
                    });
                } else {
                    reject(new Error('Server error. Please try again.'));
                }
            }, 1000);
        });
    }

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

        // Form submit with AJAX (Lab 5)
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const isNameValid = validateField(nameInput, patterns.name, errorMessages.name);
            const isEmailValid = validateField(emailInput, patterns.email, errorMessages.email);
            const isMessageValid = validateField(messageInput, patterns.message, errorMessages.message);

            if (isNameValid && isEmailValid && isMessageValid) {
                // Disable submit button during request
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';

                try {
                    // Lab 5: AJAX form submission
                    const formData = {
                        name: nameInput.value,
                        email: emailInput.value,
                        message: messageInput.value
                    };

                    const result = await submitFormAjax(formData);
                    showNotification(result.message, 'success');
                    contactForm.reset();

                    // Remove valid classes
                    [nameInput, emailInput, messageInput].forEach(input => {
                        input.classList.remove('valid');
                    });
                } catch (error) {
                    showNotification(error.message, 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
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

    // ===== Project Modal (updated for AJAX - Lab 5) =====
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

    // Open project modal with data from AJAX
    function openProjectModal(project) {
        modalBody.innerHTML = `
            <h2>${project.title}</h2>
            <p class="modal-description">${project.fullDescription || project.description}</p>
            <h3>Technologies</h3>
            <div class="modal-tech">
                ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
            <h3>Key Features</h3>
            <ul class="modal-features">
                ${project.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        `;
        openModal();
    }

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
