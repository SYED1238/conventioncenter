/**
 * AI Campus Intelligence — Immersive Interface Engine
 * Ghousia College of Engineering
 * 
 * Architecture:
 *   Orb Controller → Panel Lifecycle → Boot Sequence → Welcome → Conversation → Voice
 *   All self-contained in a single IIFE. Zero global pollution.
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. CAMPUS KNOWLEDGE BASE — Pre-built responses
    // =========================================================================

    const campusKnowledge = {
        'admissions': {
            query: '🎓 Admissions',
            response: `Ghousia College of Engineering offers admissions through multiple pathways:\n\n**Undergraduate Programs (B.E.)**\n• Computer Science & Engineering\n• Electronics & Communication Engineering\n• Mechanical Engineering\n• Civil Engineering\n• Electrical & Electronics Engineering\n• Information Science & Engineering\n\n**Admission Process**\nAdmissions are conducted through the Karnataka Examinations Authority (KEA) via CET and COMEDK counselling. Management quota seats are also available.\n\n**Key Dates (2026-27)**\n• CET Counselling: July – August\n• COMEDK Counselling: August\n• Direct Admission: Open until seats are filled\n\n**Documents Required**\n• 10th & 12th Mark Sheets\n• CET/COMEDK Rank Card\n• Transfer Certificate\n• Migration Certificate\n• Passport-size Photographs\n\nFor detailed admission guidance, contact the admissions office at the main campus or visit during working hours (9 AM – 5 PM).`
        },
        'faculty': {
            query: '🧑‍🏫 Faculty',
            response: `Our campus is home to a distinguished faculty of over 150 educators, researchers, and industry professionals.\n\n**Faculty Highlights**\n• 25+ PhD holders across departments\n• Faculty members with publications in IEEE, Springer, and Elsevier journals\n• Industry-experienced professors from companies like Infosys, Wipro, and TCS\n• Regular faculty development programs and research grants\n\n**Department-wise Leadership**\n• CSE: Experienced faculty specializing in AI, Machine Learning, and Cloud Computing\n• ECE: Experts in VLSI Design, Embedded Systems, and Signal Processing\n• Mechanical: Specialists in Thermal Engineering, CAD/CAM, and Robotics\n• Civil: Professionals in Structural Engineering and Environmental Sciences\n\n**Faculty-Student Ratio**\nWe maintain a healthy 1:15 faculty-to-student ratio, ensuring personalized attention and mentorship for every student.\n\nFaculty profiles and contact details are available at the department offices.`
        },
        'departments': {
            query: '📚 Departments',
            response: `Ghousia College of Engineering houses six major engineering departments, each with state-of-the-art infrastructure.\n\n**Departments**\n\n🖥️ **Computer Science & Engineering**\nFocuses on AI, Data Science, Web Technologies, and Software Engineering. Modern computing labs with 200+ workstations.\n\n📡 **Electronics & Communication**\nSpecializes in VLSI, IoT, Embedded Systems, and Communication Networks. Advanced signal processing and RF labs.\n\n⚙️ **Mechanical Engineering**\nCovers Manufacturing, Thermal Sciences, CAD/CAM, and Robotics. Fully equipped workshop and CNC training center.\n\n🏗️ **Civil Engineering**\nFocuses on Structural Analysis, Geotechnical Engineering, and Environmental Engineering. Concrete and material testing labs.\n\n⚡ **Electrical & Electronics**\nSpecializes in Power Systems, Control Systems, and Renewable Energy. High-voltage and electrical machines labs.\n\n💻 **Information Science & Engineering**\nCovers Database Systems, Network Security, Cloud Computing, and Full-Stack Development.\n\nAll departments are affiliated to VTU, Belagavi and accredited by AICTE.`
        },
        'laboratories': {
            query: '🧪 Laboratories',
            response: `Our campus features 40+ specialized laboratories designed for cutting-edge research and hands-on learning.\n\n**Flagship Labs**\n\n🔬 **Advanced Computing Lab**\nEquipped with high-performance workstations, GPU clusters for AI/ML training, and cloud computing infrastructure.\n\n🤖 **Robotics & Automation Lab**\nIndustrial robots, 3D printers, Arduino/Raspberry Pi stations, and drone development kits.\n\n📊 **Data Science & Analytics Lab**\nDedicated servers for big data processing, Hadoop clusters, and visualization workstations.\n\n🔧 **CNC & Manufacturing Lab**\nCNC machines, lathe machines, milling machines, and precision measurement instruments.\n\n⚡ **Power Electronics Lab**\nAdvanced inverters, converters, SCADA systems, and PLC programming stations.\n\n🌐 **Networking & Security Lab**\nCisco networking equipment, penetration testing setups, and cybersecurity simulation tools.\n\n**Lab Hours**: Monday – Saturday, 8:30 AM – 5:30 PM\nAll labs are air-conditioned and equipped with high-speed internet.`
        },
        'navigation': {
            query: '📍 Campus Navigation',
            response: `Ghousia College of Engineering spans a beautiful 15-acre campus in Ramanagaram, Karnataka.\n\n**Campus Layout**\n\n🏛️ **Main Block** (Building A)\nAdministration, Principal's Office, Conference Halls, Admissions Office\n\n📚 **Academic Block** (Building B & C)\nClassrooms, Seminar Halls, Department Offices, Faculty Rooms\n\n🧪 **Lab Complex** (Building D)\nAll engineering laboratories, Research Centers, Innovation Hub\n\n📖 **Central Library**\n30,000+ books, digital library with IEEE/Springer access, reading rooms, discussion zones\n\n🏟️ **Sports Complex**\nCricket ground, basketball court, volleyball court, indoor games, gymnasium\n\n🏠 **Hostel Block**\nSeparate boys' and girls' hostels with 500+ bed capacity\n\n🍽️ **Cafeteria & Canteen**\nMain canteen, juice center, and snack counters\n\n**Campus Address**\nGhousia College of Engineering\nRamanagaram, Karnataka 562159\n\nThe campus is located just 50 km from Bengaluru, easily accessible via the Mysuru Highway (NH-275).`
        },
        'transportation': {
            query: '🚌 Transportation',
            response: `The college operates a comprehensive transport network connecting students from across the region.\n\n**Bus Routes**\n• 15+ dedicated college buses\n• Routes covering Bengaluru, Channapatna, Mandya, Mysuru, and surrounding towns\n• GPS-tracked buses for real-time location monitoring\n\n**Route Highlights**\n🚌 Route 1: Bengaluru (Majestic) → Ramanagaram Campus\n🚌 Route 2: Kengeri → Bidadi → Ramanagaram Campus\n🚌 Route 3: Channapatna → Ramanagaram Campus\n🚌 Route 4: Mandya → Maddur → Ramanagaram Campus\n🚌 Route 5: Mysuru → Ramanagaram Campus\n\n**Timings**\n• Morning pickup: 7:00 AM – 8:30 AM\n• Evening drop: 5:00 PM – 6:30 PM\n\n**Transport Fees**\nFees vary by distance. Contact the transport office for exact pricing.\n\n**How to Reach by Self**\n• By Road: NH-275 (Bengaluru-Mysuru Highway), Ramanagaram exit\n• By Train: Ramanagaram Railway Station (2 km from campus)\n• By Bus: KSRTC buses to Ramanagaram town`
        },
        'hostel': {
            query: '🏠 Hostel',
            response: `Our residential facilities provide a safe, comfortable, and enriching living experience for students.\n\n**Accommodation**\n• Separate hostels for boys and girls\n• 500+ bed capacity across multiple blocks\n• Double and triple sharing rooms available\n• Fully furnished rooms with beds, study tables, wardrobes, and fans\n\n**Facilities**\n🛡️ 24/7 security with CCTV surveillance\n📶 Wi-Fi connectivity across all hostel blocks\n🔌 Uninterrupted power supply with generator backup\n🧺 Laundry services available\n💧 24/7 hot and cold water supply\n📺 Common room with TV and indoor games\n📖 Dedicated study halls for night study\n\n**Mess & Food**\n• Hygienic mess serving vegetarian and non-vegetarian meals\n• Breakfast, lunch, evening snacks, and dinner included\n• Special meals on weekends and festivals\n\n**Hostel Fees (Per Year)**\nApproximate range: ₹45,000 – ₹65,000 (varies by room type)\n\nHostel admissions open alongside academic admissions. Priority is given to outstation students.`
        },
        'cafeteria': {
            query: '🍽 Cafeteria',
            response: `The campus cafeteria is a vibrant hub for students, serving fresh and affordable meals throughout the day.\n\n**Main Canteen**\n• Capacity: 300+ seats\n• Serves breakfast, lunch, and evening snacks\n• Both vegetarian and non-vegetarian options\n• Clean, hygienic kitchen with FSSAI certification\n\n**Menu Highlights**\n🍛 South Indian thali – ₹60\n🍝 Noodles & Chinese – ₹40-70\n🍕 Snacks & Fast Food – ₹20-50\n☕ Tea & Coffee – ₹10-15\n🥤 Fresh juices & Milkshakes – ₹25-40\n\n**Timings**\n• Breakfast: 7:30 AM – 9:30 AM\n• Lunch: 12:00 PM – 2:00 PM\n• Snacks: 3:30 PM – 5:00 PM\n• Evening: 5:00 PM – 7:00 PM (juice & snack counters)\n\n**Additional Outlets**\n• Juice corner near the library\n• Tea stall at the engineering block\n• Stationery and xerox shop inside the canteen building\n\nThe cafeteria is a popular hangout spot, especially during breaks!`
        },
        'events': {
            query: '🎉 Events',
            response: `Ghousia College of Engineering hosts a dynamic calendar of technical, cultural, and sports events year-round.\n\n**Annual Flagship Events**\n\n🎪 **TechFest (GHOUSIA TECH SUMMIT)**\nThe annual technical festival featuring coding competitions, hackathons, robotics challenges, paper presentations, and workshops. Attracts participants from 50+ colleges across Karnataka.\n\n🎭 **Cultural Fest (GHOUSIA UTSAV)**\nA 3-day extravaganza with music, dance, drama, fashion shows, and literary events. Features celebrity performances and DJ nights.\n\n🏆 **Sports Meet (GHOUSIA OLYMPIAD)**\nInter-college sports tournament covering cricket, football, basketball, volleyball, athletics, and indoor games.\n\n**Regular Events**\n• Monthly coding contests and tech talks\n• Industry expert guest lectures\n• Workshop series on emerging technologies\n• NSS and community service drives\n• Innovation and startup pitch competitions\n\n**Student Clubs**\n• Coding Club • Robotics Club • Literary Club\n• Photography Club • Music Club • Entrepreneurship Cell\n\nStay updated through the campus notice boards and official social media channels!`
        },
        'placements': {
            query: '💼 Placements',
            response: `Our Training & Placement Cell works tirelessly to connect students with top recruiters and career opportunities.\n\n**Placement Highlights (2025-26)**\n• 85%+ placement rate across all branches\n• 120+ companies visited for campus recruitment\n• Highest package: ₹12 LPA\n• Average package: ₹4.5 LPA\n\n**Top Recruiters**\n🏢 Infosys • Wipro • TCS • Cognizant • HCL\n🏢 Accenture • Capgemini • Mphasis • L&T Infotech\n🏢 Amazon • Flipkart (internships)\n🏢 Bosch • Toyota Kirloskar • Caterpillar\n\n**Placement Support**\n• Pre-placement training from 5th semester\n• Aptitude and soft skills workshops\n• Mock interviews and group discussions\n• Resume building and LinkedIn profile guidance\n• Industry mentorship programs\n\n**Internship Opportunities**\n• Mandatory industry internships in 6th & 7th semesters\n• Partnerships with 50+ companies for internship placements\n• Stipended internships available\n\n**Contact Placement Cell**\nTraining & Placement Office, Main Block\nOpen: Monday – Friday, 9 AM – 5 PM`
        }
    };

    // Fallback response for unknown queries
    const fallbackResponse = `Thank you for your question. While I'm currently operating with a curated knowledge base about Ghousia College of Engineering, I can help you with the following topics:\n\n• 🎓 Admissions & Programs\n• 🧑‍🏫 Faculty Information\n• 📚 Academic Departments\n• 🧪 Laboratories & Research\n• 📍 Campus Navigation & Directions\n• 🚌 Transportation & Routes\n• 🏠 Hostel & Accommodation\n• 🍽 Cafeteria & Dining\n• 🎉 Events & Activities\n• 💼 Placements & Careers\n\nPlease try one of the suggestion chips below, or ask a specific question about any of these topics. In the future, I'll be connected to live campus databases for real-time, personalized responses.`;

    // =========================================================================
    // 2. DOM CREATION — Build all elements programmatically
    // =========================================================================

    function createElements() {
        // -- Floating AI Orb --
        const orbWrapper = document.createElement('div');
        orbWrapper.className = 'ai-orb-wrapper';
        orbWrapper.id = 'ai-orb-wrapper';
        orbWrapper.innerHTML = `
            <button class="ai-orb" id="ai-orb-btn" aria-label="Open Campus Intelligence">
                <span class="ai-orb-glow"></span>
                <span class="ai-orb-glow-outer"></span>
                <svg class="ai-orb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 10v2"/>
                    <circle cx="12" cy="16" r="2"/>
                    <path d="M12 18v2"/>
                    <path d="M8 22h8"/>
                    <path d="M7 8a5 5 0 0 1 0-4"/>
                    <path d="M17 8a5 5 0 0 0 0-4"/>
                    <path d="M5 11a8 8 0 0 1-1-6"/>
                    <path d="M19 11a8 8 0 0 0 1-6"/>
                </svg>
            </button>
            <span class="ai-orb-label">Campus Intelligence</span>
        `;

        // -- Backdrop Overlay --
        const backdrop = document.createElement('div');
        backdrop.className = 'ai-backdrop';
        backdrop.id = 'ai-backdrop';

        // -- Main Panel --
        const panel = document.createElement('div');
        panel.className = 'ai-panel';
        panel.id = 'ai-panel';
        panel.innerHTML = `
            <canvas class="ai-particles-canvas" id="ai-particles-canvas"></canvas>
            
            <div class="ai-panel-header">
                <div class="ai-panel-title-badge">
                    <span class="ai-panel-status-dot"></span>
                    <span class="ai-panel-title-text">Campus Intelligence</span>
                </div>
                <button class="ai-close-btn" id="ai-close-btn" aria-label="Close Campus Intelligence">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="ai-panel-body" id="ai-panel-body">
                <!-- Boot Sequence -->
                <div class="ai-boot-sequence" id="ai-boot-sequence">
                    <div class="ai-boot-title" id="ai-boot-title">Campus Intelligence</div>
                    <div class="ai-boot-subtitle" id="ai-boot-subtitle">Initializing...</div>
                    <div class="ai-boot-phases" id="ai-boot-phases">
                        <div class="ai-boot-phase" data-phase="0">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Campus Knowledge
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="1">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Academic Information
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="2">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Faculty Directory
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="3">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Campus Navigation
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="4">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Connecting Intelligence Core
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                    </div>
                    <div class="ai-boot-ready" id="ai-boot-ready">Campus Intelligence Ready</div>
                </div>

                <!-- Welcome Screen -->
                <div class="ai-welcome" id="ai-welcome">
                    <div class="ai-welcome-greeting" id="ai-welcome-greeting">Hello.</div>
                    <div class="ai-welcome-description" id="ai-welcome-desc">
                        I'm your Campus Intelligence. I'm trained to help students, parents, faculty members, and visitors explore every part of the campus experience.
                    </div>
                    <div class="ai-welcome-divider" id="ai-welcome-divider"></div>
                    <div class="ai-welcome-askme" id="ai-welcome-askme">Ask me anything.</div>
                    <div class="ai-chips-container" id="ai-chips-container">
                        <button class="ai-chip" data-topic="admissions"><span class="ai-chip-emoji">🎓</span> Admissions</button>
                        <button class="ai-chip" data-topic="faculty"><span class="ai-chip-emoji">🧑‍🏫</span> Faculty</button>
                        <button class="ai-chip" data-topic="departments"><span class="ai-chip-emoji">📚</span> Departments</button>
                        <button class="ai-chip" data-topic="laboratories"><span class="ai-chip-emoji">🧪</span> Laboratories</button>
                        <button class="ai-chip" data-topic="navigation"><span class="ai-chip-emoji">📍</span> Campus Navigation</button>
                        <button class="ai-chip" data-topic="transportation"><span class="ai-chip-emoji">🚌</span> Transportation</button>
                        <button class="ai-chip" data-topic="hostel"><span class="ai-chip-emoji">🏠</span> Hostel</button>
                        <button class="ai-chip" data-topic="cafeteria"><span class="ai-chip-emoji">🍽</span> Cafeteria</button>
                        <button class="ai-chip" data-topic="events"><span class="ai-chip-emoji">🎉</span> Events</button>
                        <button class="ai-chip" data-topic="placements"><span class="ai-chip-emoji">💼</span> Placements</button>
                    </div>
                </div>

                <!-- Conversation Stream -->
                <div class="ai-conversation" id="ai-conversation"></div>
            </div>

            <!-- Voice Overlay -->
            <div class="ai-voice-overlay" id="ai-voice-overlay">
                <div class="ai-voice-waveform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                </div>
                <span class="ai-voice-status">Listening...</span>
                <button class="ai-voice-cancel" id="ai-voice-cancel">Cancel</button>
            </div>

            <div class="ai-input-bar">
                <div class="ai-input-wrapper">
                    <input type="text" class="ai-input" id="ai-input" placeholder="Ask anything about the campus..." autocomplete="off" />
                </div>
                <button class="ai-send-btn" id="ai-send-btn" aria-label="Send message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
                <button class="ai-voice-btn" id="ai-voice-btn" aria-label="Voice input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                </button>
            </div>

            <div class="ai-future-panel">
                <div class="ai-future-header" id="ai-future-header">
                    <span class="ai-future-title">Campus Intelligence · Future Capabilities</span>
                    <span class="ai-future-toggle" id="ai-future-toggle">▼</span>
                </div>
                <div class="ai-future-list" id="ai-future-list">
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Live academic database</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Real-time event updates</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Classroom navigation</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Faculty availability</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Attendance integration</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Smart timetable assistant</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Admission guidance</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Placement assistance</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Campus weather sync</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Voice conversations</div>
                </div>
            </div>
        `;

        document.body.appendChild(orbWrapper);
        document.body.appendChild(backdrop);
        document.body.appendChild(panel);
    }

    // =========================================================================
    // 3. STATE
    // =========================================================================

    const aiState = {
        panelOpen: false,
        booted: false,
        conversationActive: false,
        streaming: false,
        voiceListening: false,
        particleAnimFrame: null,
        messages: []
    };

    // =========================================================================
    // 4. PANEL LIFECYCLE
    // =========================================================================

    function openPanel() {
        if (aiState.panelOpen) return;
        aiState.panelOpen = true;

        const backdrop = document.getElementById('ai-backdrop');
        const panel = document.getElementById('ai-panel');

        document.body.classList.add('ai-panel-open');
        backdrop.classList.add('active');

        // Small delay for spring feel
        requestAnimationFrame(() => {
            panel.classList.add('active');
        });

        startParticles();

        // Run boot sequence if first time
        if (!aiState.booted) {
            setTimeout(() => runBootSequence(), 400);
        }

        // Focus input after boot
        setTimeout(() => {
            const input = document.getElementById('ai-input');
            if (input) input.focus();
        }, aiState.booted ? 500 : 4200);
    }

    function closePanel() {
        if (!aiState.panelOpen) return;
        aiState.panelOpen = false;

        const backdrop = document.getElementById('ai-backdrop');
        const panel = document.getElementById('ai-panel');

        panel.classList.remove('active');

        setTimeout(() => {
            backdrop.classList.remove('active');
            document.body.classList.remove('ai-panel-open');
        }, 300);

        stopParticles();
        stopVoice();
    }

    // =========================================================================
    // 5. BOOT SEQUENCE ENGINE
    // =========================================================================

    function runBootSequence() {
        const bootEl = document.getElementById('ai-boot-sequence');
        const titleEl = document.getElementById('ai-boot-title');
        const subtitleEl = document.getElementById('ai-boot-subtitle');
        const readyEl = document.getElementById('ai-boot-ready');
        const phases = document.querySelectorAll('.ai-boot-phase');

        // Show title and subtitle
        setTimeout(() => titleEl.classList.add('visible'), 100);
        setTimeout(() => subtitleEl.classList.add('visible'), 300);

        // Run through phases
        const phaseDelay = 550;
        phases.forEach((phase, i) => {
            setTimeout(() => {
                phase.classList.add('active');
                const fill = phase.querySelector('.ai-boot-progress-fill');
                // Animate progress bar
                requestAnimationFrame(() => {
                    fill.style.width = '100%';
                });
            }, 600 + i * phaseDelay);

            // Mark as completed
            setTimeout(() => {
                phase.classList.add('completed');
            }, 600 + i * phaseDelay + 400);
        });

        // Show ready state
        const totalBootTime = 600 + phases.length * phaseDelay + 300;
        setTimeout(() => {
            readyEl.classList.add('visible');
        }, totalBootTime);

        // Transition to welcome
        setTimeout(() => {
            bootEl.style.display = 'none';
            showWelcome();
            aiState.booted = true;
        }, totalBootTime + 800);
    }

    // =========================================================================
    // 6. WELCOME SCREEN
    // =========================================================================

    function showWelcome() {
        const welcome = document.getElementById('ai-welcome');
        const greeting = document.getElementById('ai-welcome-greeting');
        const desc = document.getElementById('ai-welcome-desc');
        const divider = document.getElementById('ai-welcome-divider');
        const askme = document.getElementById('ai-welcome-askme');
        const chips = document.querySelectorAll('.ai-chip');

        welcome.classList.add('active');

        setTimeout(() => greeting.classList.add('visible'), 100);
        setTimeout(() => desc.classList.add('visible'), 200);
        setTimeout(() => divider.classList.add('visible'), 400);
        setTimeout(() => askme.classList.add('visible'), 500);

        // Stagger chips
        chips.forEach((chip, i) => {
            setTimeout(() => {
                chip.classList.add('visible');
            }, 600 + i * 60);
        });
    }

    // =========================================================================
    // 7. CONVERSATION ENGINE
    // =========================================================================

    function startConversation() {
        if (aiState.conversationActive) return;
        aiState.conversationActive = true;
        document.getElementById('ai-conversation').classList.add('active');
    }

    function addUserMessage(text) {
        startConversation();

        const conv = document.getElementById('ai-conversation');
        const msgEl = document.createElement('div');
        msgEl.className = 'ai-msg-user';
        msgEl.textContent = text;
        conv.appendChild(msgEl);

        aiState.messages.push({ role: 'user', content: text });
        scrollToBottom();
    }

    function addAIResponse(text) {
        const conv = document.getElementById('ai-conversation');
        const body = document.getElementById('ai-panel-body');

        // Show thinking indicator
        const thinkingEl = document.createElement('div');
        thinkingEl.className = 'ai-thinking';
        thinkingEl.innerHTML = `
            <div class="ai-msg-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 10v2"/>
                    <circle cx="12" cy="16" r="2"/>
                </svg>
            </div>
            <div class="ai-thinking-dots">
                <span class="ai-thinking-dot"></span>
                <span class="ai-thinking-dot"></span>
                <span class="ai-thinking-dot"></span>
            </div>
        `;
        conv.appendChild(thinkingEl);
        scrollToBottom();

        // Wait, then stream response
        const thinkDelay = 800 + Math.random() * 600;
        setTimeout(() => {
            conv.removeChild(thinkingEl);
            streamAIMessage(text);
        }, thinkDelay);
    }

    function streamAIMessage(text) {
        aiState.streaming = true;
        const conv = document.getElementById('ai-conversation');

        const msgWrapper = document.createElement('div');
        msgWrapper.className = 'ai-msg-ai';

        const avatar = document.createElement('div');
        avatar.className = 'ai-msg-avatar';
        avatar.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 10v2"/>
                <circle cx="12" cy="16" r="2"/>
            </svg>
        `;

        const content = document.createElement('div');
        content.className = 'ai-msg-content';

        const cursor = document.createElement('span');
        cursor.className = 'ai-cursor';

        content.appendChild(cursor);
        msgWrapper.appendChild(avatar);
        msgWrapper.appendChild(content);
        conv.appendChild(msgWrapper);

        // Parse text into formatted HTML parts
        const lines = text.split('\n');
        let charIndex = 0;
        let lineIndex = 0;
        let currentLineEl = null;
        const allChars = text;

        // Flatten to character streaming
        let displayText = '';
        let i = 0;

        function streamNext() {
            if (i >= allChars.length) {
                // Done streaming
                cursor.remove();
                aiState.streaming = false;
                aiState.messages.push({ role: 'ai', content: text });
                return;
            }

            const char = allChars[i];
            displayText += char;

            // Render formatted text
            content.innerHTML = formatResponse(displayText);
            content.appendChild(cursor);

            i++;
            scrollToBottom();

            // Variable speed
            let delay = 12;
            if (char === '\n') delay = 40;
            else if (char === '.' || char === '!' || char === '?') delay = 60;
            else if (char === ',') delay = 30;
            else if (char === ' ') delay = 8;
            else if (char === '*') delay = 2;

            setTimeout(streamNext, delay);
        }

        streamNext();
    }

    function formatResponse(text) {
        // Convert markdown-like formatting to HTML
        let html = text
            // Bold: **text**
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Bullet points: • text
            .replace(/^• (.+)$/gm, '<div style="padding-left:12px;margin:2px 0;">• $1</div>')
            // Emoji bullet: 🏢 etc at line start
            .replace(/^((?:🏢|🔬|🤖|📊|🔧|⚡|🌐|🛡️|📶|🔌|🧺|💧|📺|📖|🍛|🍝|🍕|☕|🥤|🎪|🎭|🏆|🏛️|📚|🧪|🏟️|🏠|🍽️|🚌|🖥️|📡|⚙️|🏗️|💻)\s.+)$/gm, '<div style="padding-left:8px;margin:2px 0;">$1</div>')
            // Newlines to <br>
            .replace(/\n/g, '<br>');
        return html;
    }

    function scrollToBottom() {
        const body = document.getElementById('ai-panel-body');
        requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight;
        });
    }

    // =========================================================================
    // 8. QUERY MATCHER
    // =========================================================================

    function findResponse(query) {
        const q = query.toLowerCase().trim();

        // Direct topic match
        for (const [key, data] of Object.entries(campusKnowledge)) {
            if (q.includes(key)) return data.response;
        }

        // Keyword matching
        const keywordMap = {
            'admissions': ['admission', 'admit', 'apply', 'application', 'enroll', 'enrollment', 'join', 'seat', 'cet', 'comedk', 'entrance', 'eligibility', 'intake'],
            'faculty': ['faculty', 'teacher', 'professor', 'staff', 'lecturer', 'hod', 'mentor'],
            'departments': ['department', 'branch', 'course', 'program', 'cse', 'ece', 'mechanical', 'civil', 'electrical', 'ise', 'stream'],
            'laboratories': ['lab', 'laboratory', 'research', 'equipment', 'workshop', 'practical'],
            'navigation': ['navigate', 'location', 'map', 'direction', 'address', 'where', 'campus', 'building', 'block', 'library', 'find'],
            'transportation': ['transport', 'bus', 'route', 'travel', 'commute', 'reach', 'train', 'distance'],
            'hostel': ['hostel', 'accommodation', 'room', 'dormitory', 'stay', 'residential', 'boarding', 'living'],
            'cafeteria': ['cafeteria', 'canteen', 'food', 'mess', 'eat', 'lunch', 'breakfast', 'snack', 'menu', 'dining'],
            'events': ['event', 'fest', 'festival', 'cultural', 'technical', 'hackathon', 'competition', 'club', 'activity', 'sports'],
            'placements': ['placement', 'job', 'career', 'recruit', 'company', 'package', 'salary', 'internship', 'hire', 'opportunity']
        };

        for (const [topic, keywords] of Object.entries(keywordMap)) {
            for (const keyword of keywords) {
                if (q.includes(keyword)) {
                    return campusKnowledge[topic].response;
                }
            }
        }

        return fallbackResponse;
    }

    // =========================================================================
    // 9. VOICE MODE
    // =========================================================================

    let recognition = null;

    function startVoice() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addUserMessage('Voice input');
            addAIResponse('Voice recognition is not supported in your browser. Please try using Google Chrome for the best experience, or type your question below.');
            return;
        }

        aiState.voiceListening = true;
        const overlay = document.getElementById('ai-voice-overlay');
        const voiceBtn = document.getElementById('ai-voice-btn');

        overlay.classList.add('active');
        voiceBtn.classList.add('listening');

        recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            stopVoice();
            handleQuery(transcript);
        };

        recognition.onerror = () => {
            stopVoice();
        };

        recognition.onend = () => {
            stopVoice();
        };

        recognition.start();
    }

    function stopVoice() {
        aiState.voiceListening = false;
        const overlay = document.getElementById('ai-voice-overlay');
        const voiceBtn = document.getElementById('ai-voice-btn');

        overlay.classList.remove('active');
        voiceBtn.classList.remove('listening');

        if (recognition) {
            try { recognition.abort(); } catch (e) { }
            recognition = null;
        }
    }

    // =========================================================================
    // 10. QUERY HANDLER
    // =========================================================================

    function handleQuery(text) {
        if (!text.trim() || aiState.streaming) return;

        addUserMessage(text.trim());
        const response = findResponse(text);

        // Small delay before AI starts thinking
        setTimeout(() => {
            addAIResponse(response);
        }, 200);

        // Clear input
        const input = document.getElementById('ai-input');
        if (input) input.value = '';
    }

    function handleChipClick(topic) {
        if (aiState.streaming) return;
        const data = campusKnowledge[topic];
        if (!data) return;

        // Hide welcome chips section after first use
        const welcome = document.getElementById('ai-welcome');
        if (welcome) {
            welcome.style.display = 'none';
        }

        addUserMessage(data.query);
        setTimeout(() => {
            addAIResponse(data.response);
        }, 200);
    }

    // =========================================================================
    // 11. AMBIENT PARTICLE SYSTEM
    // =========================================================================

    const particles = [];
    const PARTICLE_COUNT = 35;

    function initParticles() {
        const canvas = document.getElementById('ai-particles-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        resize();

        particles.length = 0;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.3 + 0.1,
                alphaSpeed: Math.random() * 0.005 + 0.002,
                alphaDir: 1
            });
        }

        return { canvas, ctx };
    }

    let particleCtx = null;

    function startParticles() {
        particleCtx = initParticles();
        if (!particleCtx) return;

        function animate() {
            const { canvas, ctx } = particleCtx;
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;

            ctx.clearRect(0, 0, w, h);

            for (const p of particles) {
                // Brownian drift
                p.x += p.vx;
                p.y += p.vy;

                // Wrap
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                // Pulse alpha
                p.alpha += p.alphaSpeed * p.alphaDir;
                if (p.alpha > 0.4) p.alphaDir = -1;
                if (p.alpha < 0.05) p.alphaDir = 1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(197, 168, 128, ${p.alpha})`;
                ctx.fill();
            }

            aiState.particleAnimFrame = requestAnimationFrame(animate);
        }

        animate();
    }

    function stopParticles() {
        if (aiState.particleAnimFrame) {
            cancelAnimationFrame(aiState.particleAnimFrame);
            aiState.particleAnimFrame = null;
        }
    }

    // =========================================================================
    // 12. FUTURE CAPABILITIES TOGGLE
    // =========================================================================

    function toggleFuture() {
        const list = document.getElementById('ai-future-list');
        const toggle = document.getElementById('ai-future-toggle');
        list.classList.toggle('expanded');
        toggle.classList.toggle('expanded');
    }

    // =========================================================================
    // 13. EVENT BINDINGS
    // =========================================================================

    function bindEvents() {
        // Orb click
        document.getElementById('ai-orb-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openPanel();
        });

        // Close button
        document.getElementById('ai-close-btn').addEventListener('click', closePanel);

        // Backdrop click closes
        document.getElementById('ai-backdrop').addEventListener('click', closePanel);

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && aiState.panelOpen) {
                closePanel();
            }
        });

        // Prevent panel click from closing
        document.getElementById('ai-panel').addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Send button
        document.getElementById('ai-send-btn').addEventListener('click', () => {
            const input = document.getElementById('ai-input');
            handleQuery(input.value);
        });

        // Enter key in input
        document.getElementById('ai-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuery(e.target.value);
            }
        });

        // Voice button
        document.getElementById('ai-voice-btn').addEventListener('click', () => {
            if (aiState.voiceListening) {
                stopVoice();
            } else {
                startVoice();
            }
        });

        // Voice cancel
        document.getElementById('ai-voice-cancel').addEventListener('click', stopVoice);

        // Chip clicks
        document.querySelectorAll('.ai-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const topic = chip.getAttribute('data-topic');
                handleChipClick(topic);
            });
        });

        // Future capabilities toggle
        document.getElementById('ai-future-header').addEventListener('click', toggleFuture);
    }

    // =========================================================================
    // 14. INITIALIZATION
    // =========================================================================

    function init() {
        createElements();
        bindEvents();
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
