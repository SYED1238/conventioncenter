/**
 * Auralis Wedding Concierge — Immersive Venue Intelligence
 * Auralis Wedding Hall & Convention Center
 * 
 * Architecture:
 *   Orb Controller → Panel Lifecycle → Boot Sequence → Welcome → Conversation → Voice
 *   All self-contained in a single IIFE. Zero global pollution.
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. VENUE KNOWLEDGE BASE — Pre-built wedding venue responses
    // =========================================================================

    const campusKnowledge = {
        'banquets': {
            query: '🏰 Banquet Halls',
            response: `**Auralis Wedding Hall & Convention Center** offers world-class spaces for every scale of celebration:\n\n🏰 **The Grand Royal Ballroom**\n• Seating Capacity: 1,500 guests (Floating capacity: 2,500+ guests)\n• Magnificent double-height ceilings with imported crystal chandeliers\n• Completely pillarless layout ensuring panoramic, unobstructed sightlines\n• Central climate control and professional acoustic engineering\n\n✨ **The Crystal Hall**\n• Seating Capacity: 600 – 800 guests\n• Ideal for Sangeet, Mehendi, Engagement ceremonies, and private receptions\n• Dedicated stage lighting rig, runway, and state-of-the-art sound system\n\n🌿 **The Imperial Lawn**\n• Manicured open-air garden accommodating 1,200+ guests\n• Romantic fairy-light canopies and illuminated landscape water features\n• Perfect for outdoor wedding pheras and sunset cocktail dinners\n\n🍽️ **Grand Dining Complex**\n• Dedicated multi-floor banquet dining seating 800 guests per batch\n• Separate pure-vegetarian and live culinary counter zones`
        },
        'packages': {
            query: '💍 Wedding Packages',
            response: `We offer bespoke, all-inclusive celebration packages crafted for an effortless wedding experience:\n\n👑 **The Royal Imperial Package**\n• Complete venue exclusivity (Grand Ballroom + Crystal Hall + Lawn)\n• Multi-day wedding access with early setup window\n• Royal Bridal Suite & Groom's Lounge included\n• Full LED stage backdrop, ambient architectural lighting & concert acoustic rig\n\n💎 **The Grand Celebration Package**\n• Full Grand Ballroom & Dining Hall access\n• Thematic floral stage decor, grand carpeted entrance & red-carpet walkway\n• Complimentary 2 Deluxe VIP suites for family\n• Dedicated professional valet parking team (400+ vehicles)\n\n✨ **Intimate Celebrations Package**\n• Crystal Hall access for Engagements, Sangeet, or Reception\n• Flexible timing & customizable setup options\n\nContact our events desk for a tailored quotation tailored to your auspicious dates.`
        },
        'catering': {
            query: '🍽️ Catering & Dining',
            response: `Culinary excellence is at the heart of every memorable wedding at Auralis:\n\n🍛 **Grand Culinary Feasts**\n• Multi-cuisine traditional and contemporary wedding menus\n• Authentic South Indian traditional banana leaf feasts\n• Royal North Indian, Mughlai & Awadhi delicacies\n• Global gourmet counters: Italian pasta bars, Pan-Asian woks & live Chaat bazaars\n\n🍰 **Dessert & Beverage Lounges**\n• Artisanal mocktail bars & welcome drink lounges\n• Live traditional sweet stations (hot Jalebi, Rabdi, Malpua, Kulfi)\n• Custom designer wedding cake presentations\n\n✨ **Hygienic Mega-Kitchen**\n• Commercial-grade stainless steel kitchen with cold storage\n• Strict separation of pure-vegetarian and non-vegetarian preparation areas\n• Verified FSSAI compliance and 24/7 RO water purification`
        },
        'suites': {
            query: '🛏️ Bridal Suites & Rooms',
            response: `We provide comfortable, luxury accommodations on-site for the couple and key family members:\n\n👰 **Royal Bridal Suite**\n• Spacious makeup salon area with Hollywood vanity mirrors\n• Ample plush lounge seating for bridesmaids & close family\n• Designer en-suite bathroom with luxury dressing room\n• Climate-controlled with digital safe for jewelry & valuables\n\n🤵 **Groom's Lounge**\n• Dedicated preparation lounge with full-length grooming mirrors\n\n🏨 **Guest Accommodation**\n• 30+ air-conditioned deluxe guest rooms for out-of-town wedding attendees\n• 24-hour concierge, hot water, and housekeeping support`
        },
        'decor': {
            query: '🌸 Decor & Themes',
            response: `Transform your vision into reality with our expert decor artisans:\n\n✨ **Decor Styles & Concepts**\n• **Royal Palace Heritage**: Regal golden carvings, traditional temple motifs, grand floral mandaps\n• **Modern Glamour**: Crystal chandeliers, mirrored aisles, fairy light canopies, LED pixel staging\n• **Floral Dreamscape**: Fresh imported exotic flowers, pastel orchids, fragrant jasmine garlands\n• **Rustic Garden Chic**: Wooden cabanas, vintage lanterns, foliage arches on the Imperial Lawn\n\n📸 **Photo Opportunities**\n• Dramatic entryway with royal fountain reflections\n• Dedicated photo-booth installations and 360-degree video booths`
        },
        'parking': {
            query: '🚗 Parking & Valet',
            response: `Guest convenience and smooth arrivals are guaranteed:\n\n🚗 **Parking Capacity**\n• Dedicated on-site paved parking for 400+ four-wheelers and 300+ two-wheelers\n• Additional designated overflow parking for mega-events\n\n🎩 **Complimentary Valet Services**\n• Professional, uniformed valet parking staff on duty\n• Efficient vehicle intake and retrieval tracking system\n• Wide dual-lane entry and exit lanes ensuring zero traffic delays`
        },
        'booking': {
            query: '📅 Booking & Dates',
            response: `Secure your auspicious wedding dates at Auralis:\n\n📋 **Booking Steps**\n1. **Date Consultation**: Check auspicious muhurtham dates and venue slot availability\n2. **Private Venue Tour**: Walk through the Grand Ballroom, suites, and lawn\n3. **Custom Proposal**: Receive a comprehensive, transparent price estimate\n4. **Advance Reservation**: Lock your chosen dates with a confirmed deposit\n\n⏰ **Concierge Office Hours**\nOpen daily from 9:00 AM to 8:00 PM for private viewing appointments.\n\nUse the 'Schedule Venue Tour' button or speak directly with our wedding coordinator.`
        },
        'atmospheres': {
            query: '🌦️ Atmosphere Engine',
            response: `**The Auralis Cinematic Atmosphere Engine** is our unique digital showcase allowing couples and families to experience the venue under multiple real-time weather conditions:\n\n☀️ **Day Ceremony**: Experience how natural sunbeams illuminate the golden wood and glass facade for daytime rituals and weddings.\n🌧️ **Monsoon Romance**: Witness the poetry of rain as raindrops glisten on the glass facade with tranquil acoustic rain soundscapes.\n🌙 **Starry Night**: Preview how the venue illuminates after sunset with majestic architectural floodlights and starlight ambiance.`
        }
    };

    // Fallback response for unknown queries
    const fallbackResponse = `Thank you for your inquiry. As the Auralis Wedding Concierge, I can assist you with:\n\n• 🏰 Banquet Halls & Capacity\n• 💍 Wedding Packages & Pricing\n• 🍽️ Catering & Dining Menus\n• 🛏️ Bridal Suites & Accommodation\n• 🌸 Decor Themes & Mandap Styles\n• 🚗 Parking & Valet Services\n• 📅 Booking Muhurtham Dates\n• 🌦️ Atmosphere Weather Modes\n\nPlease select any of the topics below or feel free to ask a specific question about your upcoming celebration.`;

    // =========================================================================
    // 2. DOM CREATION — Build all elements programmatically
    // =========================================================================

    function createElements() {
        // -- Floating AI Orb --
        const orbWrapper = document.createElement('div');
        orbWrapper.className = 'ai-orb-wrapper';
        orbWrapper.id = 'ai-orb-wrapper';
        orbWrapper.innerHTML = `
            <button class="ai-orb" id="ai-orb-btn" aria-label="Open Wedding Concierge">
                <span class="ai-orb-glow"></span>
                <span class="ai-orb-glow-outer"></span>
                <svg class="ai-orb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>
                </svg>
            </button>
            <span class="ai-orb-label">Wedding Concierge</span>
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
                    <span class="ai-panel-title-text">Auralis Wedding Concierge</span>
                </div>
                <button class="ai-close-btn" id="ai-close-btn" aria-label="Close Wedding Concierge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="ai-panel-body" id="ai-panel-body">
                <!-- Boot Sequence -->
                <div class="ai-boot-sequence" id="ai-boot-sequence">
                    <div class="ai-boot-title" id="ai-boot-title">Auralis Concierge</div>
                    <div class="ai-boot-subtitle" id="ai-boot-subtitle">Initializing...</div>
                    <div class="ai-boot-phases" id="ai-boot-phases">
                        <div class="ai-boot-phase" data-phase="0">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Banquet Spaces
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="1">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Wedding Packages
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="2">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Culinary Menus
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="3">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Loading Bridal Suite Directory
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                        <div class="ai-boot-phase" data-phase="4">
                            <div class="ai-boot-phase-label">
                                <span class="ai-boot-phase-check">✓</span>
                                Connecting Concierge Intelligence
                            </div>
                            <div class="ai-boot-progress-track"><div class="ai-boot-progress-fill"></div></div>
                        </div>
                    </div>
                    <div class="ai-boot-ready" id="ai-boot-ready">Wedding Concierge Ready</div>
                </div>

                <!-- Welcome Screen -->
                <div class="ai-welcome" id="ai-welcome">
                    <div class="ai-welcome-greeting" id="ai-welcome-greeting">Welcome to Auralis.</div>
                    <div class="ai-welcome-description" id="ai-welcome-desc">
                        I am your dedicated Wedding Concierge. How may I assist you with your dream celebration today?
                    </div>
                    <div class="ai-welcome-divider" id="ai-welcome-divider"></div>
                    <div class="ai-welcome-askme" id="ai-welcome-askme">Explore Venue Information</div>
                    <div class="ai-chips-container" id="ai-chips-container">
                        <button class="ai-chip" data-topic="banquets"><span class="ai-chip-emoji">🏰</span> Banquet Halls</button>
                        <button class="ai-chip" data-topic="packages"><span class="ai-chip-emoji">💍</span> Wedding Packages</button>
                        <button class="ai-chip" data-topic="catering"><span class="ai-chip-emoji">🍽️</span> Catering & Dining</button>
                        <button class="ai-chip" data-topic="suites"><span class="ai-chip-emoji">🛏️</span> Bridal Suites</button>
                        <button class="ai-chip" data-topic="decor"><span class="ai-chip-emoji">🌸</span> Decor & Themes</button>
                        <button class="ai-chip" data-topic="parking"><span class="ai-chip-emoji">🚗</span> Parking & Valet</button>
                        <button class="ai-chip" data-topic="booking"><span class="ai-chip-emoji">📅</span> Booking & Dates</button>
                        <button class="ai-chip" data-topic="atmospheres"><span class="ai-chip-emoji">🌦️</span> Atmosphere Engine</button>
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
                    <input type="text" class="ai-input" id="ai-input" placeholder="Ask about banquet halls, menus, wedding dates..." autocomplete="off" />
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
                    <span class="ai-future-title">Wedding Concierge · Future Capabilities</span>
                    <span class="ai-future-toggle" id="ai-future-toggle">▼</span>
                </div>
                <div class="ai-future-list" id="ai-future-list">
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Real-time muhurtham date availability</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Virtual 360° hall & lawn walkthrough</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Interactive culinary banquet customizer</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Guest seating & table arrangement planner</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Mandap & stage decor 3D preview</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Live weather sync with outdoor events</div>
                    <div class="ai-future-item"><span class="ai-future-bullet"></span> Direct coordinator consultation</div>
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
