/**
 * Digital Campus Ecosystem — Portal Presentation System
 * Ghousia College of Engineering
 *
 * Self-contained IIFE. Creates the floating Portals button, glass dropdown,
 * and three fullscreen concept presentation modals (Student, Faculty, Admin).
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. SVG ICON LIBRARY
    // =========================================================================

    const ICONS = {
        portals: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
        student: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>`,
        faculty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="17" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/></svg>`,
        admin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
        themeSun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
        themeMoon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
    };


    // =========================================================================
    // 2. PORTAL CONTENT DATA
    // =========================================================================

    const PORTALS = {
        student: {
            badge: 'STUDENT PORTAL',
            title: 'Your Digital <span>Academic Workspace</span>',
            desc: 'Access classes, attendance, assignments, internal marks, fees, notices, library, hostel, transport, placements, and an AI Campus Assistant — all from one secure platform.',
            sections: [
                {
                    type: 'text',
                    label: 'WHY THIS PORTAL',
                    title: 'Unifying the Student Experience',
                    desc: 'Many institutions still rely on scattered communication, manual records, paper notices, and disconnected systems. Students waste valuable time navigating fragmented processes instead of focusing on learning.\n\nThe Student Portal unifies every academic service into one secure digital workspace — providing instant access to important information while reducing administrative workload and improving the overall student experience.'
                },
                {
                    type: 'timeline',
                    label: 'REGISTRATION WORKFLOW',
                    title: 'Getting Started',
                    steps: [
                        { title: 'Create Account', desc: 'Enter Full Name, USN, Department, Semester, Mobile Number, Email, and Password' },
                        { title: 'Pending Verification', desc: 'Your registration is sent to the administrator for review and approval' },
                        { title: 'Administrator Approval', desc: 'The administrator verifies your details and activates your account' },
                        { title: 'Portal Activated', desc: 'Login using your USN and Password to access your personalized dashboard' }
                    ]
                },
                {
                    type: 'cards',
                    label: 'DASHBOARD PREVIEW',
                    title: 'Your Personal Dashboard',
                    desc: 'A premium concept preview of the student dashboard experience.',
                    cards: [
                        { icon: '📅', title: "Today's Classes", desc: 'View your schedule for the day' },
                        { icon: '📊', title: 'Attendance', desc: 'Track subject-wise attendance' },
                        { icon: '📝', title: 'Assignments', desc: 'Submit and track assignments' },
                        { icon: '📈', title: 'Internal Marks', desc: 'View IA marks and performance' },
                        { icon: '📢', title: 'Notices', desc: 'Department and college announcements' },
                        { icon: '💰', title: 'Fee Status', desc: 'Track fee payments' },
                        { icon: '📚', title: 'Library', desc: 'Search catalog and track books' },
                        { icon: '🏠', title: 'Hostel', desc: 'Room allocation and complaints' },
                        { icon: '🚌', title: 'Transport', desc: 'Bus routes and timings' },
                        { icon: '💼', title: 'Placements', desc: 'Drive notifications and eligibility' },
                        { icon: '📆', title: 'Calendar', desc: 'Academic events and exams' },
                        { icon: '🤖', title: 'AI Assistant', desc: 'Ask anything about campus' }
                    ]
                },
                {
                    type: 'chat',
                    label: 'AI CAMPUS ASSISTANT',
                    title: 'Ask the AI Anything',
                    desc: 'A conversational AI assistant that understands your academic context.',
                    messages: [
                        { role: 'user', text: '"When is my next class?"' },
                        { role: 'ai', text: 'Digital Signal Processing\n10:30 AM · Room 304 · Dr. Ramesh\nStarts in 27 minutes.' },
                        { role: 'user', text: '"What is my attendance?"' },
                        { role: 'ai', text: 'Overall Attendance: 84.2%\nLowest: Maths (72%) — needs improvement\nHighest: DSP (96%)\n5 subjects above 75% threshold.' },
                        { role: 'user', text: '"Any new notices?"' },
                        { role: 'ai', text: '3 new notices today:\n• Placement Cell — Campus drive by Infosys\n• Exam Cell — Internal exam schedule released\n• ECE Dept — Project submission deadline extended' }
                    ]
                },
                {
                    type: 'pills',
                    label: 'FEATURES INCLUDED',
                    title: 'Everything in One Place',
                    pills: ["Today's Classes", 'Weekly Timetable', 'Attendance Tracker', 'Assignments', 'Internal Marks', 'Fee Status', 'Department Notices', 'Academic Calendar', 'Library Services', 'Placement Drives', 'Transport Routes', 'Hostel Info', 'AI Campus Assistant', 'Secure Login', 'Mobile Responsive', 'Real-time Updates']
                },
                {
                    type: 'cards',
                    label: 'COMING SOON',
                    title: 'Future Features',
                    cards: [
                        { icon: '🎙️', title: 'Voice AI', desc: 'Hands-free campus queries' },
                        { icon: '📱', title: 'QR Attendance', desc: 'Scan and mark attendance' },
                        { icon: '🪪', title: 'Digital Student ID', desc: 'Virtual identity card' },
                        { icon: '🗺️', title: 'Campus Navigation', desc: 'Indoor wayfinding' },
                        { icon: '🎓', title: 'Scholarship Guidance', desc: 'AI-matched opportunities' },
                        { icon: '📖', title: 'Smart Study Planner', desc: 'Personalized study schedule' }
                    ]
                }
            ],
            cta: { title: 'One Login. Every Academic Service.', desc: 'One Intelligent Experience.' }
        },

        faculty: {
            badge: 'FACULTY PORTAL',
            title: 'Your Intelligent <span>Teaching Workspace</span>',
            desc: 'Manage classes, attendance, assignments, student performance, teaching materials, and collaborate with an AI Faculty Assistant.',
            sections: [
                {
                    type: 'text',
                    label: 'WHY THIS PORTAL',
                    title: 'Empowering Educators',
                    desc: 'Faculty often deal with manual attendance registers, paper-based assignment tracking, and fragmented communication with students and administration.\n\nThe Faculty Portal consolidates all teaching responsibilities into one intelligent workspace — enabling faculty to focus on education rather than administrative tasks.'
                },
                {
                    type: 'timeline',
                    label: 'AUTHENTICATION',
                    title: 'Faculty Onboarding',
                    steps: [
                        { title: 'Admin Creates Account', desc: 'Administrator registers the faculty member with department, designation, and credentials' },
                        { title: 'Faculty Receives Credentials', desc: 'Secure login credentials are shared via institutional email' },
                        { title: 'First Login & Setup', desc: 'Faculty configures subjects, class schedules, and notification preferences' },
                        { title: 'Portal Ready', desc: 'Access the full teaching dashboard with all assigned classes and tools' }
                    ]
                },
                {
                    type: 'cards',
                    label: 'DASHBOARD PREVIEW',
                    title: 'Faculty Command Center',
                    desc: 'A premium concept preview of the faculty dashboard experience.',
                    cards: [
                        { icon: '📅', title: "Today's Classes", desc: 'View and manage daily schedule' },
                        { icon: '📋', title: 'Attendance', desc: 'Mark and track class attendance' },
                        { icon: '📝', title: 'Assignments', desc: 'Create, distribute, and grade' },
                        { icon: '📊', title: 'Internal Marks', desc: 'Enter and publish IA marks' },
                        { icon: '📂', title: 'Teaching Materials', desc: 'Upload notes, slides, resources' },
                        { icon: '📈', title: 'Student Analytics', desc: 'Performance trends and insights' },
                        { icon: '📢', title: 'Announcements', desc: 'Send notices to students' },
                        { icon: '🤖', title: 'AI Assistant', desc: 'Teaching workflow automation' }
                    ]
                },
                {
                    type: 'cards',
                    label: 'ATTENDANCE & ASSIGNMENTS',
                    title: 'Streamlined Workflows',
                    cols2: true,
                    cards: [
                        { icon: '✅', title: 'Digital Attendance', desc: 'Mark attendance digitally for each class. View subject-wise reports. Students below 75% are flagged automatically.' },
                        { icon: '📎', title: 'Assignment Management', desc: 'Create assignments with deadlines, attach resources, track submissions, and grade — all from one interface.' }
                    ]
                },
                {
                    type: 'chat',
                    label: 'AI FACULTY ASSISTANT',
                    title: 'Your Teaching AI',
                    desc: 'An AI assistant that understands your teaching schedule and student data.',
                    messages: [
                        { role: 'user', text: '"Show today\'s classes"' },
                        { role: 'ai', text: 'Today — 3 classes scheduled:\n• Digital Electronics — 10:00 AM — Room 304\n• VLSI Design — 1:00 PM — Room 201\n• DSP Lab — 3:00 PM — Lab C2' },
                        { role: 'user', text: '"Students below 75% in DSP?"' },
                        { role: 'ai', text: '4 students below threshold:\n• Rahul K — 68%\n• Priya M — 71%\n• Ahmed S — 62%\n• Sneha R — 73%\nRecommendation: Send attendance warning notice.' },
                        { role: 'user', text: '"Generate assignment announcement"' },
                        { role: 'ai', text: 'Draft created:\n"Assignment 3: VLSI Design\nTopic: CMOS Logic Design\nDeadline: July 18, 2026\nSubmit via portal."\n\nReady to publish to 5th Sem ECE students.' }
                    ]
                },
                {
                    type: 'pills',
                    label: 'FEATURES INCLUDED',
                    title: 'Everything Faculty Needs',
                    pills: ["Today's Classes", 'Attendance Marking', 'Assignment Creation', 'Internal Marks Entry', 'Teaching Materials', 'Student Analytics', 'Announcements', 'Schedule Management', 'AI Faculty Assistant', 'Report Generation']
                },
                {
                    type: 'cards',
                    label: 'COMING SOON',
                    title: 'Future Features',
                    cards: [
                        { icon: '📊', title: 'Auto-Generated Reports', desc: 'AI-powered class and student reports' },
                        { icon: '🧠', title: 'Smart Lesson Planner', desc: 'AI-assisted curriculum planning' },
                        { icon: '📹', title: 'Lecture Recording', desc: 'Integrated class recording system' },
                        { icon: '🔔', title: 'Smart Notifications', desc: 'Automated deadline reminders' }
                    ]
                }
            ],
            cta: { title: 'One Dashboard. Every Teaching Tool.', desc: 'Intelligent faculty management.' }
        },

        admin: {
            badge: 'ADMINISTRATOR PORTAL',
            title: 'The Intelligent <span>Command Center</span>',
            desc: 'Manage students, faculty, admissions, placements, library, hostel, transport, website content, analytics, and the AI Campus Brain — all from one control center.',
            sections: [
                {
                    type: 'text',
                    label: 'WHY THIS PORTAL',
                    title: 'Centralizing Institutional Control',
                    desc: 'Running an engineering institution involves coordinating dozens of departments, thousands of students, hundreds of faculty, and countless administrative processes.\n\nThe Administrator Portal provides a unified command center where every aspect of the institution can be monitored, managed, and optimized — turning complex operations into streamlined workflows.'
                },
                {
                    type: 'timeline',
                    label: 'VERIFICATION WORKFLOW',
                    title: 'Student & Faculty Verification',
                    steps: [
                        { title: 'New Registration Received', desc: 'Student or faculty member submits their registration through the portal' },
                        { title: 'Administrator Review', desc: 'Verify submitted details — USN, department, designation, and documents' },
                        { title: 'Approve or Reject', desc: 'Activate the account or reject with a reason for re-submission' },
                        { title: 'Account Activated', desc: 'User receives confirmation and can access their personalized portal' }
                    ]
                },
                {
                    type: 'cards',
                    label: 'MANAGEMENT MODULES',
                    title: 'Complete Institutional Control',
                    desc: 'Every aspect of the institution managed from one dashboard.',
                    cards: [
                        { icon: '🎓', title: 'Student Management', desc: 'Admissions, records, verification, and academic tracking' },
                        { icon: '👨‍🏫', title: 'Faculty Management', desc: 'Faculty onboarding, assignments, and performance tracking' },
                        { icon: '📖', title: 'Academic Management', desc: 'Departments, subjects, timetables, and examination schedules' },
                        { icon: '💼', title: 'Placement Management', desc: 'Company coordination, drives, student eligibility, and results' },
                        { icon: '📚', title: 'Library Management', desc: 'Catalog, issue/return tracking, digital resources, and fines' },
                        { icon: '🏠', title: 'Hostel Management', desc: 'Room allocation, mess management, complaints, and attendance' },
                        { icon: '🚌', title: 'Transport Management', desc: 'Bus routes, driver assignments, schedules, and fee collection' },
                        { icon: '🌐', title: 'Website CMS', desc: 'Manage homepage content, notices, events, and media gallery' }
                    ]
                },
                {
                    type: 'chat',
                    label: 'AI CAMPUS BRAIN',
                    title: 'The Institutional AI',
                    desc: 'An AI that understands every system in the institution and can generate reports, create notices, and analyze trends.',
                    messages: [
                        { role: 'user', text: '"Generate monthly attendance report"' },
                        { role: 'ai', text: 'Monthly Attendance Report — June 2026:\n• Average attendance: 81.3%\n• Lowest: Mechanical (74.2%)\n• Highest: CSE (88.6%)\n• 23 students below 75% threshold.\nReport PDF generated and ready to download.' },
                        { role: 'user', text: '"Publish new admission notice"' },
                        { role: 'ai', text: 'Draft admission notice created:\n"Admissions Open 2026-27\nB.E. Programs — CSE, ECE, ME, CE, EEE, ISE\nApply via KEA CET / COMEDK"\n\nReady to publish on website and student portal.' },
                        { role: 'user', text: '"Upcoming placement drives?"' },
                        { role: 'ai', text: '3 drives scheduled this month:\n• Infosys — July 15 — CSE, ISE\n• Wipro — July 20 — All branches\n• Bosch — July 25 — ECE, ME\n142 eligible students registered.' }
                    ]
                },
                {
                    type: 'cards',
                    label: 'ANALYTICS & INSIGHTS',
                    title: 'Data-Driven Decisions',
                    cards: [
                        { icon: '📈', title: 'Enrollment Trends', desc: 'Year-over-year admission statistics' },
                        { icon: '📊', title: 'Attendance Analytics', desc: 'Department-wise attendance patterns' },
                        { icon: '🏆', title: 'Placement Statistics', desc: 'Company-wise and branch-wise data' },
                        { icon: '💡', title: 'Performance Insights', desc: 'Student and faculty performance trends' }
                    ]
                },
                {
                    type: 'cards',
                    label: 'COMING SOON',
                    title: 'Future Automation',
                    cards: [
                        { icon: '⚡', title: 'Auto-Scheduling', desc: 'AI-generated optimal timetables' },
                        { icon: '📄', title: 'Document Automation', desc: 'Auto-generate certificates and letters' },
                        { icon: '🔮', title: 'Predictive Analytics', desc: 'Enrollment and dropout predictions' },
                        { icon: '🤝', title: 'Parent Portal', desc: 'Guardian access to student data' },
                        { icon: '📱', title: 'Mobile Admin App', desc: 'Manage institution on the go' },
                        { icon: '🛡️', title: 'Audit Trail', desc: 'Complete activity logging and compliance' }
                    ]
                }
            ],
            cta: { title: 'One Platform. Complete Control.', desc: 'The future of institutional management.' }
        }
    };


    // =========================================================================
    // 3. UTILITY HELPERS
    // =========================================================================

    function el(tag, cls, html) {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (html) node.innerHTML = html;
        return node;
    }


    // =========================================================================
    // 4. CREATE TRIGGER BUTTON + POPUP
    // =========================================================================

    function createTrigger() {
        // Wrapper
        const wrapper = el('div', 'eco-trigger');
        wrapper.id = 'eco-trigger';

        // Button
        const btn = el('button', 'eco-trigger-btn');
        btn.id = 'eco-trigger-btn';
        btn.setAttribute('aria-label', 'Open Portals');
        btn.innerHTML = `
            <span class="eco-trigger-icon">${ICONS.portals}</span>
            <span class="eco-trigger-text">Portals</span>
        `;

        // Popup
        const popup = el('div', 'eco-popup');
        popup.id = 'eco-popup';

        const items = [
            { key: 'student', icon: ICONS.student, title: 'Student Portal', desc: 'Academic workspace' },
            { key: 'faculty', icon: ICONS.faculty, title: 'Faculty Portal', desc: 'Teaching dashboard' },
            { key: 'admin',   icon: ICONS.admin,   title: 'Administrator Portal', desc: 'Institutional control' }
        ];

        items.forEach((item, i) => {
            if (i > 0) popup.appendChild(el('div', 'eco-popup-divider'));

            const row = el('button', 'eco-popup-item');
            row.setAttribute('data-portal', item.key);
            row.innerHTML = `
                <div class="eco-popup-item-icon">${item.icon}</div>
                <div class="eco-popup-item-info">
                    <div class="eco-popup-item-title">${item.title}</div>
                    <div class="eco-popup-item-desc">${item.desc}</div>
                </div>
            `;
            row.addEventListener('click', () => {
                closePopup();
                openModal(item.key);
            });
            popup.appendChild(row);
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(popup);
        document.body.appendChild(wrapper);

        // Toggle popup
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = popup.classList.contains('active');
            if (isOpen) closePopup();
            else openPopup();
        });

        // Close popup on outside click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) closePopup();
        });

        // Close popup on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePopup();
        });
    }

    function openPopup() {
        const btn = document.getElementById('eco-trigger-btn');
        const popup = document.getElementById('eco-popup');
        if (!btn || !popup) return;
        btn.classList.add('active');
        popup.classList.add('active');
    }

    function closePopup() {
        const btn = document.getElementById('eco-trigger-btn');
        const popup = document.getElementById('eco-popup');
        if (!btn || !popup) return;
        btn.classList.remove('active');
        popup.classList.remove('active');
    }


    // =========================================================================
    // 5. MODAL BUILDER — Creates the fullscreen presentation from data
    // =========================================================================

    function buildModalHTML(portalKey) {
        const data = PORTALS[portalKey];
        if (!data) return '';

        let html = '';

        // --- Hero ---
        html += `
            <div class="eco-m-hero eco-reveal">
                <div class="eco-m-badge">
                    <span class="eco-m-badge-dot"></span>
                    <span class="eco-m-badge-text">${data.badge}</span>
                </div>
                <h1 class="eco-m-hero-title">${data.title}</h1>
                <p class="eco-m-hero-desc">${data.desc}</p>
            </div>
        `;

        // --- Sections ---
        data.sections.forEach(section => {
            html += `<div class="eco-m-section eco-reveal">`;
            html += `<div class="eco-m-label">${section.label}</div>`;
            html += `<h2 class="eco-m-title">${section.title}</h2>`;

            if (section.desc) {
                const descParagraphs = section.desc.split('\n\n').map(p => `<p class="eco-m-desc">${p.replace(/\n/g, '<br>')}</p>`).join('');
                html += descParagraphs;
            }

            // Type-specific content
            switch (section.type) {
                case 'timeline':
                    html += `<div class="eco-m-timeline eco-reveal-stagger">`;
                    section.steps.forEach(step => {
                        html += `
                            <div class="eco-m-step">
                                <div class="eco-m-step-dot"></div>
                                <div class="eco-m-step-title">${step.title}</div>
                                <div class="eco-m-step-desc">${step.desc}</div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                    break;

                case 'cards':
                    html += `<div class="eco-m-cards${section.cols2 ? ' cols-2' : ''} eco-reveal-stagger">`;
                    section.cards.forEach(card => {
                        html += `
                            <div class="eco-m-card">
                                <span class="eco-m-card-icon">${card.icon}</span>
                                <div class="eco-m-card-title">${card.title}</div>
                                <div class="eco-m-card-desc">${card.desc}</div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                    break;

                case 'chat':
                    html += `<div class="eco-m-chat eco-reveal-stagger">`;
                    section.messages.forEach(msg => {
                        if (msg.role === 'user') {
                            html += `<div class="eco-m-chat-user">${msg.text}</div>`;
                        } else {
                            html += `
                                <div class="eco-m-chat-ai">
                                    <div class="eco-m-chat-ai-tag">AI Campus Assistant</div>
                                    ${msg.text.replace(/\n/g, '<br>')}
                                </div>
                            `;
                        }
                    });
                    html += `</div>`;
                    break;

                case 'pills':
                    html += `<div class="eco-m-pills eco-reveal-stagger">`;
                    section.pills.forEach(pill => {
                        html += `<span class="eco-m-pill">${pill}</span>`;
                    });
                    html += `</div>`;
                    break;

                // 'text' type has no extra content beyond desc
            }

            html += `</div>`;
        });

        // --- CTA ---
        if (data.cta) {
            html += `
                <div class="eco-m-cta eco-reveal">
                    <div class="eco-m-cta-title">${data.cta.title}</div>
                    <div class="eco-m-cta-desc">${data.cta.desc}</div>
                </div>
            `;
        }

        return html;
    }


    // =========================================================================
    // 6. MODAL OPEN / CLOSE
    // =========================================================================

    let activeModal = null;
    let activeOverlay = null;
    let activeCloseBtn = null;
    let activeThemeBtn = null;
    let scrollObserver = null;
    let isLightTheme = false;

    function openModal(portalKey) {
        // Prevent duplicate modals
        if (activeModal) closeModal();

        // Create overlay
        activeOverlay = el('div', 'eco-overlay');
        activeOverlay.addEventListener('click', closeModal);
        document.body.appendChild(activeOverlay);

        // Create modal
        activeModal = el('div', 'eco-modal');
        activeModal.id = 'eco-modal';

        const inner = el('div', 'eco-modal-inner');
        inner.innerHTML = buildModalHTML(portalKey);
        activeModal.appendChild(inner);
        document.body.appendChild(activeModal);

        // Create close button
        activeCloseBtn = el('button', 'eco-modal-close');
        activeCloseBtn.setAttribute('aria-label', 'Close modal');
        activeCloseBtn.innerHTML = ICONS.close;
        activeCloseBtn.addEventListener('click', closeModal);
        document.body.appendChild(activeCloseBtn);

        // Create theme toggle button (draggable)
        activeThemeBtn = el('button', 'eco-theme-toggle');
        activeThemeBtn.id = 'eco-theme-toggle';
        activeThemeBtn.setAttribute('aria-label', 'Toggle light/dark theme');
        activeThemeBtn.innerHTML = `
            <span class="eco-theme-icon eco-theme-icon--sun">${ICONS.themeSun}</span>
            <span class="eco-theme-icon eco-theme-icon--moon">${ICONS.themeMoon}</span>
            <span class="eco-theme-label">Light</span>
        `;
        activeThemeBtn.addEventListener('click', togglePortalTheme);
        document.body.appendChild(activeThemeBtn);
        makeDraggable(activeThemeBtn);

        // Apply saved theme state
        if (isLightTheme) {
            activeModal.classList.add('eco-light');
            activeThemeBtn.classList.add('eco-light-active');
            activeThemeBtn.querySelector('.eco-theme-label').textContent = 'Dark';
        }

        // Lock body scroll
        document.body.style.overflow = 'hidden';

        // Trigger animations (next frame)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                activeOverlay.classList.add('active');
                activeModal.classList.add('active');
                activeCloseBtn.classList.add('active');
                activeThemeBtn.classList.add('active');
            });
        });

        // Setup scroll reveal observer
        setupScrollReveal();

        // Close on Escape
        document.addEventListener('keydown', handleEscapeKey);
    }

    function closeModal() {
        if (!activeModal) return;

        // Animate out
        if (activeOverlay) activeOverlay.classList.remove('active');
        if (activeModal) activeModal.classList.remove('active');
        if (activeCloseBtn) activeCloseBtn.classList.remove('active');
        if (activeThemeBtn) activeThemeBtn.classList.remove('active');

        // Destroy observer
        if (scrollObserver) {
            scrollObserver.disconnect();
            scrollObserver = null;
        }

        // Remove from DOM after animation
        const overlay = activeOverlay;
        const modal = activeModal;
        const closeBtn = activeCloseBtn;
        const themeBtn = activeThemeBtn;

        setTimeout(() => {
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
            if (closeBtn && closeBtn.parentNode) closeBtn.parentNode.removeChild(closeBtn);
            if (themeBtn && themeBtn.parentNode) themeBtn.parentNode.removeChild(themeBtn);
        }, 600);

        activeOverlay = null;
        activeModal = null;
        activeCloseBtn = null;
        activeThemeBtn = null;

        // Restore body scroll
        document.body.style.overflow = '';

        // Remove escape listener
        document.removeEventListener('keydown', handleEscapeKey);
    }

    function handleEscapeKey(e) {
        if (e.key === 'Escape') closeModal();
    }


    // =========================================================================
    // THEME TOGGLE — Switch between dark and light portal theme
    // =========================================================================

    function togglePortalTheme(e) {
        // Don't toggle if user was dragging
        if (activeThemeBtn && activeThemeBtn._wasDragged) {
            activeThemeBtn._wasDragged = false;
            return;
        }
        isLightTheme = !isLightTheme;
        if (activeModal) activeModal.classList.toggle('eco-light', isLightTheme);
        if (activeThemeBtn) {
            activeThemeBtn.classList.toggle('eco-light-active', isLightTheme);
            activeThemeBtn.querySelector('.eco-theme-label').textContent = isLightTheme ? 'Dark' : 'Light';
        }
    }


    // =========================================================================
    // DRAGGABLE — Make the theme button repositionable
    // =========================================================================

    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let hasMoved = false;

        function onPointerDown(e) {
            if (e.button !== 0) return; // left click only
            isDragging = true;
            hasMoved = false;
            element._wasDragged = false;
            startX = e.clientX;
            startY = e.clientY;

            const rect = element.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            element.style.transition = 'none';
            element.setPointerCapture(e.pointerId);
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            // Clamp within viewport
            const w = element.offsetWidth;
            const h = element.offsetHeight;
            newLeft = Math.max(0, Math.min(window.innerWidth - w, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - h, newTop));

            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
            element.style.right = 'auto';
            element.classList.add('eco-dragging');
        }

        function onPointerUp(e) {
            if (!isDragging) return;
            isDragging = false;
            element.style.transition = '';
            element.classList.remove('eco-dragging');
            if (hasMoved) element._wasDragged = true;
        }

        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerup', onPointerUp);
    }


    // =========================================================================
    // 7. SCROLL REVEAL — IntersectionObserver for modal sections
    // =========================================================================

    function setupScrollReveal() {
        if (!activeModal) return;

        const revealEls = activeModal.querySelectorAll('.eco-reveal, .eco-reveal-stagger');

        scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            root: activeModal,
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealEls.forEach(el => scrollObserver.observe(el));
    }


    // =========================================================================
    // 8. INITIALIZATION
    // =========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createTrigger);
    } else {
        createTrigger();
    }

})();
