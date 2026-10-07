/**
 * ============================================================================
 * Auralis Wedding Hall & Convention Center — Executive Admin Suite Engine
 * Modern, Intuitive Calendar, Booking & Notes Management Controller
 * ============================================================================
 */

(function () {
    'use strict';

    // 1. STORAGE KEYS & CONSTANTS
    const STORAGE_KEY_BOOKINGS = 'auralis_admin_bookings_v1';
    const STORAGE_KEY_NOTES = 'auralis_admin_date_notes_v1';

    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 2. DEFAULT SEED DATA (Populated on first load for immediate experience)
    const SEED_BOOKINGS = [
        {
            id: 'book_20261024_night',
            date: '2026-10-24',
            session: 'night',
            clientName: 'Farhan & Ayesha',
            phone: '+91 98490 12345',
            email: 'farhan.wedding@example.com',
            eventType: 'Royal Wedding & Walima',
            guests: 1200,
            status: 'confirmed',
            totalAmount: 450000,
            advancePaid: 250000,
            notes: 'Stage backdrop: Imperial emerald & warm crystal chandeliers. Royal Feast catering team arriving by 4:00 PM. Bride entry with cold spark fountain pyro.',
            createdAt: '2026-10-01T10:00:00.000Z'
        },
        {
            id: 'book_20261114_night',
            date: '2026-11-14',
            session: 'night',
            clientName: 'Zaid & Fatima',
            phone: '+91 99887 76655',
            email: 'zaid.event@example.com',
            eventType: 'Grand Reception Gala',
            guests: 950,
            status: 'confirmed',
            totalAmount: 380000,
            advancePaid: 200000,
            notes: 'Live acoustic orchestra on central rotunda. Strictly pure vegetarian buffet for 300 guests on north lawn. Valet parking crew of 15 requested.',
            createdAt: '2026-10-02T11:00:00.000Z'
        },
        {
            id: 'book_20261124_night',
            date: '2026-11-24',
            session: 'night',
            clientName: 'Rehan & Sana',
            phone: '+91 97001 23456',
            email: 'rehan.sana26@example.com',
            eventType: 'Nikah & Celebration Banquet',
            guests: 1500,
            status: 'confirmed',
            totalAmount: 520000,
            advancePaid: 300000,
            notes: 'Both Grand Ballroom and Outer Pavilion combined. Sound curfew sharp 11:30 PM per city guidelines. 2 VIP suites booked for bride & groom families.',
            createdAt: '2026-10-03T09:30:00.000Z'
        },
        {
            id: 'book_20261124_noon',
            date: '2026-11-24',
            session: 'noon',
            clientName: 'Syed Family Luncheon',
            phone: '+91 94400 98765',
            email: 'syed.luncheon@example.com',
            eventType: 'Traditional Dawat-e-Khas',
            guests: 400,
            status: 'confirmed',
            totalAmount: 180000,
            advancePaid: 180000,
            notes: 'Afternoon dawat setup with traditional dastarkhwan seating in Courtyard 2. High-tea counter at 3:00 PM.',
            createdAt: '2026-10-03T14:00:00.000Z'
        },
        {
            id: 'book_20261212_night',
            date: '2026-12-12',
            session: 'night',
            clientName: 'Dr. Tariq & Dr. Mariam',
            phone: '+91 91234 56789',
            email: 'tariq.mariam@example.com',
            eventType: 'Winter Royal Gala & Sangeet',
            guests: 800,
            status: 'hold',
            totalAmount: 350000,
            advancePaid: 50000,
            notes: 'Tentative hold until 15th October. Client requested bespoke floral arch and warm bonfire arrangement in the open court.',
            createdAt: '2026-10-04T16:20:00.000Z'
        },
        {
            id: 'book_20261110_fullday',
            date: '2026-11-10',
            session: 'fullday',
            clientName: 'Estate Maintenance & Chandelier Care',
            phone: 'Admin internal',
            email: 'admin@auralisestate.com',
            eventType: 'Annual Facility Inspection',
            guests: 0,
            status: 'blocked',
            totalAmount: 0,
            advancePaid: 0,
            notes: 'Deep crystal chandelier detailing, generator load testing, and lawn aeration. No bookings allowed on this date.',
            createdAt: '2026-10-01T08:00:00.000Z'
        }
    ];

    const SEED_NOTES = {
        '2026-11-24': 'VIP security protocol needed: City dignitaries expected for evening session. Coordinate with local police liaison.',
        '2026-11-14': 'Sound engineer soundcheck scheduled for 2:30 PM.',
        '2026-12-12': 'Follow up with Dr. Tariq regarding balance advance confirmation before release date.'
    };

    // 3. AUDIO TACTILE FEEDBACK
    let audioCtx = null;
    function playTick(freq = 540) {
        try {
            const AudioClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioClass) return;
            if (!audioCtx) audioCtx = new AudioClass();
            if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.04);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.02, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.045);
        } catch (e) {}
    }

    // 4. DATA ACCESS REPOSITORY
    function getBookings() {
        const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(SEED_BOOKINGS));
            return [...SEED_BOOKINGS];
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [...SEED_BOOKINGS];
        }
    }

    function saveBookings(bookings) {
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
        // Also fire custom event for live public availability sync
        window.dispatchEvent(new CustomEvent('auralis-bookings-updated', { detail: bookings }));
    }

    function getDateNotes() {
        const raw = localStorage.getItem(STORAGE_KEY_NOTES);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(SEED_NOTES));
            return { ...SEED_NOTES };
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return { ...SEED_NOTES };
        }
    }

    function saveDateNotes(notes) {
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    }

    // 5. APPLICATION STATE
    const state = {
        currentYear: 2026,
        currentMonth: 9, // October (0-indexed: 9 = Oct, 10 = Nov)
        activeView: 'calendar', // 'calendar' | 'table' | 'notes'
        searchQuery: '',
        statusFilter: 'all',
        selectedDate: null,
        editingBookingId: null
    };

    // Initialize to today's or current relevant date
    const today = new Date();
    // If today is 2026, align directly, else start with Nov 2026 where seed events live
    state.currentYear = 2026;
    state.currentMonth = 10; // November 2026

    // 6. DOM ELEMENTS
    let elStatsTotal, elStatsConfirmed, elStatsUpcoming, elStatsRevenue;
    let elCalMonthTitle, elCalYearTitle, elCalGrid;
    let elBtnPrevMonth, elBtnNextMonth, elBtnToday;
    let elTabCalendar, elTabTable, elTabNotes;
    let elCalendarView, elTableView, elNotesView;
    let elSearchInput, elFilterSelect;
    let elTableBody;
    let elNotesGrid;
    let elBtnNewBooking, elBtnPrint;

    // Modals
    let elModalBooking, elFormBooking, elModalBookingTitle, elBtnCloseBookingModal, elBtnCancelBooking, elBtnDeleteBooking;
    let elModalInspector, elBtnCloseInspector, elInspectorBody;
    let elToastContainer;

    // 7. TOAST NOTIFICATIONS
    function showToast(icon, message) {
        if (!elToastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'adm-toast';
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        elToastContainer.appendChild(toast);
        playTick(680);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }

    // 8. FORMATTERS & HELPERS
    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function formatDateKey(year, month, day) {
        return `${year}-${pad2(month + 1)}-${pad2(day)}`;
    }

    function formatCurrency(num) {
        return '₹' + Number(num || 0).toLocaleString('en-IN');
    }

    function formatDisplayDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }

    function getSessionBadge(session) {
        if (session === 'noon') return '<span class="slot-session-icon">☀️</span> Noon';
        if (session === 'night') return '<span class="slot-session-icon">🌙</span> Night';
        return '<span class="slot-session-icon">👑</span> Full Day';
    }

    // 9. STATS CALCULATION
    function renderStats() {
        const bookings = getBookings();
        const totalCount = bookings.length;
        const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

        // Upcoming in next 60 days
        const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
        const upcomingCount = bookings.filter(b => b.date >= todayStr && b.status !== 'blocked').length;

        // Revenue received (Advance sum)
        const totalAdvance = bookings.reduce((sum, b) => sum + (Number(b.advancePaid) || 0), 0);

        if (elStatsTotal) elStatsTotal.textContent = totalCount;
        if (elStatsConfirmed) elStatsConfirmed.textContent = confirmedCount;
        if (elStatsUpcoming) elStatsUpcoming.textContent = upcomingCount;
        if (elStatsRevenue) elStatsRevenue.textContent = formatCurrency(totalAdvance);
    }

    // 10. CALENDAR VIEW RENDERING
    function renderCalendar() {
        const year = state.currentYear;
        const month = state.currentMonth;

        if (elCalMonthTitle) elCalMonthTitle.textContent = MONTH_NAMES[month];
        if (elCalYearTitle) elCalYearTitle.textContent = year;

        if (!elCalGrid) return;
        elCalGrid.innerHTML = '';

        const bookings = getBookings();
        const dateNotes = getDateNotes();

        // Calculate days
        const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

        // 10A. Prev Month padding cells
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const prevMonthDate = new Date(year, month - 1, dayNum);
            const dateKey = `${prevMonthDate.getFullYear()}-${pad2(prevMonthDate.getMonth() + 1)}-${pad2(dayNum)}`;
            elCalGrid.appendChild(createCalCell(dayNum, dateKey, true, bookings, dateNotes));
        }

        // 10B. Current Month days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = formatDateKey(year, month, d);
            const isToday = dateKey === todayKey;
            elCalGrid.appendChild(createCalCell(d, dateKey, false, bookings, dateNotes, isToday));
        }

        // 10C. Next Month padding cells (ensure complete 35 or 42 grid)
        const totalRendered = firstDayIndex + daysInMonth;
        const remainingCells = (Math.ceil(totalRendered / 7) * 7) - totalRendered;
        for (let n = 1; n <= remainingCells; n++) {
            const nextMonthDate = new Date(year, month + 1, n);
            const dateKey = `${nextMonthDate.getFullYear()}-${pad2(nextMonthDate.getMonth() + 1)}-${pad2(n)}`;
            elCalGrid.appendChild(createCalCell(n, dateKey, true, bookings, dateNotes));
        }

        // Initialize mobile agenda strip with currently selected date or first booking
        const defaultDate = state.selectedDate || `${year}-${pad2(month + 1)}-24`;
        updateMobileAgenda(defaultDate);
    }

    function createCalCell(dayNum, dateKey, isOtherMonth, bookings, dateNotes, isToday = false) {
        const cell = document.createElement('div');
        const isSelected = state.selectedDate === dateKey;
        cell.className = 'cal-cell' + 
            (isOtherMonth ? ' other-month' : '') + 
            (isToday ? ' is-today' : '') + 
            (isSelected ? ' selected-day' : '');
        cell.dataset.date = dateKey;

        // Day top bar (number + note indicator)
        const topEl = document.createElement('div');
        topEl.className = 'cell-top';

        const numEl = document.createElement('span');
        numEl.className = 'cell-day-num';
        numEl.textContent = dayNum;
        topEl.appendChild(numEl);

        const hasDateNote = !!dateNotes[dateKey];
        const dayBookings = bookings.filter(b => b.date === dateKey);
        const hasBookingNote = dayBookings.some(b => b.notes && b.notes.trim().length > 0);

        if (hasDateNote || hasBookingNote) {
            const notePill = document.createElement('span');
            notePill.className = 'cell-note-pill';
            notePill.innerHTML = '📝 Note';
            notePill.title = 'Admin Notes attached to this date';
            topEl.appendChild(notePill);
        }

        cell.appendChild(topEl);

        // 1. DESKTOP Slots Container
        const desktopEvents = document.createElement('div');
        desktopEvents.className = 'cell-events cell-events-desktop';

        if (dayBookings.length > 0) {
            dayBookings.forEach(booking => {
                const badge = document.createElement('div');
                badge.className = `slot-badge ${booking.status}`;
                badge.title = `${booking.clientName} (${booking.session.toUpperCase()}) — ${booking.eventType}`;

                const sIcon = booking.session === 'noon' ? '☀️' : (booking.session === 'night' ? '🌙' : '👑');
                badge.innerHTML = `
                    <span class="slot-session-icon">${sIcon}</span>
                    <span class="slot-client-name">${escapeHtml(booking.clientName)}</span>
                `;
                desktopEvents.appendChild(badge);
            });
        } else if (!isOtherMonth) {
            const openStatus = document.createElement('div');
            openStatus.className = 'cell-open-status';
            openStatus.textContent = '✨ Open (2 slots)';
            desktopEvents.appendChild(openStatus);
        }
        cell.appendChild(desktopEvents);

        // 2. MOBILE Status Indicators (Compact colored dots & icons)
        const mobileDots = document.createElement('div');
        mobileDots.className = 'cell-events-mobile';

        if (dayBookings.length > 0) {
            dayBookings.forEach(booking => {
                const dot = document.createElement('span');
                dot.className = `m-cal-dot ${booking.status}`;
                const sIcon = booking.session === 'noon' ? '☀️' : (booking.session === 'night' ? '🌙' : '👑');
                dot.textContent = sIcon;
                dot.title = `${booking.clientName} (${booking.session})`;
                mobileDots.appendChild(dot);
            });
            if (hasDateNote) {
                const noteDot = document.createElement('span');
                noteDot.className = 'm-cal-dot note';
                noteDot.textContent = '📌';
                noteDot.title = 'Date Note';
                mobileDots.appendChild(noteDot);
            }
        } else if (!isOtherMonth) {
            const openDot = document.createElement('span');
            openDot.className = 'm-cal-dot open';
            openDot.textContent = '•';
            mobileDots.appendChild(openDot);
        }
        cell.appendChild(mobileDots);

        // Click handler: on mobile updates agenda card & opens inspector on double-tap; on desktop opens inspector directly
        cell.addEventListener('click', () => {
            playTick(580);
            const isMobile = window.innerWidth <= 768;
            state.selectedDate = dateKey;
            
            // Highlight selected cell
            document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('selected-day'));
            cell.classList.add('selected-day');

            updateMobileAgenda(dateKey);

            if (!isMobile) {
                openDateInspector(dateKey);
            }
        });

        // Double click always opens inspector even on mobile
        cell.addEventListener('dblclick', () => {
            openDateInspector(dateKey);
        });

        return cell;
    }

    // 10D. MOBILE DAY AGENDA STRIP (Touch-Optimized Day Summary)
    function updateMobileAgenda(dateKey) {
        const agendaEl = document.getElementById('cal-mobile-agenda');
        if (!agendaEl) return;

        state.selectedDate = dateKey;

        const bookings = getBookings();
        const dateNotes = getDateNotes();
        const dayBookings = bookings.filter(b => b.date === dateKey);
        const dayNote = dateNotes[dateKey] || '';

        const noonBooking = dayBookings.find(b => b.session === 'noon' || b.session === 'fullday');
        const nightBooking = dayBookings.find(b => b.session === 'night' || b.session === 'fullday');

        let slotsHtml = '';

        // Afternoon Slot
        if (noonBooking) {
            slotsHtml += `
                <div class="mob-agenda-slot booked ${noonBooking.status}">
                    <div class="mob-slot-header">
                        <span class="mob-slot-time">☀️ Afternoon / Noon Slot</span>
                        <span class="status-badge ${noonBooking.status}">${noonBooking.status}</span>
                    </div>
                    <div class="mob-slot-client">${escapeHtml(noonBooking.clientName)}</div>
                    <div class="mob-slot-sub">${escapeHtml(noonBooking.eventType || 'Wedding')} • ${formatCurrency(noonBooking.advancePaid)} Paid</div>
                </div>
            `;
        } else {
            slotsHtml += `
                <div class="mob-agenda-slot open">
                    <div class="mob-slot-header">
                        <span class="mob-slot-time">☀️ Afternoon / Noon Slot</span>
                        <span class="mob-slot-avail">✨ Available</span>
                    </div>
                    <div class="mob-slot-sub">11:00 AM – 4:00 PM • Ready for booking</div>
                </div>
            `;
        }

        // Evening Slot
        if (nightBooking) {
            slotsHtml += `
                <div class="mob-agenda-slot booked ${nightBooking.status}">
                    <div class="mob-slot-header">
                        <span class="mob-slot-time">🌙 Evening / Night Slot</span>
                        <span class="status-badge ${nightBooking.status}">${nightBooking.status}</span>
                    </div>
                    <div class="mob-slot-client">${escapeHtml(nightBooking.clientName)}</div>
                    <div class="mob-slot-sub">${escapeHtml(nightBooking.eventType || 'Reception')} • ${formatCurrency(nightBooking.advancePaid)} Paid</div>
                </div>
            `;
        } else {
            slotsHtml += `
                <div class="mob-agenda-slot open">
                    <div class="mob-slot-header">
                        <span class="mob-slot-time">🌙 Evening / Night Slot</span>
                        <span class="mob-slot-avail">✨ Available</span>
                    </div>
                    <div class="mob-slot-sub">6:00 PM – 12:00 AM • Ready for booking</div>
                </div>
            `;
        }

        agendaEl.innerHTML = `
            <div class="mob-agenda-card">
                <div class="mob-agenda-top">
                    <div class="mob-agenda-date-info">
                        <span class="mob-agenda-badge">Selected Date Details</span>
                        <h3 class="mob-agenda-date">${formatDisplayDate(dateKey)}</h3>
                    </div>
                    <button class="btn-primary-action mob-agenda-open-btn" id="mob-agenda-inspect-btn" title="Open full inspector">
                        <span>Details</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>

                <div class="mob-agenda-slots-list">
                    ${slotsHtml}
                </div>

                ${dayNote ? `
                    <div class="mob-agenda-note">
                        <span class="mob-note-icon">📝</span>
                        <span><strong>Note:</strong> ${escapeHtml(dayNote)}</span>
                    </div>
                ` : ''}

                <div class="mob-agenda-actions">
                    <button class="btn-secondary" id="mob-btn-quick-close" style="flex: 1; font-size: 12px; color: var(--adm-rose); border-color: var(--adm-rose-border);">
                        🚫 Close Date
                    </button>
                    <button class="btn-primary-action" id="mob-btn-quick-book" style="flex: 1; font-size: 12px;">
                        + Book Slot
                    </button>
                </div>
            </div>
        `;

        // Bind quick action listeners
        const inspectBtn = document.getElementById('mob-agenda-inspect-btn');
        if (inspectBtn) inspectBtn.addEventListener('click', () => openDateInspector(dateKey));

        const quickBookBtn = document.getElementById('mob-btn-quick-book');
        if (quickBookBtn) quickBookBtn.addEventListener('click', () => openBookingModal(null, dateKey));

        const quickCloseBtn = document.getElementById('mob-btn-quick-close');
        if (quickCloseBtn) quickCloseBtn.addEventListener('click', () => {
            openBookingModal(null, dateKey, 'fullday');
            const selectStatus = document.getElementById('book-status');
            const inputClient = document.getElementById('book-client');
            const inputPhone = document.getElementById('book-phone');
            if (selectStatus) selectStatus.value = 'blocked';
            if (inputClient) inputClient.value = 'Date Closed / Maintenance';
            if (inputPhone) inputPhone.value = 'Administration';
        });
    }

    // 11. DATE INSPECTOR MODAL
    function openDateInspector(dateKey) {
        state.selectedDate = dateKey;
        const bookings = getBookings();
        const dateNotes = getDateNotes();
        const dayBookings = bookings.filter(b => b.date === dateKey);
        const currentNote = dateNotes[dateKey] || '';

        const noonBooking = dayBookings.find(b => b.session === 'noon' || b.session === 'fullday');
        const nightBooking = dayBookings.find(b => b.session === 'night' || b.session === 'fullday');

        let html = `
            <div class="date-inspector-content">
                <div class="inspector-date-banner">
                    <div>
                        <div style="font-size: 11px; text-transform: uppercase; color: var(--adm-text-dim); letter-spacing: 0.5px;">Schedule &amp; Bookings</div>
                        <div class="inspector-date-text">${formatDisplayDate(dateKey)}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-secondary" id="insp-btn-close-date" style="padding: 7px 12px; font-size: 12px; color: var(--adm-rose); border-color: var(--adm-rose-border);" title="Quick block/close booking for this date">
                            🚫 Close Date
                        </button>
                        <button class="btn-primary-action" id="insp-btn-quick-add" style="padding: 7px 14px; font-size: 12px;">
                            + Book Date
                        </button>
                    </div>
                </div>

                <div class="inspector-session-cards">
                    <!-- Afternoon / Noon Slot Card -->
                    <div class="session-inspect-card ${noonBooking ? 'booked' : ''}">
                        <div class="session-inspect-top">
                            <div class="session-inspect-title">
                                <span>☀️ Afternoon / Noon Session</span>
                                <span style="font-size: 11px; color: var(--adm-text-dim); font-weight: normal;">(11:00 AM – 4:00 PM)</span>
                            </div>
                            ${noonBooking 
                                ? `<span class="status-badge ${noonBooking.status}">${noonBooking.status}</span>`
                                : `<button class="btn-secondary" id="insp-book-noon" style="font-size: 11px; padding: 4px 10px;">+ Book Noon</button>`
                            }
                        </div>
                        ${noonBooking ? renderBookingInspectorCard(noonBooking) : '<div style="font-size: 12px; color: var(--adm-text-dim);">Slot is currently Available for booking.</div>'}
                    </div>

                    <!-- Evening / Night Slot Card -->
                    <div class="session-inspect-card ${nightBooking ? 'booked' : ''}">
                        <div class="session-inspect-top">
                            <div class="session-inspect-title">
                                <span>🌙 Evening / Night Celebration</span>
                                <span style="font-size: 11px; color: var(--adm-text-dim); font-weight: normal;">(6:00 PM – 12:00 AM)</span>
                            </div>
                            ${nightBooking 
                                ? `<span class="status-badge ${nightBooking.status}">${nightBooking.status}</span>`
                                : `<button class="btn-secondary" id="insp-book-night" style="font-size: 11px; padding: 4px 10px;">+ Book Night</button>`
                            }
                        </div>
                        ${nightBooking ? renderBookingInspectorCard(nightBooking) : '<div style="font-size: 12px; color: var(--adm-text-dim);">Slot is currently Available for booking.</div>'}
                    </div>
                </div>

                <!-- Date Level General Notes -->
                <div class="date-note-section">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <label class="form-label" style="display: flex; align-items: center; gap: 6px;">
                            <span>📝</span> Date Reminders &amp; Hall Notes
                        </label>
                        <span style="font-size: 11px; color: var(--adm-text-dim);">Visible to administrators</span>
                    </div>
                    <textarea class="form-textarea" id="insp-date-notes" placeholder="Write reminders for this day (e.g. food delivery timing, generator fuel check, stage decor notes)..." style="min-height: 80px;">${escapeHtml(currentNote)}</textarea>
                    <div style="display: flex; justify-content: flex-end;">
                        <button class="btn-secondary" id="insp-save-notes" style="font-size: 12px;">Save Date Note</button>
                    </div>
                </div>
            </div>
        `;

        if (elInspectorBody) elInspectorBody.innerHTML = html;
        if (elModalInspector) elModalInspector.classList.add('active');

        // Bind Actions inside inspector
        const quickAddBtn = document.getElementById('insp-btn-quick-add');
        if (quickAddBtn) quickAddBtn.addEventListener('click', () => {
            closeInspector();
            openBookingModal(null, dateKey);
        });

        const closeDateBtn = document.getElementById('insp-btn-close-date');
        if (closeDateBtn) closeDateBtn.addEventListener('click', () => {
            closeInspector();
            openBookingModal(null, dateKey, 'fullday');
            const selectStatus = document.getElementById('book-status');
            const inputClient = document.getElementById('book-client');
            const inputPhone = document.getElementById('book-phone');
            if (selectStatus) selectStatus.value = 'blocked';
            if (inputClient) inputClient.value = 'Date Closed / Maintenance';
            if (inputPhone) inputPhone.value = 'Administration';
        });

        const bookNoonBtn = document.getElementById('insp-book-noon');
        if (bookNoonBtn) bookNoonBtn.addEventListener('click', () => {
            closeInspector();
            openBookingModal(null, dateKey, 'noon');
        });

        const bookNightBtn = document.getElementById('insp-book-night');
        if (bookNightBtn) bookNightBtn.addEventListener('click', () => {
            closeInspector();
            openBookingModal(null, dateKey, 'night');
        });

        // Edit/Delete buttons on individual bookings
        const editButtons = elInspectorBody.querySelectorAll('.insp-edit-booking');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = e.currentTarget.dataset.id;
                closeInspector();
                openBookingModal(bId);
            });
        });

        const deleteButtons = elInspectorBody.querySelectorAll('.insp-delete-booking');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = e.currentTarget.dataset.id;
                if (confirm('Are you sure you want to cancel and delete this booking?')) {
                    deleteBooking(bId);
                    openDateInspector(dateKey); // re-render inspector
                }
            });
        });

        // Save Date Notes button
        const saveNotesBtn = document.getElementById('insp-save-notes');
        const notesTextarea = document.getElementById('insp-date-notes');
        if (saveNotesBtn && notesTextarea) {
            saveNotesBtn.addEventListener('click', () => {
                const val = notesTextarea.value.trim();
                const notes = getDateNotes();
                if (val) {
                    notes[dateKey] = val;
                } else {
                    delete notes[dateKey];
                }
                saveDateNotes(notes);
                renderCalendar();
                renderStats();
                showToast('📝', 'Date notes saved successfully!');
            });
        }
    }

    function renderBookingInspectorCard(booking) {
        return `
            <div class="booking-field-grid">
                <div>
                    <div class="b-field-label">Client / Couple</div>
                    <div class="b-field-val">${escapeHtml(booking.clientName)}</div>
                </div>
                <div>
                    <div class="b-field-label">Event Type</div>
                    <div class="b-field-val">${escapeHtml(booking.eventType || 'Wedding Celebration')}</div>
                </div>
                <div>
                    <div class="b-field-label">Contact Phone</div>
                    <div class="b-field-val">
                        <a href="tel:${booking.phone}" style="color: var(--adm-gold); text-decoration: none;">${escapeHtml(booking.phone)}</a>
                    </div>
                </div>
                <div>
                    <div class="b-field-label">Guest Count</div>
                    <div class="b-field-val">${booking.guests ? booking.guests + ' Guests' : 'Not specified'}</div>
                </div>
                <div>
                    <div class="b-field-label">Financials</div>
                    <div class="b-field-val">${formatCurrency(booking.advancePaid)} / ${formatCurrency(booking.totalAmount)}</div>
                </div>
                <div>
                    <div class="b-field-label">Session</div>
                    <div class="b-field-val">${booking.session.toUpperCase()}</div>
                </div>
            </div>

            ${booking.notes ? `
                <div class="b-notes-box">
                    <strong style="color: var(--adm-gold); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">Special Instructions &amp; Notes:</strong>
                    ${escapeHtml(booking.notes)}
                </div>
            ` : ''}

            <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px;">
                <button class="btn-secondary insp-edit-booking" data-id="${booking.id}" style="font-size: 11px; padding: 4px 10px;">✏️ Edit</button>
                <button class="btn-secondary insp-delete-booking" data-id="${booking.id}" style="font-size: 11px; padding: 4px 10px; color: var(--adm-rose);">🗑️ Delete</button>
            </div>
        `;
    }

    function closeInspector() {
        if (elModalInspector) elModalInspector.classList.remove('active');
    }

    // 12. ADD / EDIT BOOKING MODAL
    function openBookingModal(bookingId = null, prefillDate = null, prefillSession = 'night') {
        state.editingBookingId = bookingId;
        const bookings = getBookings();
        const existing = bookingId ? bookings.find(b => b.id === bookingId) : null;

        if (elModalBookingTitle) {
            elModalBookingTitle.textContent = existing ? 'Edit Event Booking' : 'Create New Event Booking';
        }

        if (elBtnDeleteBooking) {
            elBtnDeleteBooking.style.display = existing ? 'inline-flex' : 'none';
        }

        // Populate fields
        const inputDate = document.getElementById('book-date');
        const inputClient = document.getElementById('book-client');
        const inputPhone = document.getElementById('book-phone');
        const inputEmail = document.getElementById('book-email');
        const inputEventType = document.getElementById('book-event-type');
        const inputGuests = document.getElementById('book-guests');
        const inputStatus = document.getElementById('book-status');
        const inputTotal = document.getElementById('book-total');
        const inputAdvance = document.getElementById('book-advance');
        const inputNotes = document.getElementById('book-notes');

        const sessionRadios = document.querySelectorAll('input[name="book-session"]');

        if (existing) {
            if (inputDate) inputDate.value = existing.date;
            if (inputClient) inputClient.value = existing.clientName;
            if (inputPhone) inputPhone.value = existing.phone;
            if (inputEmail) inputEmail.value = existing.email || '';
            if (inputEventType) inputEventType.value = existing.eventType || 'Wedding & Reception';
            if (inputGuests) inputGuests.value = existing.guests || '';
            if (inputStatus) inputStatus.value = existing.status || 'confirmed';
            if (inputTotal) inputTotal.value = existing.totalAmount || '';
            if (inputAdvance) inputAdvance.value = existing.advancePaid || '';
            if (inputNotes) inputNotes.value = existing.notes || '';

            sessionRadios.forEach(radio => {
                radio.checked = radio.value === existing.session;
            });
        } else {
            if (inputDate) inputDate.value = prefillDate || `${state.currentYear}-${pad2(state.currentMonth + 1)}-15`;
            if (inputClient) inputClient.value = '';
            if (inputPhone) inputPhone.value = '';
            if (inputEmail) inputEmail.value = '';
            if (inputEventType) inputEventType.value = 'Wedding & Reception';
            if (inputGuests) inputGuests.value = '800';
            if (inputStatus) inputStatus.value = 'confirmed';
            if (inputTotal) inputTotal.value = '400000';
            if (inputAdvance) inputAdvance.value = '200000';
            if (inputNotes) inputNotes.value = '';

            sessionRadios.forEach(radio => {
                radio.checked = radio.value === prefillSession;
            });
        }

        updateFinancialPreview();

        if (elModalBooking) elModalBooking.classList.add('active');
        playTick(600);
    }

    function closeBookingModal() {
        if (elModalBooking) elModalBooking.classList.remove('active');
        state.editingBookingId = null;
    }

    function updateFinancialPreview() {
        const inputTotal = document.getElementById('book-total');
        const inputAdvance = document.getElementById('book-advance');
        const previewBalance = document.getElementById('calc-balance');

        if (inputTotal && inputAdvance && previewBalance) {
            const tot = Number(inputTotal.value) || 0;
            const adv = Number(inputAdvance.value) || 0;
            const bal = Math.max(0, tot - adv);
            previewBalance.textContent = formatCurrency(bal);
        }
    }

    function handleSaveBooking(e) {
        e.preventDefault();

        const inputDate = document.getElementById('book-date').value.trim();
        const inputClient = document.getElementById('book-client').value.trim();
        const inputPhone = document.getElementById('book-phone').value.trim();
        const inputEmail = document.getElementById('book-email').value.trim();
        const inputEventType = document.getElementById('book-event-type').value;
        const inputGuests = Number(document.getElementById('book-guests').value) || 0;
        const inputStatus = document.getElementById('book-status').value;
        const inputTotal = Number(document.getElementById('book-total').value) || 0;
        const inputAdvance = Number(document.getElementById('book-advance').value) || 0;
        const inputNotes = document.getElementById('book-notes').value.trim();

        const checkedSession = document.querySelector('input[name="book-session"]:checked');
        const sessionVal = checkedSession ? checkedSession.value : 'night';

        if (!inputDate || !inputClient || !inputPhone) {
            alert('Please fill in the required fields: Date, Couple / Client Name, and Contact Number.');
            return;
        }

        const bookings = getBookings();

        // Conflict check: is this session on this date already booked by someone else?
        const conflict = bookings.find(b => 
            b.date === inputDate && 
            (b.session === sessionVal || b.session === 'fullday' || sessionVal === 'fullday') &&
            b.id !== state.editingBookingId
        );

        if (conflict) {
            const proceed = confirm(`Notice: ${conflict.clientName} is already assigned to ${conflict.session.toUpperCase()} on ${inputDate}.\n\nDo you want to proceed anyway?`);
            if (!proceed) return;
        }

        if (state.editingBookingId) {
            // Update existing
            const idx = bookings.findIndex(b => b.id === state.editingBookingId);
            if (idx !== -1) {
                bookings[idx] = {
                    ...bookings[idx],
                    date: inputDate,
                    session: sessionVal,
                    clientName: inputClient,
                    phone: inputPhone,
                    email: inputEmail,
                    eventType: inputEventType,
                    guests: inputGuests,
                    status: inputStatus,
                    totalAmount: inputTotal,
                    advancePaid: inputAdvance,
                    notes: inputNotes,
                    updatedAt: new Date().toISOString()
                };
            }
            showToast('✅', `Booking for ${inputClient} updated successfully!`);
        } else {
            // Create new
            const newId = 'book_' + Date.now();
            const newBooking = {
                id: newId,
                date: inputDate,
                session: sessionVal,
                clientName: inputClient,
                phone: inputPhone,
                email: inputEmail,
                eventType: inputEventType,
                guests: inputGuests,
                status: inputStatus,
                totalAmount: inputTotal,
                advancePaid: inputAdvance,
                notes: inputNotes,
                createdAt: new Date().toISOString()
            };
            bookings.push(newBooking);
            showToast('🎉', `New booking for ${inputClient} created successfully!`);
        }

        saveBookings(bookings);
        closeBookingModal();

        // Refresh views
        renderStats();
        if (state.activeView === 'calendar') renderCalendar();
        if (state.activeView === 'table') renderTable();
        if (state.activeView === 'notes') renderNotes();
    }

    function deleteBooking(bookingId) {
        let bookings = getBookings();
        const target = bookings.find(b => b.id === bookingId);
        bookings = bookings.filter(b => b.id !== bookingId);
        saveBookings(bookings);

        showToast('🗑️', `Booking for ${target ? target.clientName : 'Client'} deleted.`);
        closeBookingModal();
        closeInspector();

        renderStats();
        if (state.activeView === 'calendar') renderCalendar();
        if (state.activeView === 'table') renderTable();
        if (state.activeView === 'notes') renderNotes();
    }

    // 13. TABLE / LIST VIEW
    function renderTable() {
        if (!elTableBody) return;
        elTableBody.innerHTML = '';

        const bookings = getBookings();
        const query = state.searchQuery.toLowerCase();
        const statusFilter = state.statusFilter;

        const filtered = bookings.filter(b => {
            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            const matchesQuery = !query || 
                b.clientName.toLowerCase().includes(query) ||
                b.date.includes(query) ||
                (b.phone && b.phone.toLowerCase().includes(query)) ||
                (b.notes && b.notes.toLowerCase().includes(query)) ||
                (b.eventType && b.eventType.toLowerCase().includes(query));

            return matchesStatus && matchesQuery;
        });

        // Sort by date ascending
        filtered.sort((a, b) => a.date.localeCompare(b.date));

        if (filtered.length === 0) {
            elTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--adm-text-dim);">
                        No bookings match your search or filter.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Date">
                    <div style="font-weight: 700; color: var(--adm-text);">${b.date}</div>
                    <div style="font-size: 11px; color: var(--adm-text-dim);">${formatDisplayDate(b.date)}</div>
                </td>
                <td data-label="Session">
                    ${getSessionBadge(b.session)}
                </td>
                <td data-label="Client">
                    <div class="table-client-meta">
                        <span class="table-client-name">${escapeHtml(b.clientName)}</span>
                        <a href="tel:${b.phone}" class="table-client-phone" style="text-decoration: none; color: var(--adm-gold); font-weight: 600;">${escapeHtml(b.phone)}</a>
                    </div>
                </td>
                <td data-label="Event Type">
                    <div>${escapeHtml(b.eventType || 'Wedding')}</div>
                    <div style="font-size: 11px; color: var(--adm-text-dim);">${b.guests ? b.guests + ' guests' : ''}</div>
                </td>
                <td data-label="Status">
                    <span class="status-badge ${b.status}">${b.status}</span>
                </td>
                <td data-label="Financials">
                    <div style="font-weight: 700; color: var(--adm-gold);">${formatCurrency(b.advancePaid)}</div>
                    <div style="font-size: 11px; color: var(--adm-text-dim);">Total: ${formatCurrency(b.totalAmount)}</div>
                </td>
                <td data-label="Actions">
                    <div class="table-actions">
                        <button class="btn-icon-table btn-tbl-edit" data-id="${b.id}" title="Edit Booking">✏️</button>
                        <button class="btn-icon-table delete btn-tbl-del" data-id="${b.id}" title="Delete Booking">🗑️</button>
                    </div>
                </td>
            `;

            elTableBody.appendChild(tr);
        });

        // Bind table action clicks
        elTableBody.querySelectorAll('.btn-tbl-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = e.currentTarget.dataset.id;
                openBookingModal(bId);
            });
        });

        elTableBody.querySelectorAll('.btn-tbl-del').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = e.currentTarget.dataset.id;
                if (confirm('Are you sure you want to delete this booking?')) {
                    deleteBooking(bId);
                }
            });
        });
    }

    // 14. NOTES MASTER VIEW
    function renderNotes() {
        if (!elNotesGrid) return;
        elNotesGrid.innerHTML = '';

        const bookings = getBookings();
        const dateNotes = getDateNotes();

        const allItems = [];

        // 1. Date-level standalone notes
        Object.entries(dateNotes).forEach(([dKey, text]) => {
            if (text && text.trim()) {
                allItems.push({
                    type: 'date',
                    date: dKey,
                    title: 'Hall & Estate Reminder',
                    text: text,
                    tag: '📅 Date Note'
                });
            }
        });

        // 2. Booking-level instructions
        bookings.forEach(b => {
            if (b.notes && b.notes.trim()) {
                allItems.push({
                    type: 'booking',
                    date: b.date,
                    title: `${b.clientName} (${b.session.toUpperCase()})`,
                    text: b.notes,
                    tag: '💍 Wedding Suite',
                    bookingId: b.id
                });
            }
        });

        // Sort descending by date
        allItems.sort((a, b) => b.date.localeCompare(a.date));

        if (allItems.length === 0) {
            elNotesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--adm-text-dim);">
                    No notes recorded yet. Add notes to any booking or date in the Calendar Inspector!
                </div>
            `;
            return;
        }

        allItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <div class="note-card-top">
                    <span class="note-date-tag">
                        <span>${item.type === 'date' ? '📌' : '✉️'}</span>
                        <span>${formatDisplayDate(item.date)}</span>
                    </span>
                    <span class="cell-note-pill">${item.tag}</span>
                </div>
                <div style="font-weight: 700; font-size: 14px; color: var(--adm-text);">${escapeHtml(item.title)}</div>
                <div class="note-body">${escapeHtml(item.text)}</div>
                <div class="note-footer">
                    <span>${item.date}</span>
                    ${item.bookingId 
                        ? `<button class="btn-secondary note-edit-trigger" data-id="${item.bookingId}" style="font-size: 10px; padding: 2px 8px;">Edit Booking</button>`
                        : `<button class="btn-secondary note-date-trigger" data-date="${item.date}" style="font-size: 10px; padding: 2px 8px;">View Date</button>`
                    }
                </div>
            `;
            elNotesGrid.appendChild(card);
        });

        elNotesGrid.querySelectorAll('.note-edit-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = e.currentTarget.dataset.id;
                openBookingModal(bId);
            });
        });

        elNotesGrid.querySelectorAll('.note-date-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dKey = e.currentTarget.dataset.date;
                openDateInspector(dKey);
            });
        });
    }

    // 15. VIEW SWITCHING
    function switchView(viewName) {
        state.activeView = viewName;
        playTick(620);

        if (elTabCalendar) elTabCalendar.classList.toggle('active', viewName === 'calendar');
        if (elTabTable) elTabTable.classList.toggle('active', viewName === 'table');
        if (elTabNotes) elTabNotes.classList.toggle('active', viewName === 'notes');

        // Sync mobile bottom navigation bar buttons
        document.querySelectorAll('.mob-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        if (elCalendarView) elCalendarView.style.display = viewName === 'calendar' ? 'flex' : 'none';
        if (elTableView) elTableView.style.display = viewName === 'table' ? 'block' : 'none';
        if (elNotesView) elNotesView.style.display = viewName === 'notes' ? 'flex' : 'none';

        if (viewName === 'calendar') renderCalendar();
        if (viewName === 'table') renderTable();
        if (viewName === 'notes') renderNotes();
    }

    // 16. EXPORT TO CSV
    function exportBookingsToCSV() {
        const bookings = getBookings();
        if (bookings.length === 0) {
            alert('No bookings to export.');
            return;
        }

        const headers = ['Date', 'Session', 'Client / Couple', 'Phone', 'Email', 'Event Type', 'Guests', 'Status', 'Total Fee', 'Advance Paid', 'Notes'];
        const rows = bookings.map(b => [
            b.date,
            b.session,
            `"${(b.clientName || '').replace(/"/g, '""')}"`,
            `"${(b.phone || '').replace(/"/g, '""')}"`,
            `"${(b.email || '').replace(/"/g, '""')}"`,
            `"${(b.eventType || '').replace(/"/g, '""')}"`,
            b.guests || 0,
            b.status,
            b.totalAmount || 0,
            b.advancePaid || 0,
            `"${(b.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `auralis_bookings_schedule_${state.currentYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('📥', 'Bookings exported to CSV spreadsheet!');
    }

    // 17. UTILITY: ESCAPE HTML
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 18. INITIALIZE CONTROLLER
    function init() {
        // Cache DOM elements
        elStatsTotal = document.getElementById('stat-total-bookings');
        elStatsConfirmed = document.getElementById('stat-confirmed-events');
        elStatsUpcoming = document.getElementById('stat-upcoming-events');
        elStatsRevenue = document.getElementById('stat-total-revenue');

        elCalMonthTitle = document.getElementById('cal-month-title');
        elCalYearTitle = document.getElementById('cal-year-title');
        elCalGrid = document.getElementById('cal-grid');

        elBtnPrevMonth = document.getElementById('cal-prev-month');
        elBtnNextMonth = document.getElementById('cal-next-month');
        elBtnToday = document.getElementById('cal-btn-today');

        elTabCalendar = document.getElementById('tab-calendar');
        elTabTable = document.getElementById('tab-table');
        elTabNotes = document.getElementById('tab-notes');

        elCalendarView = document.getElementById('calendar-view');
        elTableView = document.getElementById('table-view');
        elNotesView = document.getElementById('notes-view');

        elSearchInput = document.getElementById('adm-search-input');
        elFilterSelect = document.getElementById('adm-status-filter');

        elTableBody = document.getElementById('bookings-table-body');
        elNotesGrid = document.getElementById('notes-grid');

        elBtnNewBooking = document.getElementById('btn-new-booking');
        elBtnPrint = document.getElementById('btn-export-csv');

        // Modals
        elModalBooking = document.getElementById('modal-booking');
        elFormBooking = document.getElementById('form-booking');
        elModalBookingTitle = document.getElementById('modal-booking-title');
        elBtnCloseBookingModal = document.getElementById('btn-close-booking-modal');
        elBtnCancelBooking = document.getElementById('btn-cancel-booking');
        elBtnDeleteBooking = document.getElementById('btn-delete-booking');

        elModalInspector = document.getElementById('modal-date-inspector');
        elBtnCloseInspector = document.getElementById('btn-close-inspector');
        elInspectorBody = document.getElementById('inspector-body');

        elToastContainer = document.getElementById('toast-hub');

        // Navigation controls
        if (elBtnPrevMonth) {
            elBtnPrevMonth.addEventListener('click', () => {
                playTick(500);
                state.currentMonth--;
                if (state.currentMonth < 0) {
                    state.currentMonth = 11;
                    state.currentYear--;
                }
                renderCalendar();
            });
        }

        if (elBtnNextMonth) {
            elBtnNextMonth.addEventListener('click', () => {
                playTick(560);
                state.currentMonth++;
                if (state.currentMonth > 11) {
                    state.currentMonth = 0;
                    state.currentYear++;
                }
                renderCalendar();
            });
        }

        if (elBtnToday) {
            elBtnToday.addEventListener('click', () => {
                playTick(600);
                state.currentYear = 2026;
                state.currentMonth = 10; // Jump to Nov 2026
                renderCalendar();
            });
        }

        // View Tabs
        if (elTabCalendar) elTabCalendar.addEventListener('click', () => switchView('calendar'));
        if (elTabTable) elTabTable.addEventListener('click', () => switchView('table'));
        if (elTabNotes) elTabNotes.addEventListener('click', () => switchView('notes'));

        // Search & Filter
        if (elSearchInput) {
            elSearchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value.trim();
                if (state.activeView === 'table') renderTable();
            });
        }

        if (elFilterSelect) {
            elFilterSelect.addEventListener('change', (e) => {
                state.statusFilter = e.target.value;
                if (state.activeView === 'table') renderTable();
            });
        }

        // Action Buttons
        if (elBtnNewBooking) {
            elBtnNewBooking.addEventListener('click', () => {
                openBookingModal();
            });
        }

        if (elBtnPrint) {
            elBtnPrint.addEventListener('click', exportBookingsToCSV);
        }

        // Modal Controls
        if (elBtnCloseBookingModal) elBtnCloseBookingModal.addEventListener('click', closeBookingModal);
        if (elBtnCancelBooking) elBtnCancelBooking.addEventListener('click', closeBookingModal);
        if (elModalBooking) {
            elModalBooking.addEventListener('click', (e) => {
                if (e.target === elModalBooking) closeBookingModal();
            });
        }

        if (elBtnCloseInspector) elBtnCloseInspector.addEventListener('click', closeInspector);
        if (elModalInspector) {
            elModalInspector.addEventListener('click', (e) => {
                if (e.target === elModalInspector) closeInspector();
            });
        }

        if (elFormBooking) {
            elFormBooking.addEventListener('submit', handleSaveBooking);
        }

        if (elBtnDeleteBooking) {
            elBtnDeleteBooking.addEventListener('click', () => {
                if (state.editingBookingId) {
                    if (confirm('Are you sure you want to permanently delete this booking?')) {
                        deleteBooking(state.editingBookingId);
                    }
                }
            });
        }

        // Auto financial calculation in booking modal
        const inputTotal = document.getElementById('book-total');
        const inputAdvance = document.getElementById('book-advance');
        if (inputTotal) inputTotal.addEventListener('input', updateFinancialPreview);
        if (inputAdvance) inputAdvance.addEventListener('input', updateFinancialPreview);

        // Escape Key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeBookingModal();
                closeInspector();
            }
        });

        // Theme Management (Default is pristine light / white theme)
        const themeBtn = document.getElementById('btn-theme-toggle');
        const themeIcon = document.getElementById('theme-toggle-icon');
        const mobThemeIcon = document.getElementById('mob-theme-icon');

        function applyTheme(theme) {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (themeIcon) themeIcon.textContent = '☀️';
                if (mobThemeIcon) mobThemeIcon.textContent = '☀️';
                if (themeBtn) themeBtn.title = 'Switch to White Theme';
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (themeIcon) themeIcon.textContent = '🌙';
                if (mobThemeIcon) mobThemeIcon.textContent = '🌙';
                if (themeBtn) themeBtn.title = 'Switch to Dark Theme';
            }
            localStorage.setItem('auralis_admin_theme', theme);
        }

        const savedTheme = localStorage.getItem('auralis_admin_theme') || 'light';
        applyTheme(savedTheme);

        function toggleThemeMode() {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            playTick(next === 'light' ? 700 : 500);
            showToast(next === 'light' ? '☀️' : '🌙', `Switched to ${next === 'light' ? 'Pristine White' : 'Dark Regal'} Theme`);
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', toggleThemeMode);
        }

        // Mobile Bottom Navigation Bar Controls
        const mobBtnCal = document.getElementById('mob-btn-cal');
        const mobBtnTable = document.getElementById('mob-btn-table');
        const mobBtnNotes = document.getElementById('mob-btn-notes');
        const mobFabNew = document.getElementById('mob-fab-new');
        const mobBtnTheme = document.getElementById('mob-btn-theme');

        if (mobBtnCal) mobBtnCal.addEventListener('click', () => switchView('calendar'));
        if (mobBtnTable) mobBtnTable.addEventListener('click', () => switchView('table'));
        if (mobBtnNotes) mobBtnNotes.addEventListener('click', () => switchView('notes'));
        if (mobFabNew) mobFabNew.addEventListener('click', () => openBookingModal());
        if (mobBtnTheme) mobBtnTheme.addEventListener('click', toggleThemeMode);

        // Initial Renders
        renderStats();
        renderCalendar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
