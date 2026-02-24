document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-list a');
    const navToggle = document.getElementById('nav-toggle');
    const sections = document.querySelectorAll('section[id]');
    const contactForm = document.getElementById('contact-form');
    const projectsGrid = document.getElementById('projects-grid');

    let projectsData = null;
    let isLoggedIn = false;
    let currentUser = null;
    let skillsTable = null;
    let skillsData = [];
    let categories = [];
    let users = [];

    async function loadSkillsData() {
        try {
            const response = await fetch('data/skills.json');
            const data = await response.json();
            skillsData = data.skills;
            categories = data.categories;
        } catch (error) {
            skillsData = [
                { id: 1, category: 'Backend', skill: 'Node.js', level: 90 },
                { id: 2, category: 'Backend', skill: 'NestJS', level: 85 }
            ];
            categories = ['Backend', 'Frontend', 'Database', 'DevOps'];
        }
    }

    async function loadUsersData() {
        try {
            const response = await fetch('data/users.json');
            const data = await response.json();
            users = data.users;
        } catch (error) {
            users = [{ username: 'admin', password: 'admin123', name: 'Admin' }];
        }
    }

    function restoreLoginState() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            updateAuthUI();
        }
    }

    function saveLoginState() {
        if (isLoggedIn && currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    function initDataTable() {
        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            skillsTable = $('#skills-datatable').DataTable({
                data: skillsData,
                columns: [
                    { data: 'id' },
                    { data: 'category' },
                    { data: 'skill' },
                    {
                        data: 'level',
                        render: function(data) {
                            return '<div class="level-bar"><div class="level-bar-fill" style="width: ' + data + '%"></div></div><span>' + data + '%</span>';
                        }
                    },
                    {
                        data: null,
                        render: function(data, type, row) {
                            if (isLoggedIn) {
                                return '<button class="btn-edit" onclick="editSkill(' + row.id + ')">Edit</button>' +
                                       '<button class="btn-delete" onclick="deleteSkill(' + row.id + ')">Delete</button>';
                            }
                            return '<span style="color: #999;">Login to edit</span>';
                        }
                    }
                ],
                responsive: true,
                language: {
                    search: "Search:",
                    lengthMenu: "Show _MENU_ entries",
                    info: "Showing _START_ to _END_ of _TOTAL_ skills"
                }
            });
        }
    }

    function initAutocomplete() {
        if (typeof $ !== 'undefined' && $.ui && $.ui.autocomplete) {
            $('#skill-category').autocomplete({
                source: categories,
                minLength: 0,
                select: function(event, ui) {
                    $(this).val(ui.item.value);
                    return false;
                }
            }).focus(function() {
                $(this).autocomplete('search', '');
            });
        }
    }

    function createAuthModal() {
        const authModalHTML = `
            <div class="modal auth-modal" id="auth-modal">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-body">
                        <h2 style="text-align: center; margin-bottom: 20px;">Account</h2>
                        <div class="auth-tabs">
                            <button class="auth-tab active" data-tab="login">Login</button>
                            <button class="auth-tab" data-tab="register">Register</button>
                        </div>
                        <form class="auth-form active" id="login-form">
                            <div class="form-group">
                                <label for="login-username">Username</label>
                                <input type="text" id="login-username" required>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Password</label>
                                <input type="password" id="login-password" required>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                        </form>
                        <form class="auth-form" id="register-form">
                            <div class="form-group">
                                <label for="register-name">Full Name</label>
                                <input type="text" id="register-name" required>
                            </div>
                            <div class="form-group">
                                <label for="register-username">Username</label>
                                <input type="text" id="register-username" required>
                            </div>
                            <div class="form-group">
                                <label for="register-password">Password</label>
                                <input type="password" id="register-password" required>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', authModalHTML);

        const authModal = document.getElementById('auth-modal');
        const authTabs = authModal.querySelectorAll('.auth-tab');
        const authForms = authModal.querySelectorAll('.auth-form');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(targetTab + '-form').classList.add('active');
            });
        });

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                login(user);
                closeAuthModal();
                showNotification('Welcome back, ' + user.name + '!', 'success');
            } else {
                showNotification('Invalid username or password', 'error');
            }
        });

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            if (users.find(u => u.username === username)) {
                showNotification('Username already exists', 'error');
                return;
            }

            const newUser = { username, password, name };
            users.push(newUser);
            login(newUser);
            closeAuthModal();
            showNotification('Registration successful! Welcome, ' + name + '!', 'success');
        });

        authModal.querySelector('.modal-close').addEventListener('click', closeAuthModal);
        authModal.querySelector('.modal-overlay').addEventListener('click', closeAuthModal);
    }

    function openAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    function login(user) {
        isLoggedIn = true;
        currentUser = user;
        saveLoginState();
        updateAuthUI();
        refreshTable();
    }

    function logout() {
        isLoggedIn = false;
        currentUser = null;
        saveLoginState();
        updateAuthUI();
        refreshTable();
        showNotification('Logged out successfully', 'success');
    }

    function updateAuthUI() {
        const authBtn = document.getElementById('auth-btn');
        const adminPanel = document.getElementById('admin-panel');

        if (isLoggedIn) {
            authBtn.outerHTML = `
                <li class="user-info">
                    <span>Hi, ${currentUser.name}</span>
                    <button class="logout-btn" id="logout-btn">Logout</button>
                </li>
            `;
            document.getElementById('logout-btn').addEventListener('click', logout);
            adminPanel.style.display = 'block';
        } else {
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                userInfo.outerHTML = '<li><a href="#" id="auth-btn" class="auth-link">Login</a></li>';
                document.getElementById('auth-btn').addEventListener('click', function(e) {
                    e.preventDefault();
                    openAuthModal();
                });
            }
            adminPanel.style.display = 'none';
        }
    }

    function refreshTable() {
        if (skillsTable) {
            skillsTable.clear();
            skillsTable.rows.add(skillsData);
            skillsTable.draw();
        }
    }

    window.editSkill = function(id) {
        if (!isLoggedIn) {
            showNotification('Please login to edit', 'error');
            return;
        }

        const skill = skillsData.find(s => s.id === id);
        if (!skill) return;

        const row = skillsTable.row(function(idx, data) { return data.id === id; });
        const rowNode = row.node();
        const cells = rowNode.querySelectorAll('td');

        cells[1].innerHTML = '<input type="text" class="edit-input" value="' + skill.category + '" id="edit-category-' + id + '">';
        cells[2].innerHTML = '<input type="text" class="edit-input" value="' + skill.skill + '" id="edit-skill-' + id + '">';
        cells[3].innerHTML = '<input type="number" class="edit-input" value="' + skill.level + '" min="0" max="100" id="edit-level-' + id + '" style="width: 60px;">';
        cells[4].innerHTML = '<button class="btn-edit" onclick="saveSkill(' + id + ')">Save</button>' +
                             '<button class="btn-delete" onclick="cancelEdit(' + id + ')">Cancel</button>';
    };

    window.saveSkill = function(id) {
        const category = document.getElementById('edit-category-' + id).value;
        const skillName = document.getElementById('edit-skill-' + id).value;
        const level = parseInt(document.getElementById('edit-level-' + id).value);

        if (!category || !skillName || isNaN(level) || level < 0 || level > 100) {
            showNotification('Please fill in all fields correctly', 'error');
            return;
        }

        const skill = skillsData.find(s => s.id === id);
        if (skill) {
            skill.category = category;
            skill.skill = skillName;
            skill.level = level;
            refreshTable();
            showNotification('Skill updated successfully', 'success');
        }
    };

    window.cancelEdit = function(id) {
        refreshTable();
    };

    window.deleteSkill = function(id) {
        if (!isLoggedIn) {
            showNotification('Please login to delete', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this skill?')) {
            const index = skillsData.findIndex(s => s.id === id);
            if (index > -1) {
                skillsData.splice(index, 1);
                refreshTable();
                showNotification('Skill deleted successfully', 'success');
            }
        }
    };

    const addSkillForm = document.getElementById('add-skill-form');
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!isLoggedIn) {
                showNotification('Please login to add skills', 'error');
                return;
            }

            const category = document.getElementById('skill-category').value;
            const skillName = document.getElementById('skill-name').value;
            const level = parseInt(document.getElementById('skill-level').value);

            if (!category || !skillName || isNaN(level) || level < 0 || level > 100) {
                showNotification('Please fill in all fields correctly', 'error');
                return;
            }

            const newId = Math.max(...skillsData.map(s => s.id)) + 1;
            skillsData.push({ id: newId, category, skill: skillName, level });
            refreshTable();
            addSkillForm.reset();
            showNotification('Skill added successfully', 'success');
        });
    }

    async function loadProjects() {
        try {
            const response = await fetch('data/projects.json');
            if (!response.ok) {
                throw new Error('Failed to load projects');
            }
            const data = await response.json();
            projectsData = data.projects;
            renderProjects(projectsData);
        } catch (error) {
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

    loadProjects();

    async function submitFormAjax(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
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

    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll);

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

                    if (navToggle) {
                        navToggle.checked = false;
                    }
                }
            }
        });
    });

    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        const patterns = {
            name: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]{2,50}$/,
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: /^.{10,1000}$/
        };

        const errorMessages = {
            name: 'Name must be 2-50 characters (letters only)',
            email: 'Please enter a valid email address',
            message: 'Message must be at least 10 characters'
        };

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

        function removeError(input) {
            const errorEl = input.parentElement.querySelector('.error-message');
            if (errorEl) {
                errorEl.remove();
            }
        }

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

        nameInput.addEventListener('input', () => {
            validateField(nameInput, patterns.name, errorMessages.name);
        });

        emailInput.addEventListener('input', () => {
            validateField(emailInput, patterns.email, errorMessages.email);
        });

        messageInput.addEventListener('input', () => {
            validateField(messageInput, patterns.message, errorMessages.message);
        });

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const isNameValid = validateField(nameInput, patterns.name, errorMessages.name);
            const isEmailValid = validateField(emailInput, patterns.email, errorMessages.email);
            const isMessageValid = validateField(messageInput, patterns.message, errorMessages.message);

            if (isNameValid && isEmailValid && isMessageValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';

                try {
                    const formData = {
                        name: nameInput.value,
                        email: emailInput.value,
                        message: messageInput.value
                    };

                    const result = await submitFormAjax(formData);
                    showNotification(result.message, 'success');
                    contactForm.reset();

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

    function showNotification(message, type = 'info') {
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

        setTimeout(() => notification.classList.add('show'), 10);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

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
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeModal();
            }
            const authModal = document.getElementById('auth-modal');
            if (authModal && authModal.classList.contains('active')) {
                closeAuthModal();
            }
        }
    });

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
                setTimeout(() => {
                    typingCursor.style.display = 'none';
                }, 1000);
            }
        }

        setTimeout(typeWriter, 500);
    }

    createAuthModal();

    document.getElementById('auth-btn').addEventListener('click', function(e) {
        e.preventDefault();
        openAuthModal();
    });

    if (typeof $ !== 'undefined') {
        $(document).ready(async function() {
            await loadSkillsData();
            await loadUsersData();
            restoreLoginState();
            initDataTable();
            initAutocomplete();
        });
    }

    function handleCaptureParams() {
        const params = new URLSearchParams(window.location.search);
        const modalType = params.get('modal');
        const isMobile = params.get('mobile') === 'true';

        if (isMobile) {
            document.body.classList.add('figma-mobile-capture');
            const style = document.createElement('style');
            style.textContent = `
                .figma-mobile-capture { max-width: 375px !important; margin: 0 auto !important; }
                .figma-mobile-capture .nav-toggle-label { display: flex !important; }
                .figma-mobile-capture .nav-list {
                    position: absolute !important; top: 100% !important; left: 0 !important; right: 0 !important;
                    flex-direction: column !important; background: #1e293b !important; padding: 20px !important;
                    display: flex !important;
                }
                .figma-mobile-capture .skills-grid { grid-template-columns: 1fr !important; }
                .figma-mobile-capture .projects-grid { grid-template-columns: 1fr !important; }
                .figma-mobile-capture .contact-content { grid-template-columns: 1fr !important; }
            `;
            document.head.appendChild(style);
        }

        if (modalType === 'auth') {
            setTimeout(() => openAuthModal(), 500);
        } else if (modalType === 'project') {
            setTimeout(() => {
                const firstProject = projectsData ? projectsData[0] : getDefaultProjects()[0];
                openProjectModal(firstProject);
            }, 500);
        }
    }

    setTimeout(handleCaptureParams, 100);
});
