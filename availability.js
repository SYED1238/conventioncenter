/**
 * ============================================================================
 * Auralis Wedding Hall — Section 3: Check Availability
 * Dual Circular Arc Wheels (Day & Year) + Central Complication (Month)
 * Luxury Sanctuary Booking Engine
 * ============================================================================
 */

(function () {
    'use strict';

    // 1. CALENDAR DATA CONSTANTS
    const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const MONTHS_FULL  = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
    const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function getDaysInMonth(year, monthIndex) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    function getWeekdayFull(year, monthIndex, day) {
        return WEEKDAYS_FULL[new Date(year, monthIndex, day).getDay()];
    }

    function pad2(num) {
        return String(num).padStart(2, '0');
    }

    // 2. STATE OBJECT
    const state = {
        selectedYear: 2026,
        selectedMonth: 10, // November (0-indexed: 10 = Nov)
        selectedDay: 24,
        selectedSession: 'noon', // 'noon' | 'night'
        activeUnit: 'day', // 'day' | 'month' | 'year'
        isChecking: false
    };

    // 3. TACTILE AUDIO FEEDBACK (Web Audio API)
    let audioCtx = null;

    function playDialTick(freq = 520, duration = 0.035) {
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
            osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + duration);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.025, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    function playCelebrationChime() {
        try {
            const AudioClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioClass) return;
            if (!audioCtx) audioCtx = new AudioClass();
            if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

            const now = audioCtx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Golden Chime)

            notes.forEach((freq, idx) => {
                const noteTime = now + idx * 0.08;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.0001, noteTime);
                gain.gain.linearRampToValueAtTime(0.035, noteTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.65);
            });
        } catch (e) {}
    }

    // 4. MOCK AVAILABILITY DATASET (Synced dynamically with Admin Suite)
    const DEFAULT_RESERVED_SLOTS = [
        '2026-10-17-night',
        '2026-10-24-night',
        '2026-11-14-night',
        '2026-11-24-night',
        '2026-12-12-night',
        '2026-02-14-night',
        '2025-12-31-night',
        '2026-04-18-night'
    ];

    function normalizeDateKey(dStr) {
        if (!dStr) return '';
        const parts = String(dStr).split('-');
        if (parts.length === 3) {
            return `${parts[0]}-${pad2(Number(parts[1]))}-${pad2(Number(parts[2]))}`;
        }
        return dStr;
    }

    function getActiveReservedSlots() {
        const set = new Set(DEFAULT_RESERVED_SLOTS);
        try {
            const raw = localStorage.getItem('auralis_admin_bookings_v1');
            if (raw) {
                const bookings = JSON.parse(raw);
                bookings.forEach(b => {
                    if (b.status !== 'cancelled') {
                        const dClean = normalizeDateKey(b.date);
                        if (!b.session || b.session === 'fullday' || b.status === 'blocked') {
                            set.add(`${dClean}-noon`);
                            set.add(`${dClean}-night`);
                            set.add(dClean);
                        } else {
                            set.add(`${dClean}-${b.session}`);
                        }
                    }
                });
            }
        } catch (e) {}
        return set;
    }

    function isReservedKey(key) {
        return getActiveReservedSlots().has(key);
    }

    function queryAvailability(day, month, year, session) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mPad = pad2(month + 1);
                const dPad = pad2(day);
                const key = `${year}-${mPad}-${dPad}-${session}`;

                const isReserved = isReservedKey(key);

                resolve({
                    day,
                    month: MONTHS_FULL[month],
                    year,
                    session,
                    weekday: getWeekdayFull(year, month, day),
                    isAvailable: !isReserved,
                    slotKey: key,
                    venueName: 'The Grand Royal Ballroom & Imperial Lawns',
                    capacity: 'Up to 2,500 Royal Guests',
                    packageTier: 'Palatial Grandeur Exclusive Buyout'
                });
            }, 550);
        });
    }

    // 5. DOM REPOSITORY
    let dialWheelContainer;
    let dialTrackCircleDay, dialTrackSolidDay;
    let dialTrackCircleYear, dialTrackSolidYear;

    let colDayEl, colMonthEl, colYearEl;
    let trackDayEl, trackMonthEl, trackYearEl;



    let activeWeekdayPill, activeDatePrimary, activeDateSub, activeStatusText;

    let sessionNoonBtn, sessionNightBtn;
    let checkAvailabilityBtn;
    let resultPanel;

    // Controllers
    let dayWheel, monthWheel, yearWheel;

    // 6. WHEEL CONTROLLERS
    // 6A. Circular Radial Wheel for DAY (Left Arc)
    function createCircularArcWheelDay({
        colEl,
        trackEl,
        getValues,
        getInitialIndex,
        onSnap,
        baseFreq = 520
    }) {
        let items = [];
        let currentPos = getInitialIndex();
        let targetPos = currentPos;
        let isDown = false;
        let startY = 0;
        let startPos = 0;
        let dragDistance = 0;

        function build() {
            trackEl.innerHTML = '';
            items = [];
            const values = getValues();

            values.forEach((val, idx) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'dial-arc-item dial-day-item';
                itemEl.dataset.index = idx;

                const dotEl = document.createElement('div');
                dotEl.className = 'dial-arc-dot';

                const numEl = document.createElement('div');
                numEl.className = 'dial-arc-number';
                numEl.textContent = val;

                itemEl.appendChild(dotEl);
                itemEl.appendChild(numEl);

                itemEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (dragDistance < 6) {
                        snap(idx);
                        focusColumn();
                    }
                });

                trackEl.appendChild(itemEl);
                items.push({ el: itemEl, dotEl, numEl, index: idx, value: val });
            });

            targetPos = Math.max(0, Math.min(values.length - 1, targetPos));
            currentPos = targetPos;
            render();
        }

        function render() {
            if (!items.length) return;
            const H = trackEl.clientHeight || 350;
            const isMobile = window.innerWidth <= 768;
            const cy = H / 2;
            const R = isMobile ? 180 : 280;
            const apexX = isMobile ? 12 : 22;
            const cx = apexX - R;
            const stepAngleDeg = isMobile ? 24 : 26;
            const halfH = isMobile ? 22 : 28;

            const activeIdx = Math.round(currentPos);

            items.forEach(item => {
                const offset = item.index - currentPos;
                const thetaDeg = offset * stepAngleDeg;

                if (Math.abs(thetaDeg) > 68) {
                    item.el.style.display = 'none';
                    return;
                }
                item.el.style.display = 'flex';

                const thetaRad = thetaDeg * (Math.PI / 180);
                const dotX = cx + R * Math.cos(thetaRad);
                const dotY = cy + R * Math.sin(thetaRad);

                const isActive = (item.index === activeIdx && Math.abs(offset) < 0.48);
                const opacity = Math.max(0.12, 1 - Math.abs(offset) * 0.38);

                item.el.classList.toggle('active', isActive);
                item.el.style.transform = `translate3d(${dotX.toFixed(1)}px, ${(dotY - halfH).toFixed(1)}px, 0) rotate(${thetaDeg.toFixed(1)}deg)`;
                item.el.style.opacity = opacity.toFixed(3);
            });
        }

        function snap(idx) {
            const maxIdx = items.length - 1;
            const clamped = Math.max(0, Math.min(maxIdx, idx));
            const changed = Math.round(targetPos) !== clamped;
            targetPos = clamped;
            if (changed) {
                playDialTick(baseFreq);
                onSnap(clamped);
            }
        }

        function step(direction) {
            snap(Math.round(targetPos) + direction);
            focusColumn();
        }

        function focusColumn() {
            state.activeUnit = 'day';
            document.querySelectorAll('.dial-column').forEach(c => {
                c.classList.toggle('focused', c === colEl);
            });
        }

        // Pointer Drag Handlers
        const onStart = (clientY) => {
            isDown = true;
            startY = clientY;
            startPos = targetPos;
            dragDistance = 0;
            focusColumn();
        };

        const onMove = (clientY) => {
            if (!isDown) return;
            const diffY = clientY - startY;
            dragDistance = Math.abs(diffY);
            const sensitivity = window.innerWidth <= 768 ? 38 : 50;
            const offsetChange = -diffY / sensitivity;
            const maxIdx = items.length - 1;
            targetPos = Math.max(-0.4, Math.min(maxIdx + 0.4, startPos + offsetChange));
        };

        const onEnd = () => {
            if (!isDown) return;
            isDown = false;
            snap(Math.round(targetPos));
        };

        colEl.addEventListener('mousedown', (e) => onStart(e.clientY));
        window.addEventListener('mousemove', (e) => onMove(e.clientY));
        window.addEventListener('mouseup', onEnd);

        colEl.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
        colEl.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
        colEl.addEventListener('touchend', onEnd);
        colEl.addEventListener('touchcancel', onEnd);

        // Wheel Handler
        let wheelTimer = false;
        colEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (wheelTimer) return;
            const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (Math.abs(delta) > 8) {
                wheelTimer = true;
                step(delta > 0 ? 1 : -1);
                setTimeout(() => { wheelTimer = false; }, 110);
            }
        }, { passive: false });

        return {
            unit: 'day',
            colEl,
            build,
            render,
            snap,
            step,
            focusColumn,
            get targetPos() { return targetPos; },
            set targetPos(v) { targetPos = v; },
            get currentPos() { return currentPos; },
            set currentPos(v) { currentPos = v; },
            get length() { return items.length; }
        };
    }

    // 6B. Circular Radial Wheel for YEAR (Right Arc)
    function createCircularArcWheelYear({
        colEl,
        trackEl,
        getValues,
        getInitialIndex,
        onSnap,
        baseFreq = 420
    }) {
        let items = [];
        let currentPos = getInitialIndex();
        let targetPos = currentPos;
        let isDown = false;
        let startY = 0;
        let startPos = 0;
        let dragDistance = 0;

        function build() {
            trackEl.innerHTML = '';
            items = [];
            const values = getValues();

            values.forEach((val, idx) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'dial-arc-item dial-year-item';
                itemEl.dataset.index = idx;

                const numEl = document.createElement('div');
                numEl.className = 'dial-arc-number';
                numEl.textContent = val;

                const dotEl = document.createElement('div');
                dotEl.className = 'dial-arc-dot';

                itemEl.appendChild(numEl);
                itemEl.appendChild(dotEl);

                itemEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (dragDistance < 6) {
                        snap(idx);
                        focusColumn();
                    }
                });

                trackEl.appendChild(itemEl);
                items.push({ el: itemEl, dotEl, numEl, index: idx, value: val });
            });

            targetPos = Math.max(0, Math.min(values.length - 1, targetPos));
            currentPos = targetPos;
            render();
        }

        function render() {
            if (!items.length) return;
            const W = colEl.clientWidth || 140;
            const H = trackEl.clientHeight || 350;
            const isMobile = window.innerWidth <= 768;
            const cy = H / 2;
            const R = isMobile ? 180 : 280;
            const apexX = W - (isMobile ? 12 : 22);
            const cx = apexX + R;
            const stepAngleDeg = isMobile ? 24 : 26;
            const halfH = isMobile ? 22 : 28;
            const itemW = isMobile ? 104 : 128;

            const activeIdx = Math.round(currentPos);

            items.forEach(item => {
                const offset = item.index - currentPos;
                const thetaDeg = offset * stepAngleDeg;

                if (Math.abs(thetaDeg) > 68) {
                    item.el.style.display = 'none';
                    return;
                }
                item.el.style.display = 'flex';

                const thetaRad = thetaDeg * (Math.PI / 180);
                const dotX = cx - R * Math.cos(thetaRad);
                const dotY = cy + R * Math.sin(thetaRad);

                const isActive = (item.index === activeIdx && Math.abs(offset) < 0.48);
                const opacity = Math.max(0.12, 1 - Math.abs(offset) * 0.38);

                item.el.classList.toggle('active', isActive);
                // Rotate negatively to curve symmetrically toward center
                item.el.style.transform = `translate3d(${(dotX - itemW).toFixed(1)}px, ${(dotY - halfH).toFixed(1)}px, 0) rotate(${-thetaDeg.toFixed(1)}deg)`;
                item.el.style.opacity = opacity.toFixed(3);
            });
        }

        function snap(idx) {
            const maxIdx = items.length - 1;
            const clamped = Math.max(0, Math.min(maxIdx, idx));
            const changed = Math.round(targetPos) !== clamped;
            targetPos = clamped;
            if (changed) {
                playDialTick(baseFreq);
                onSnap(clamped);
            }
        }

        function step(direction) {
            snap(Math.round(targetPos) + direction);
            focusColumn();
        }

        function focusColumn() {
            state.activeUnit = 'year';
            document.querySelectorAll('.dial-column').forEach(c => {
                c.classList.toggle('focused', c === colEl);
            });
        }

        // Pointer Drag Handlers
        const onStart = (clientY) => {
            isDown = true;
            startY = clientY;
            startPos = targetPos;
            dragDistance = 0;
            focusColumn();
        };

        const onMove = (clientY) => {
            if (!isDown) return;
            const diffY = clientY - startY;
            dragDistance = Math.abs(diffY);
            const sensitivity = window.innerWidth <= 768 ? 38 : 50;
            const offsetChange = -diffY / sensitivity;
            const maxIdx = items.length - 1;
            targetPos = Math.max(-0.4, Math.min(maxIdx + 0.4, startPos + offsetChange));
        };

        const onEnd = () => {
            if (!isDown) return;
            isDown = false;
            snap(Math.round(targetPos));
        };

        colEl.addEventListener('mousedown', (e) => onStart(e.clientY));
        window.addEventListener('mousemove', (e) => onMove(e.clientY));
        window.addEventListener('mouseup', onEnd);

        colEl.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
        colEl.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
        colEl.addEventListener('touchend', onEnd);
        colEl.addEventListener('touchcancel', onEnd);

        // Wheel Handler
        let wheelTimer = false;
        colEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (wheelTimer) return;
            const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (Math.abs(delta) > 8) {
                wheelTimer = true;
                step(delta > 0 ? 1 : -1);
                setTimeout(() => { wheelTimer = false; }, 110);
            }
        }, { passive: false });

        return {
            unit: 'year',
            colEl,
            build,
            render,
            snap,
            step,
            focusColumn,
            get targetPos() { return targetPos; },
            set targetPos(v) { targetPos = v; },
            get currentPos() { return currentPos; },
            set currentPos(v) { currentPos = v; },
            get length() { return items.length; }
        };
    }

    // 6C. Cylindrical Drum Wheel for MONTH (Center Column)
    function createCenterDrumWheelMonth({
        colEl,
        trackEl,
        getValues,
        getInitialIndex,
        onSnap,
        baseFreq = 470
    }) {
        let items = [];
        let currentPos = getInitialIndex();
        let targetPos = currentPos;
        let isDown = false;
        let startY = 0;
        let startPos = 0;
        let dragDistance = 0;

        function build() {
            trackEl.innerHTML = '';
            items = [];
            const values = getValues();

            values.forEach((val, idx) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'dial-center-item dial-month-item';
                itemEl.dataset.index = idx;
                itemEl.textContent = val;

                itemEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (dragDistance < 6) {
                        snap(idx);
                        focusColumn();
                    }
                });

                trackEl.appendChild(itemEl);
                items.push({ el: itemEl, index: idx, value: val });
            });

            targetPos = Math.max(0, Math.min(values.length - 1, targetPos));
            currentPos = targetPos;
            render();
        }

        function render() {
            if (!items.length) return;
            const isMobile = window.innerWidth <= 768;
            const h = isMobile ? 44 : 56;
            const activeIdx = Math.round(currentPos);

            items.forEach(item => {
                const offset = item.index - currentPos;
                if (Math.abs(offset) > 3.3) {
                    item.el.style.display = 'none';
                    return;
                }
                item.el.style.display = 'flex';

                const y = offset * h;
                const rotateX = -offset * 20; // 3D cylindrical drum curve
                const scale = Math.max(0.76, 1 - Math.abs(offset) * 0.10);
                const opacity = Math.max(0.12, 1 - Math.abs(offset) * 0.38);
                const isActive = (item.index === activeIdx && Math.abs(offset) < 0.48);

                item.el.classList.toggle('active', isActive);
                item.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotateX(${rotateX.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
                item.el.style.opacity = opacity.toFixed(3);
            });
        }

        function snap(idx) {
            const maxIdx = items.length - 1;
            const clamped = Math.max(0, Math.min(maxIdx, idx));
            const changed = Math.round(targetPos) !== clamped;
            targetPos = clamped;
            if (changed) {
                playDialTick(baseFreq);
                onSnap(clamped);
            }
        }

        function step(direction) {
            snap(Math.round(targetPos) + direction);
            focusColumn();
        }

        function focusColumn() {
            state.activeUnit = 'month';
            document.querySelectorAll('.dial-column').forEach(c => {
                c.classList.toggle('focused', c === colEl);
            });
        }

        // Pointer Drag Handlers
        const onStart = (clientY) => {
            isDown = true;
            startY = clientY;
            startPos = targetPos;
            dragDistance = 0;
            focusColumn();
        };

        const onMove = (clientY) => {
            if (!isDown) return;
            const diffY = clientY - startY;
            dragDistance = Math.abs(diffY);
            const sensitivity = window.innerWidth <= 768 ? 38 : 50;
            const offsetChange = -diffY / sensitivity;
            const maxIdx = items.length - 1;
            targetPos = Math.max(-0.4, Math.min(maxIdx + 0.4, startPos + offsetChange));
        };

        const onEnd = () => {
            if (!isDown) return;
            isDown = false;
            snap(Math.round(targetPos));
        };

        colEl.addEventListener('mousedown', (e) => onStart(e.clientY));
        window.addEventListener('mousemove', (e) => onMove(e.clientY));
        window.addEventListener('mouseup', onEnd);

        colEl.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
        colEl.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
        colEl.addEventListener('touchend', onEnd);
        colEl.addEventListener('touchcancel', onEnd);

        // Wheel Handler
        let wheelTimer = false;
        colEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (wheelTimer) return;
            const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (Math.abs(delta) > 8) {
                wheelTimer = true;
                step(delta > 0 ? 1 : -1);
                setTimeout(() => { wheelTimer = false; }, 110);
            }
        }, { passive: false });

        return {
            unit: 'month',
            colEl,
            build,
            render,
            snap,
            step,
            focusColumn,
            get targetPos() { return targetPos; },
            set targetPos(v) { targetPos = v; },
            get currentPos() { return currentPos; },
            set currentPos(v) { currentPos = v; },
            get length() { return items.length; }
        };
    }

    // 7. INITIALIZATION
    function initWoveAvailability() {
        dialWheelContainer = document.getElementById('dial-wheel-container');
        dialTrackCircleDay = document.getElementById('dial-track-circle-day');
        dialTrackSolidDay = document.getElementById('dial-track-solid-day');
        dialTrackCircleYear = document.getElementById('dial-track-circle-year');
        dialTrackSolidYear = document.getElementById('dial-track-solid-year');

        colDayEl = document.getElementById('dial-col-day');
        colMonthEl = document.getElementById('dial-col-month');
        colYearEl = document.getElementById('dial-col-year');

        trackDayEl = document.getElementById('dial-track-day');
        trackMonthEl = document.getElementById('dial-track-month');
        trackYearEl = document.getElementById('dial-track-year');



        activeWeekdayPill = document.getElementById('active-weekday-pill');
        activeDatePrimary = document.getElementById('active-date-primary');
        activeDateSub = document.getElementById('active-date-sub');
        activeStatusText = document.getElementById('active-status-text');



        sessionNoonBtn = document.getElementById('session-noon-btn');
        sessionNightBtn = document.getElementById('session-night-btn');
        checkAvailabilityBtn = document.getElementById('check-availability-btn');
        resultPanel = document.getElementById('availability-result-panel');

        if (!dialWheelContainer || !colDayEl || !colMonthEl || !colYearEl) return;

        // Instantiate Wheels: Left Arc Wheel (DAY), Center Drum (MONTH), Right Arc Wheel (YEAR)
        dayWheel = createCircularArcWheelDay({
            colEl: colDayEl,
            trackEl: trackDayEl,
            baseFreq: 520,
            getValues: () => {
                const total = getDaysInMonth(state.selectedYear, state.selectedMonth);
                const arr = [];
                for (let i = 1; i <= total; i++) arr.push(pad2(i));
                return arr;
            },
            getInitialIndex: () => Math.min(state.selectedDay - 1, getDaysInMonth(state.selectedYear, state.selectedMonth) - 1),
            onSnap: (idx) => {
                state.selectedDay = idx + 1;
                updateDetailPanel();
            }
        });

        monthWheel = createCenterDrumWheelMonth({
            colEl: colMonthEl,
            trackEl: trackMonthEl,
            baseFreq: 470,
            getValues: () => {
                const arr = [];
                for (let i = 1; i <= 12; i++) arr.push(pad2(i));
                return arr;
            },
            getInitialIndex: () => state.selectedMonth,
            onSnap: (idx) => {
                state.selectedMonth = idx;
                clampDays();
                updateDetailPanel();
            }
        });

        yearWheel = createCircularArcWheelYear({
            colEl: colYearEl,
            trackEl: trackYearEl,
            baseFreq: 420,
            getValues: () => YEARS.map(String),
            getInitialIndex: () => Math.max(0, YEARS.indexOf(state.selectedYear)),
            onSnap: (idx) => {
                state.selectedYear = YEARS[idx];
                clampDays();
                updateDetailPanel();
            }
        });

        // Build all 3 wheels
        dayWheel.build();
        monthWheel.build();
        yearWheel.build();

        // Default focus on Day
        dayWheel.focusColumn();

        // Setup controls & interactions


        setupSessionControls();
        setupCtaAction();
        updateSvgArc();

        // Start render animation loop
        requestAnimationFrame(renderLoop);

        // Update detail panel
        updateDetailPanel();
    }

    // 8. DAY CLAMPING LOGIC
    function clampDays() {
        const total = getDaysInMonth(state.selectedYear, state.selectedMonth);
        if (dayWheel.length !== total) {
            dayWheel.build();
        }
        if (state.selectedDay > total) {
            state.selectedDay = total;
            dayWheel.snap(total - 1);
        }
    }

    // 9. ANIMATION LOOP (Physics Lerp Smoothing)
    function renderLoop() {
        const lerp = 0.22;
        [dayWheel, monthWheel, yearWheel].forEach(ctrl => {
            if (!ctrl) return;
            const delta = ctrl.targetPos - ctrl.currentPos;
            if (Math.abs(delta) > 0.001) {
                ctrl.currentPos += delta * lerp;
                ctrl.render();
            } else if (ctrl.currentPos !== ctrl.targetPos) {
                ctrl.currentPos = ctrl.targetPos;
                ctrl.render();
            }
        });
        requestAnimationFrame(renderLoop);
    }

    // 10. UPDATE DETAIL PANEL
    function updateDetailPanel() {
        const totalDays = getDaysInMonth(state.selectedYear, state.selectedMonth);
        const day = Math.min(state.selectedDay, totalDays);
        const monthNum = pad2(state.selectedMonth + 1);
        const monthName = MONTHS_FULL[state.selectedMonth];
        const year = state.selectedYear;
        const weekday = getWeekdayFull(year, state.selectedMonth, day);



        // Update active date header
        if (activeWeekdayPill) activeWeekdayPill.textContent = weekday.toUpperCase();
        if (activeDatePrimary) activeDatePrimary.textContent = `${day} ${monthName} ${year}`;
        if (activeDateSub) activeDateSub.textContent = `The Grand Royal Ballroom & Imperial Lawns`;



        // Evaluate live status label for both sessions
        const mPad = monthNum;
        const dPad = pad2(day);
        const dateKey = `${year}-${mPad}-${dPad}`;
        const noonKey = `${dateKey}-noon`;
        const nightKey = `${dateKey}-night`;

        const isNoonReserved = isReservedKey(noonKey);
        const isNightReserved = isReservedKey(nightKey);
        const isCurrentSessionReserved = state.selectedSession === 'noon' ? isNoonReserved : isNightReserved;

        // 1. Update session choice card badges
        if (sessionNoonBtn) {
            const badge = sessionNoonBtn.querySelector('.choice-badge');
            if (badge) {
                badge.textContent = isNoonReserved ? 'CLOSED' : 'DAY';
                badge.classList.toggle('is-closed', isNoonReserved);
            }
        }

        if (sessionNightBtn) {
            const badge = sessionNightBtn.querySelector('.choice-badge');
            if (badge) {
                badge.textContent = isNightReserved ? 'CLOSED' : 'EVE';
                badge.classList.toggle('is-closed', isNightReserved);
            }
        }

        // 2. Update status dot & text in detail panel
        const activeStatusDot = document.querySelector('.active-status-dot');
        if (activeStatusText) {
            if (isCurrentSessionReserved) {
                if (isNoonReserved && isNightReserved) {
                    activeStatusText.textContent = '⛔ FULL DATE CLOSED — BOOKED';
                } else {
                    activeStatusText.textContent = `⛔ ${state.selectedSession.toUpperCase()} CLOSED — BOOKED`;
                }
                activeStatusText.style.color = '#f43f5e';
                if (activeStatusDot) {
                    activeStatusDot.style.background = '#f43f5e';
                    activeStatusDot.style.boxShadow = '0 0 10px #f43f5e';
                }
            } else {
                activeStatusText.textContent = '✦ Available for Buyout';
                activeStatusText.style.color = '#10b981';
                if (activeStatusDot) {
                    activeStatusDot.style.background = '#10b981';
                    activeStatusDot.style.boxShadow = '0 0 8px #10b981';
                }
            }
        }

        // 3. Update CTA button on main page
        if (checkAvailabilityBtn) {
            const ctaText = checkAvailabilityBtn.querySelector('.cta-text');
            if (isCurrentSessionReserved) {
                checkAvailabilityBtn.classList.add('slot-closed');
                if (ctaText) ctaText.textContent = `⛔ Booking Closed (${state.selectedSession === 'noon' ? 'Noon' : 'Night'})`;
            } else {
                checkAvailabilityBtn.classList.remove('slot-closed');
                if (ctaText) ctaText.textContent = 'Check Availability';
            }
        }
    }

    // 11. SVG ARC BACKGROUND UPDATE
    function updateSvgArc() {
        if (!dialWheelContainer || !colDayEl || !colYearEl || !trackDayEl) return;
        const contRect = dialWheelContainer.getBoundingClientRect();
        const colDayRect = colDayEl.getBoundingClientRect();
        const colYearRect = colYearEl.getBoundingClientRect();
        const trackDayRect = trackDayEl.getBoundingClientRect();

        const isMobile = window.innerWidth <= 768;
        const cy = (trackDayRect.top - contRect.top) + (trackDayEl.clientHeight / 2);
        const R = isMobile ? 180 : 280;

        // Day Arc on Left
        if (dialTrackCircleDay && dialTrackSolidDay) {
            const dayApexX = (colDayRect.left - contRect.left) + (isMobile ? 12 : 22);
            const cxDay = dayApexX - R;

            dialTrackCircleDay.setAttribute('cx', cxDay);
            dialTrackCircleDay.setAttribute('cy', cy);
            dialTrackCircleDay.setAttribute('r', R);

            dialTrackSolidDay.setAttribute('cx', cxDay);
            dialTrackSolidDay.setAttribute('cy', cy);
            dialTrackSolidDay.setAttribute('r', R);
        }

        // Year Arc on Right
        if (dialTrackCircleYear && dialTrackSolidYear) {
            const yearApexX = (colYearRect.left - contRect.left) + colYearRect.width - (isMobile ? 12 : 22);
            const cxYear = yearApexX + R;

            dialTrackCircleYear.setAttribute('cx', cxYear);
            dialTrackCircleYear.setAttribute('cy', cy);
            dialTrackCircleYear.setAttribute('r', R);

            dialTrackSolidYear.setAttribute('cx', cxYear);
            dialTrackSolidYear.setAttribute('cy', cy);
            dialTrackSolidYear.setAttribute('r', R);
        }
    }





    // 14. SESSION CONTROLS (Noon / Night)
    function setupSessionControls() {
        const setSession = (type) => {
            state.selectedSession = type;
            if (sessionNoonBtn) {
                sessionNoonBtn.classList.toggle('active', type === 'noon');
                sessionNoonBtn.setAttribute('aria-checked', type === 'noon' ? 'true' : 'false');
            }
            if (sessionNightBtn) {
                sessionNightBtn.classList.toggle('active', type === 'night');
                sessionNightBtn.setAttribute('aria-checked', type === 'night' ? 'true' : 'false');
            }
            playDialTick(460);
            updateDetailPanel();
        };

        if (sessionNoonBtn) sessionNoonBtn.addEventListener('click', () => setSession('noon'));
        if (sessionNightBtn) sessionNightBtn.addEventListener('click', () => setSession('night'));
    }

    // 15. CHECK AVAILABILITY CTA & RESULT MODAL
    function setupCtaAction() {
        if (!checkAvailabilityBtn) return;

        checkAvailabilityBtn.addEventListener('click', async () => {
            if (state.isChecking) return;
            state.isChecking = true;

            checkAvailabilityBtn.classList.add('is-checking');
            const originalText = checkAvailabilityBtn.querySelector('.cta-text').textContent;
            checkAvailabilityBtn.querySelector('.cta-text').textContent = 'Consulting Sanctuary Records';

            playDialTick(600, 0.08);

            try {
                const result = await queryAvailability(
                    state.selectedDay,
                    state.selectedMonth,
                    state.selectedYear,
                    state.selectedSession
                );

                renderResultModal(result);
            } finally {
                state.isChecking = false;
                checkAvailabilityBtn.classList.remove('is-checking');
                checkAvailabilityBtn.querySelector('.cta-text').textContent = originalText;
            }
        });
    }

    function renderResultModal(result) {
        if (!resultPanel) return;

        playCelebrationChime();

        const isAvail = result.isAvailable;
        const sessionTitle = result.session === 'noon'
            ? 'Noon Celebration (10:00 AM – 3:30 PM)'
            : 'Night Celebration (5:30 PM – 11:30 PM)';

        const mIdx = MONTHS_FULL.indexOf(result.month);
        const mPad = pad2(mIdx + 1);
        const dPad = pad2(result.day);
        const dateKey = `${result.year}-${mPad}-${dPad}`;
        const otherSession = result.session === 'noon' ? 'night' : 'noon';
        const otherKey = `${dateKey}-${otherSession}`;
        const isOtherReserved = isReservedKey(otherKey);
        const otherSessionTitle = otherSession === 'noon' ? 'Noon Session (10 AM – 3:30 PM)' : 'Night Session (5:30 PM – 11:30 PM)';

        resultPanel.innerHTML = `
            <div class="result-card">
                <button class="result-close-btn" id="result-close-btn" aria-label="Close Result">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div class="result-badge ${isAvail ? 'available' : 'reserved'}">
                    <span>${isAvail ? '✦ AVAILABLE FOR CELEBRATION' : '⛔ BOOKING CLOSED · RESERVED'}</span>
                </div>

                <h3 class="result-date-title">${result.day} ${result.month} ${result.year}</h3>
                <div class="result-session-subtitle">${result.weekday} · ${sessionTitle}</div>

                <div class="result-body-text">
                    ${isAvail
                        ? `Magnificent news! The sanctuary is unreserved for this slot. You are eligible for an exclusive private buyout across all halls, starlight lawns, and bridal pavilions.`
                        : `This ${result.session === 'noon' ? 'Afternoon' : 'Evening'} celebration slot has been officially closed and marked as reserved in the venue booking records. ${!isOtherReserved ? `The alternate ${otherSession === 'noon' ? 'Afternoon' : 'Evening'} slot on this date is still open.` : `Both sessions on this date are fully reserved.`}`}
                </div>

                <div class="result-details-grid">
                    <div class="result-detail-item">
                        <span class="detail-label">Designated Venue</span>
                        <span class="detail-val">${result.venueName}</span>
                    </div>
                    <div class="result-detail-item">
                        <span class="detail-label">Guest Capacity</span>
                        <span class="detail-val">${result.capacity}</span>
                    </div>
                    <div class="result-detail-item">
                        <span class="detail-label">Curated Experience</span>
                        <span class="detail-val">${result.packageTier}</span>
                    </div>
                    <div class="result-detail-item">
                        <span class="detail-label">Sanctuary Status</span>
                        <span class="detail-val" style="color: ${isAvail ? '#6ee7b7' : '#fb7185'};">
                            ${isAvail ? 'Open for Deposit' : 'Booking Closed'}
                        </span>
                    </div>
                </div>

                <div class="result-actions">
                    ${isAvail
                        ? `<button class="result-btn-primary" id="result-book-btn">Proceed to Reserve Date →</button>
                           <button class="result-btn-secondary" id="result-viewing-btn">Schedule Private Tour</button>`
                        : (!isOtherReserved
                            ? `<button class="result-btn-primary" id="result-switch-btn">Switch to ${otherSessionTitle} →</button>
                               <button class="result-btn-secondary" id="result-concierge-btn">Speak with Royal Concierge</button>`
                            : `<button class="result-btn-closed" disabled>⛔ All Sessions Closed for this Date</button>
                               <button class="result-btn-secondary" id="result-concierge-btn">Inquire for Other Dates</button>`
                          )
                    }
                </div>
            </div>
        `;

        resultPanel.classList.add('active');

        // Close handlers
        const closeBtn = document.getElementById('result-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeResultModal);

        resultPanel.addEventListener('click', (e) => {
            if (e.target === resultPanel) closeResultModal();
        });

        // Action Handlers
        const bookBtn = document.getElementById('result-book-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                closeResultModal();
                invokeConcierge(result);
            });
        }

        const switchBtn = document.getElementById('result-switch-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => {
                closeResultModal();
                const newSession = result.session === 'noon' ? 'night' : 'noon';
                const setSession = (type) => {
                    state.selectedSession = type;
                    if (sessionNoonBtn) sessionNoonBtn.classList.toggle('active', type === 'noon');
                    if (sessionNightBtn) sessionNightBtn.classList.toggle('active', type === 'night');
                    updateDetailPanel();
                };
                setSession(newSession);
                setTimeout(() => checkAvailabilityBtn.click(), 300);
            });
        }

        const conciergeBtn = document.getElementById('result-concierge-btn');
        if (conciergeBtn) {
            conciergeBtn.addEventListener('click', () => {
                closeResultModal();
                invokeConcierge(result);
            });
        }

        const viewingBtn = document.getElementById('result-viewing-btn');
        if (viewingBtn) {
            viewingBtn.addEventListener('click', () => {
                closeResultModal();
                invokeConcierge(result, 'I would like to schedule a private venue walkthrough.');
            });
        }
    }

    function closeResultModal() {
        if (!resultPanel) return;
        resultPanel.classList.remove('active');
    }

    function invokeConcierge(result, customQuery = null) {
        const orbBtn = document.getElementById('ai-orb-btn');
        const sessionLabel = result.session === 'noon' ? 'Noon Celebration' : 'Night Celebration';
        const defaultPrompt = `Greetings! I would like to inquire about reserving Auralis for ${result.weekday}, ${result.day} ${result.month} ${result.year} (${sessionLabel}). Could you provide detailed pricing and terms?`;
        const promptText = customQuery || defaultPrompt;

        if (orbBtn) {
            orbBtn.click();
            setTimeout(() => {
                const aiInput = document.querySelector('.ai-chat-input') || document.querySelector('#ai-chat-input');
                const aiSend = document.querySelector('.ai-send-btn') || document.querySelector('#ai-send-btn');
                if (aiInput) {
                    aiInput.value = promptText;
                    aiInput.dispatchEvent(new Event('input', { bubbles: true }));
                    if (aiSend) setTimeout(() => aiSend.click(), 400);
                }
            }, 500);
        }
    }

    // 16. RESIZE & ESCAPE HANDLERS
    window.addEventListener('resize', () => {
        updateSvgArc();
        if (dayWheel) dayWheel.render();
        if (monthWheel) monthWheel.render();
        if (yearWheel) yearWheel.render();
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            updateSvgArc();
            if (dayWheel) dayWheel.render();
            if (monthWheel) monthWheel.render();
            if (yearWheel) yearWheel.render();
        }, 200);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeResultModal();
    });

    // Real-Time Cross-Tab & Focus Synchronization with Admin Suite
    window.addEventListener('storage', (e) => {
        if (!e.key || e.key === 'auralis_admin_bookings_v1') {
            updateDetailPanel();
        }
    });

    window.addEventListener('auralis-bookings-updated', () => {
        updateDetailPanel();
    });

    window.addEventListener('focus', () => {
        updateDetailPanel();
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateDetailPanel();
        }
    });

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWoveAvailability);
    } else {
        initWoveAvailability();
    }
})();
