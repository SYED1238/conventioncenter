/**
 * Cinematic College Loader — One-Time Premium Entry Experience
 * 
 * Shows a jaw-dropping loading sequence on first visit.
 * Uses sessionStorage so it only fires ONCE per session.
 * Refresh will NOT trigger it again.
 * Closing tab and reopening WILL trigger it again.
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // SESSION GATE — Skip if already seen this session
    // -------------------------------------------------------------------------
    const STORAGE_KEY = 'gce_loader_seen';

    if (sessionStorage.getItem(STORAGE_KEY)) {
        // Already seen this session — bail immediately, show nothing
        return;
    }

    // Mark as seen BEFORE building (so if page crashes/reloads, won't show again)
    sessionStorage.setItem(STORAGE_KEY, '1');

    // -------------------------------------------------------------------------
    // BUILD LOADER DOM
    // -------------------------------------------------------------------------
    const screen = document.createElement('div');
    screen.className = 'loader-screen';

    screen.innerHTML = `
        <div class="loader-seal">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>
                <circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
                <polygon points="50,20 56,40 76,40 60,52 66,72 50,60 34,72 40,52 24,40 44,40" 
                         stroke="currentColor" stroke-width="0.8" fill="rgba(197,168,128,0.08)"/>
                <circle cx="50" cy="50" r="12" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>
                <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.4"/>
            </svg>
        </div>

        <div class="loader-title" id="loader-title-text"></div>
        <div class="loader-subtitle">College of Engineering</div>

        <div class="loader-progress-wrapper">
            <div class="loader-progress-track">
                <div class="loader-progress-fill" id="loader-progress-bar"></div>
            </div>
            <div class="loader-status" id="loader-status-text">Initializing</div>
        </div>

        <div class="loader-meta">Estd. 1980 &nbsp;·&nbsp; Affiliated to VTU, Belagavi</div>
    `;

    // -------------------------------------------------------------------------
    // INJECT INTO PAGE — Must happen before DOMContentLoaded for instant show
    // -------------------------------------------------------------------------
    if (document.body) {
        document.body.prepend(screen);
        runLoader();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.prepend(screen);
            runLoader();
        });
    }

    // -------------------------------------------------------------------------
    // LOADER ORCHESTRATOR
    // -------------------------------------------------------------------------
    function runLoader() {

        // --- Letter-by-letter title animation ---
        const titleEl = document.getElementById('loader-title-text');
        const titleText = 'GHOUSIA';
        titleText.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.animationDelay = `${0.5 + i * 0.08}s`;
            titleEl.appendChild(span);
        });

        // --- Progress bar simulation ---
        const progressBar = document.getElementById('loader-progress-bar');
        const statusText = document.getElementById('loader-status-text');

        const stages = [
            { progress: 12,  text: 'Loading Campus Assets',        delay: 400  },
            { progress: 28,  text: 'Preparing Atmosphere Engine',   delay: 500  },
            { progress: 45,  text: 'Rendering Weather Systems',     delay: 450  },
            { progress: 62,  text: 'Initializing Audio Engine',     delay: 400  },
            { progress: 78,  text: 'Loading Campus Intelligence',   delay: 500  },
            { progress: 90,  text: 'Calibrating Visuals',           delay: 350  },
            { progress: 100, text: 'Welcome to Ghousia',            delay: 600  },
        ];

        let currentStage = 0;

        function advanceStage() {
            if (currentStage >= stages.length) {
                // All stages done — exit after a short pause
                setTimeout(exitLoader, 500);
                return;
            }

            const stage = stages[currentStage];

            // Animate status text change
            statusText.classList.add('changing');
            setTimeout(() => {
                statusText.textContent = stage.text;
                statusText.classList.remove('changing');
            }, 150);

            // Animate progress bar
            progressBar.style.width = stage.progress + '%';

            currentStage++;
            setTimeout(advanceStage, stage.delay);
        }

        // Start after initial animations have played
        setTimeout(advanceStage, 1600);

        // --- Exit sequence ---
        function exitLoader() {
            screen.classList.add('exit');

            // Remove from DOM after animation finishes
            screen.addEventListener('animationend', () => {
                screen.remove();
            }, { once: true });

            // Fallback removal
            setTimeout(() => {
                if (screen.parentNode) screen.remove();
            }, 1500);
        }
    }

})();
