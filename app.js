/**
 * Aetheris Academy - Cinematic Atmosphere Engine
 * Premium Weather Controller with Orchestrated Transitions
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. State & DOM References
    // -------------------------------------------------------------------------
    const state = {
        weather: 'clear',      // 'clear' | 'rain' | 'night'
        audioEnabled: false,
        audioInitialized: false,
        width: window.innerWidth,
        height: window.innerHeight,
        transitioning: false,
        mouseX: 0,
        mouseY: 0,
        parallaxX: 0,
        parallaxY: 0,
        targetParallaxX: 0,
        targetParallaxY: 0
    };

    // DOM Nodes
    const controller = document.getElementById('weather-controller');
    const controllerTiltWrapper = document.getElementById('controller-tilt-wrapper');
    const buttons = {
        clear: document.getElementById('btn-clear'),
        rain: document.getElementById('btn-rain'),
        night: document.getElementById('btn-night')
    };
    const activeTracker = document.getElementById('active-tracker');
    const controllerGlow = document.getElementById('controller-glow-bg');
    const navbar = document.getElementById('identity-panel');

    const backgrounds = {
        clear: document.getElementById('bg-day-layer'),
        rain: document.getElementById('bg-rain-layer'),
        night: document.getElementById('bg-night-layer')
    };

    // -------------------------------------------------------------------------
    // IMAGE SET SWITCHER — Mobile vs Desktop
    // Runs on load and on every resize. Replaces background-image only.
    // All weather transitions (opacity crossfades) continue to work unchanged.
    // -------------------------------------------------------------------------
    const imageSets = {
        desktop: {
            clear: "Assets/images/hall-day.jpg",
            rain:  "Assets/images/hall-rain.jpg",
            night: "Assets/images/hall-night.jpg"
        },
        mobile: {
            clear: "Assets/images/mobile/hall-day-mobile.jpg",
            rain:  "Assets/images/mobile/hall-rain-mobile.jpg",
            night: "Assets/images/mobile/hall-night-mobile.jpg"
        }
    };

    let currentImageSet = null; // track which set is loaded to avoid redundant DOM writes

    function applyImageSet() {
        const isMobile = window.innerWidth <= 768;
        const setKey = isMobile ? 'mobile' : 'desktop';

        // Only update if the set actually changed (avoids style flicker on minor resizes)
        if (currentImageSet === setKey) return;
        currentImageSet = setKey;

        const set = imageSets[setKey];
        backgrounds.clear.style.backgroundImage = `url('${set.clear}')`;
        backgrounds.rain.style.backgroundImage  = `url('${set.rain}')`;
        backgrounds.night.style.backgroundImage = `url('${set.night}')`;
    }

    // Apply immediately (before first paint)
    applyImageSet();

    // Re-apply on resize (debounced — only fires 150ms after resize stops)
    let resizeDebounceTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeDebounceTimer);
        resizeDebounceTimer = setTimeout(applyImageSet, 150);
    });



    const canvases = {
        atmospheric: document.getElementById('atmospheric-canvas'),
        glassDrops: document.getElementById('glass-drops-canvas')
    };

    const lightningOverlay = document.getElementById('lightning-flash-overlay');
    const audioWidget = document.getElementById('audio-widget');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const audioStatusText = document.getElementById('audio-status-text');

    const heroTitle = document.getElementById('hero-main-heading');
    const heroSubtitle = document.getElementById('hero-subtitle-text');
    const heroSection = document.getElementById('campus-hero');

    const atmosphereStatusEl = document.getElementById('atmosphere-status');
    const atmosphereStatusText = document.getElementById('atmosphere-status-text');

    // -------------------------------------------------------------------------
    // 1b. Dynamic Content Per Weather
    // -------------------------------------------------------------------------
    const heroContent = {
        clear: {
            title: 'Where Forever Begins. <br><span class="text-gradient">Crafted in Splendor.</span>',
            subtitle: 'Step into an architectural masterpiece designed for your most cherished moments. Experience sunlit banquet halls, manicured gardens, and world-class hospitality.'
        },
        rain: {
            title: 'Monsoon Romance. <br><span class="text-gradient">Unforgettable Memories.</span>',
            subtitle: 'Watch the grand glass facade reflect the poetry of gentle monsoon rain. Cozy luxury banquet halls, ambient chandeliers, and heartfelt celebratory moments.'
        },
        night: {
            title: 'A Starlit Haven. <br><span class="text-gradient">Illuminated in Grandeur.</span>',
            subtitle: 'When twilight falls, Auralis glows with royal elegance. Grand facade lighting, illuminated garden promenades, and celebratory starlight splendor.'
        }
    };

    const statusMessages = {
        clear: { initializing: 'Setting Daylight Ambiance...', active: 'Day Ceremony Ambiance Active' },
        rain: { initializing: 'Setting Rain Ambiance...', active: 'Monsoon Celebration Mood Active' },
        night: { initializing: 'Setting Evening Lights...', active: 'Starlight Reception Active' }
    };

    // -------------------------------------------------------------------------
    // 2. Setup Canvas Contexts and Scaling
    // -------------------------------------------------------------------------
    const ctxs = {
        atmospheric: canvases.atmospheric.getContext('2d'),
        glassDrops: canvases.glassDrops.getContext('2d')
    };

    function resizeCanvases() {
        state.width = window.innerWidth;
        state.height = window.innerHeight;

        const dpr = window.devicePixelRatio || 1;

        Object.keys(canvases).forEach(key => {
            const canvas = canvases[key];
            canvas.width = state.width * dpr;
            canvas.height = state.height * dpr;
            canvas.style.width = `${state.width}px`;
            canvas.style.height = `${state.height}px`;

            const ctx = ctxs[key];
            ctx.resetTransform();
            ctx.scale(dpr, dpr);
        });

        // Initialize particles if size changes
        initAtmosphericParticles();
        initGlassDrops();

        // Re-align the active pill tracker on controller resize
        updateActiveTracker();
    }

    // -------------------------------------------------------------------------
    // 3. Ambient Audio Engine (Web Audio API Synthesizer)
    // -------------------------------------------------------------------------
    let audioCtx = null;
    let synthNodes = {
        // Clear nodes
        clearBreeze: null,
        clearBirds: null,
        // Rain nodes
        rainRain: null,
        rainThunder: null,
        // Night nodes
        nightDrone: null,
        nightCrickets: null,
        // Master gain
        masterGain: null,
        // Mode gains for crossfading
        gains: {
            clear: null,
            rain: null,
            night: null
        }
    };

    function initAudioEngine() {
        if (state.audioInitialized) return;

        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        // Create Master Gain for Volume Muting & Controls
        synthNodes.masterGain = audioCtx.createGain();
        synthNodes.masterGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        synthNodes.masterGain.connect(audioCtx.destination);

        // Create Weather Channel Gain Nodes for transitions
        ['clear', 'rain', 'night'].forEach(mode => {
            synthNodes.gains[mode] = audioCtx.createGain();
            synthNodes.gains[mode].gain.setValueAtTime(mode === state.weather ? 0.6 : 0, audioCtx.currentTime);
            synthNodes.gains[mode].connect(synthNodes.masterGain);
        });

        // --- Build Clear Environment Synthesizer (Breeze & Birds) ---
        setupClearSynth();

        // --- Build Rain Environment Synthesizer (Rain & Dynamic Thunder) ---
        setupRainSynth();

        // --- Build Night Environment Synthesizer (Ambient Drone & Insect Chirps) ---
        setupNightSynth();

        state.audioInitialized = true;
    }

    // Procedural sound generators
    function triggerLockedChime() {
        if (!state.audioEnabled || !state.audioInitialized || !audioCtx) return;
        
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.08); // descending double-blip
        
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gainNode);
        gainNode.connect(synthNodes.masterGain || audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
    }

    function triggerProceduralBirdChirp(chirpType = null) {
        if (!state.audioEnabled || state.weather !== 'clear' || !state.audioInitialized || !audioCtx) return;

        const modeGain = synthNodes.gains.clear;
        if (!modeGain) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);

        osc.connect(gainNode);
        gainNode.connect(modeGain);

        const now = audioCtx.currentTime;
        const type = chirpType !== null ? chirpType : Math.random();

        if (type < 0.35) {
            // Short double-chirp
            osc.frequency.setValueAtTime(3200, now);
            osc.frequency.exponentialRampToValueAtTime(4200, now + 0.08);
            gainNode.gain.linearRampToValueAtTime(0.04, now + 0.02);
            gainNode.gain.linearRampToValueAtTime(0.0, now + 0.08);

            osc.frequency.setValueAtTime(3200, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(4500, now + 0.25);
            gainNode.gain.linearRampToValueAtTime(0.04, now + 0.17);
            gainNode.gain.linearRampToValueAtTime(0.0, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.26);
        } else if (type < 0.7) {
            // Sweet trill
            osc.frequency.setValueAtTime(2800, now);
            for (let j = 0; j < 6; j++) {
                const t = now + j * 0.04;
                osc.frequency.setValueAtTime(2800 + (j % 2) * 800, t);
            }
            gainNode.gain.linearRampToValueAtTime(0.03, now + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.0, now + 0.24);
            osc.start(now);
            osc.stop(now + 0.25);
        } else {
            // Alarm chirp / flight chirp (takeoff/landing/startled)
            osc.frequency.setValueAtTime(3500, now);
            osc.frequency.exponentialRampToValueAtTime(5000, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.05, now + 0.02);
            gainNode.gain.linearRampToValueAtTime(0.0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.11);
        }
    }

    function setupClearSynth() {
        const modeGain = synthNodes.gains.clear;

        // Breeze - White Noise through resonant lowpass filter
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const lowpass = audioCtx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 400;
        lowpass.Q.value = 3;

        // Modulate breeze filter cutoff using a very slow LFO
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15; // Slow breeze oscillation

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 150;

        lfo.connect(lfoGain);
        lfoGain.connect(lowpass.frequency);
        lfo.start();

        const breezeGain = audioCtx.createGain();
        breezeGain.gain.value = 0.08;

        whiteNoise.connect(lowpass);
        lowpass.connect(breezeGain);
        breezeGain.connect(modeGain);
        whiteNoise.start();

        // Birds - Procedural synthesis triggered randomly
        function scheduleBirdChirp() {
            if (state.audioEnabled && state.weather === 'clear') {
                triggerProceduralBirdChirp();
            }
            setTimeout(scheduleBirdChirp, 3000 + Math.random() * 5000);
        }

        setTimeout(scheduleBirdChirp, 2000);
    }

    function setupRainSynth() {
        const modeGain = synthNodes.gains.rain;

        // Rain noise - Brown/Pink noise blend through highpass/bandpass filters
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Custom noise generation (simulates rain crackle)
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // First-order lowpass filter for pink/brown noise quality
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];

            // Add tiny random click spikes to simulate heavy raindrops hitting surfaces
            if (Math.random() < 0.0003) {
                output[i] += (Math.random() * 2 - 1) * 0.8;
            }
        }

        const rainNoiseSource = audioCtx.createBufferSource();
        rainNoiseSource.buffer = noiseBuffer;
        rainNoiseSource.loop = true;

        const rainFilter = audioCtx.createBiquadFilter();
        rainFilter.type = 'bandpass';
        rainFilter.frequency.value = 1100;
        rainFilter.Q.value = 0.8;

        const rainVolume = audioCtx.createGain();
        rainVolume.gain.value = 0.22;

        rainNoiseSource.connect(rainFilter);
        rainFilter.connect(rainVolume);
        rainVolume.connect(modeGain);
        rainNoiseSource.start();
    }

    function triggerThunderSynth() {
        if (!state.audioEnabled || state.weather !== 'rain' || !state.audioInitialized) return;

        const modeGain = synthNodes.gains.rain;
        const rumbleLength = 2.5 + Math.random() * 2.5;
        const now = audioCtx.currentTime;

        // Create dynamic thunder sound source (filtered low-frequency noise)
        const bufferSize = audioCtx.sampleRate * rumbleLength;
        const thunderBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = thunderBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Deeper filtering for rumbling thunder
            data[i] = (lastOut + (0.007 * white)) / 1.007;
            lastOut = data[i];
        }

        const thunderSource = audioCtx.createBufferSource();
        thunderSource.buffer = thunderBuffer;

        const thunderFilter = audioCtx.createBiquadFilter();
        thunderFilter.type = 'lowpass';
        thunderFilter.frequency.setValueAtTime(140, now);
        // Slowly decay the cutoff frequency
        thunderFilter.frequency.exponentialRampToValueAtTime(40, now + rumbleLength);

        const thunderGain = audioCtx.createGain();
        // Dramatic initial rise
        thunderGain.gain.setValueAtTime(0.0, now);
        thunderGain.gain.linearRampToValueAtTime(0.38, now + 0.12);

        // Modulate rumble amplitude for shaking crackle effect
        const rumbleSteps = Math.floor(rumbleLength * 12);
        for (let i = 1; i < rumbleSteps; i++) {
            const timeOffset = (i / rumbleSteps) * rumbleLength;
            const rumbleAmp = (1 - (i / rumbleSteps)) * (0.15 + Math.random() * 0.23);
            thunderGain.gain.setValueAtTime(rumbleAmp, now + timeOffset);
        }
        thunderGain.gain.exponentialRampToValueAtTime(0.001, now + rumbleLength);

        thunderSource.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.connect(modeGain);

        thunderSource.start(now);
        thunderSource.stop(now + rumbleLength + 0.1);
    }

    function setupNightSynth() {
        const modeGain = synthNodes.gains.night;

        // Deep nighttime background hum (Sub-oscillator combined with slow filter)
        const humOsc = audioCtx.createOscillator();
        const humOsc2 = audioCtx.createOscillator();
        const humGain = audioCtx.createGain();

        humOsc.type = 'triangle';
        humOsc.frequency.setValueAtTime(65.41, audioCtx.currentTime); // C2 note

        humOsc2.type = 'sine';
        humOsc2.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3 note (harmonic)

        humGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

        const humFilter = audioCtx.createBiquadFilter();
        humFilter.type = 'lowpass';
        humFilter.frequency.value = 180;

        humOsc.connect(humFilter);
        humOsc2.connect(humFilter);
        humFilter.connect(humGain);
        humGain.connect(modeGain);

        humOsc.start();
        humOsc2.start();

        // Crickets - High frequency chirps synthesized with square waves and fast LFO
        function scheduleCricketChirps() {
            if (!state.audioEnabled || state.weather !== 'night') {
                setTimeout(scheduleCricketChirps, 1500 + Math.random() * 2000);
                return;
            }

            const now = audioCtx.currentTime;

            // Build simple cricket synth on the fly
            const carrier = audioCtx.createOscillator();
            carrier.type = 'triangle';
            carrier.frequency.setValueAtTime(3900, now);

            // Ring modulator LFO for the cricket chirp vibration
            const modulator = audioCtx.createOscillator();
            modulator.type = 'square';
            modulator.frequency.value = 28;

            const modGain = audioCtx.createGain();
            modGain.gain.value = 1000;

            const cricketGain = audioCtx.createGain();
            cricketGain.gain.setValueAtTime(0.0, now);

            // Connect nodes
            modulator.connect(modGain);
            modGain.connect(carrier.frequency);
            carrier.connect(cricketGain);
            cricketGain.connect(modeGain);

            const chirpDuration = 0.5 + Math.random() * 0.4;

            // Pattern pulse envelopes
            cricketGain.gain.setValueAtTime(0.0, now);
            const pulses = 4 + Math.floor(Math.random() * 3);
            const pulseWidth = chirpDuration / pulses;

            for (let k = 0; k < pulses; k++) {
                const start = now + k * pulseWidth;
                const peak = start + (pulseWidth * 0.4);
                const stop = start + pulseWidth;
                cricketGain.gain.linearRampToValueAtTime(0.015, peak);
                cricketGain.gain.linearRampToValueAtTime(0.0, stop);
            }

            modulator.start(now);
            carrier.start(now);

            modulator.stop(now + chirpDuration + 0.1);
            carrier.stop(now + chirpDuration + 0.1);

            // Repeat cycle
            setTimeout(scheduleCricketChirps, chirpDuration * 1000 + 1200 + Math.random() * 1500);
        }

        setTimeout(scheduleCricketChirps, 1500);
    }

    function toggleAudio() {
        if (!state.audioInitialized) {
            initAudioEngine();
        }

        // Resume AudioContext if suspended (browser security restriction)
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        state.audioEnabled = !state.audioEnabled;

        if (state.audioEnabled) {
            // Unmute
            audioWidget.classList.add('playing');
            audioStatusText.innerText = "🎵 Atmosphere ON";

            // Crossfade audio channels to match current weather state
            fadeAudioToMode(state.weather, 0.4);
        } else {
            // Mute master output smoothly
            audioWidget.classList.remove('playing');
            audioStatusText.innerText = "🔇 Atmosphere OFF";
            fadeAllAudioOut(0.2);
        }
    }

    function fadeAudioToMode(targetMode, duration) {
        if (!state.audioInitialized || !state.audioEnabled) return;

        const now = audioCtx.currentTime;
        Object.keys(synthNodes.gains).forEach(mode => {
            const gainNode = synthNodes.gains[mode];
            if (gainNode) {
                const targetVal = mode === targetMode ? 0.6 : 0;
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.linearRampToValueAtTime(targetVal, now + duration);
            }
        });
    }

    function fadeAllAudioOut(duration) {
        if (!state.audioInitialized) return;
        const now = audioCtx.currentTime;
        Object.keys(synthNodes.gains).forEach(mode => {
            const gainNode = synthNodes.gains[mode];
            if (gainNode) {
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.linearRampToValueAtTime(0, now + duration);
            }
        });
    }

    // Audio widget event listener
    audioWidget.addEventListener('click', toggleAudio);

    // -------------------------------------------------------------------------
    // 4. Atmosphere Status Engine
    // -------------------------------------------------------------------------
    let statusTimers = [];

    function clearStatusTimers() {
        statusTimers.forEach(t => clearTimeout(t));
        statusTimers = [];
    }

    function showAtmosphereStatus(weather) {
        clearStatusTimers();

        const msg = statusMessages[weather];
        atmosphereStatusEl.setAttribute('data-weather', weather);

        // Step 1: Show "Initializing..."
        atmosphereStatusText.textContent = msg.initializing;
        atmosphereStatusEl.classList.remove('fading');
        atmosphereStatusEl.classList.add('visible');

        // Step 2: After 1.5s, change to "Active"
        statusTimers.push(setTimeout(() => {
            atmosphereStatusText.textContent = msg.active;
        }, 1500));

        // Step 3: After 3.5s total, begin fading
        statusTimers.push(setTimeout(() => {
            atmosphereStatusEl.classList.remove('visible');
            atmosphereStatusEl.classList.add('fading');
        }, 3500));

        // Step 4: After fade completes, show idle text
        statusTimers.push(setTimeout(() => {
            atmosphereStatusEl.classList.remove('fading');
            atmosphereStatusText.textContent = 'Atmosphere Engine';
            // Show it faintly 
            atmosphereStatusEl.style.opacity = '0.4';
        }, 4200));
    }

    // -------------------------------------------------------------------------
    // 5. Dynamic Hero Text Transitions
    // -------------------------------------------------------------------------
    function transitionHeroText(weather) {
        const content = heroContent[weather];

        // Phase 1: Fade out current text
        heroTitle.classList.add('transitioning-out');
        heroSubtitle.classList.add('transitioning-out');

        // Phase 2: Wait, then swap content and fade in
        setTimeout(() => {
            heroTitle.innerHTML = content.title;
            heroTitle.classList.remove('transitioning-out');
            heroTitle.classList.add('transitioning-in');

            // Force reflow to ensure class is applied
            void heroTitle.offsetHeight;

            // Remove the transitioning-in class to trigger the fade in
            requestAnimationFrame(() => {
                heroTitle.classList.remove('transitioning-in');
            });
        }, 400);

        // Subtitle follows with slight delay for stagger
        setTimeout(() => {
            heroSubtitle.innerHTML = content.subtitle;
            heroSubtitle.classList.remove('transitioning-out');
            heroSubtitle.classList.add('transitioning-in');

            void heroSubtitle.offsetHeight;

            requestAnimationFrame(() => {
                heroSubtitle.classList.remove('transitioning-in');
            });
        }, 550);
    }

    // -------------------------------------------------------------------------
    // 6. State Transitions & Background Operations
    // -------------------------------------------------------------------------
    function updateActiveTracker() {
        const activeBtn = buttons[state.weather];
        if (!activeBtn) return;

        // Position frosted pill tracker behind active weather button
        const btnRect = activeBtn.getBoundingClientRect();
        const controllerRect = controller.getBoundingClientRect();

        const offsetLeft = btnRect.left - controllerRect.left;

        activeTracker.style.left = `${offsetLeft}px`;
        activeTracker.style.width = `${btnRect.width}px`;
        activeTracker.style.height = `${btnRect.height}px`;
        activeTracker.style.opacity = '1';
    }

    function changeWeather(targetWeather) {
        if (state.weather === targetWeather || state.transitioning) return;

        state.transitioning = true;
        const prevWeather = state.weather;
        state.weather = targetWeather;

        // If transitioning away from clear, reset birds so they don't reappear sitting
        if (prevWeather === 'clear' && targetWeather !== 'clear') {
            birds.forEach(bird => bird.reset());
        }

        // If transitioning away from rain, clear card water flows
        if (prevWeather === 'rain' && targetWeather !== 'rain') {
            cardFlows.length = 0;
        }

        // === ORCHESTRATED 7-STEP TRANSITION SEQUENCE ===

        // Step 1: Selection capsule moves (0ms)
        controller.setAttribute('data-active-weather', targetWeather);
        Object.keys(buttons).forEach(mode => {
            const btn = buttons[mode];
            if (mode === targetWeather) {
                btn.classList.add('active');
                btn.setAttribute('aria-checked', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            }
        });
        updateActiveTracker();

        // Step 2: Controller glow changes (50ms)
        setTimeout(() => {
            updateControllerGlow(targetWeather);
        }, 50);

        // Step 3: Atmosphere status shows "Initializing..." (100ms)
        setTimeout(() => {
            showAtmosphereStatus(targetWeather);
        }, 100);

        // Step 4: Image begins cinematic crossfade (150ms)
        setTimeout(() => {
            Object.keys(backgrounds).forEach(mode => {
                const layer = backgrounds[mode];
                if (mode === targetWeather) {
                    layer.classList.add('active');
                } else {
                    layer.classList.remove('active');
                }
            });
        }, 150);

        // Step 5: Navbar and Hero tint transitions (200ms)
        setTimeout(() => {
            navbar.setAttribute('data-weather', targetWeather);
            if (heroSection) {
                heroSection.setAttribute('data-weather', targetWeather);
            }
        }, 200);

        // Step 6: Hero text fade out → update → fade in (250ms)
        setTimeout(() => {
            transitionHeroText(targetWeather);
        }, 250);

        // Step 7: Audio ambient crossfade (300ms)
        setTimeout(() => {
            fadeAudioToMode(targetWeather, 1.6);
        }, 300);

        // Step 8: Canvas transition + weather effects (200ms)
        setTimeout(() => {
            triggerCanvasTransition(prevWeather, targetWeather);
        }, 200);

        // Unlock transition after settling
        setTimeout(() => {
            state.transitioning = false;
        }, 1800);
    }

    function updateControllerGlow(mode) {
        if (mode === 'clear') {
            controllerGlow.style.background = 'var(--glow-clear)';
        } else if (mode === 'rain') {
            controllerGlow.style.background = 'var(--glow-rain)';
        } else if (mode === 'night') {
            controllerGlow.style.background = 'var(--glow-night)';
        }
    }

    // -------------------------------------------------------------------------
    // 7. Atmospheric Canvas Engines (Day, Rain, Night)
    // -------------------------------------------------------------------------

    // --- Sky Boundary Check for Stars (Avoids Building and Foliage) ---
    function getSkyHeight(x) {
        const width = state.width;
        const height = state.height;
        
        // Default sky cutoff on the left (under foliage/trees)
        let skyRatio = 0.35;
        
        if (x >= width * 0.28) {
            // Slopes slightly upwards towards the right (building roof starts at 35% height and goes up to 23% height)
            const t = (x - width * 0.28) / (width * 0.57); // 0.85 - 0.28 = 0.57
            if (t <= 1) {
                skyRatio = 0.35 - t * 0.12; 
            } else {
                skyRatio = 0.23; // Stay clear on the far right
            }
        }
        
        return height * skyRatio;
    }

    // --- Stars Class (Night) ---
    class Star {
        constructor() {
            this.reset();
            this.opacity = Math.random(); // Randomize initial phase
        }

        reset() {
            this.x = Math.random() * state.width;
            const maxY = getSkyHeight(this.x);
            this.y = Math.random() * maxY;
            this.size = 0.4 + Math.random() * 1.3;
            this.opacitySpeed = 0.005 + Math.random() * 0.012;
            this.growing = Math.random() > 0.5;
        }

        update() {
            if (this.growing) {
                this.opacity += this.opacitySpeed;
                if (this.opacity >= 1.0) {
                    this.opacity = 1.0;
                    this.growing = false;
                }
            } else {
                this.opacity -= this.opacitySpeed;
                if (this.opacity <= 0.05) {
                    this.opacity = 0.05;
                    this.growing = true;
                }
            }
        }

        draw(ctx) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- Firefly Class (Night) ---
    class Firefly {
        constructor() {
            this.reset(true); // pass true to randomize initial phase
        }

        reset(isInitial = false) {
            // Constrain fireflies horizontally to the left side where the trees are
            this.x = Math.random() * (state.width * 0.28);
            // Constrain vertically around the foliage (from 35% down to 90% of screen height)
            this.y = state.height * 0.35 + Math.random() * (state.height * 0.55);
            
            // 3D Depth coordinate: 0.1 (far, slow, blurry) to 1.0 (near, fast, sharp)
            this.z = 0.1 + Math.random() * 0.9;
            
            // Size scales with depth
            this.baseSize = 0.8 + this.z * 1.8; // size ranges from ~0.98px to 2.6px
            this.size = this.baseSize;
            
            // Base drift speeds scale with depth
            const baseDrift = 0.08 + this.z * 0.15;
            this.speedX = (Math.random() - 0.45) * baseDrift;
            this.speedY = (Math.random() - 0.5) * baseDrift;
            
            // Actual velocity vector (for smooth physics random walk)
            this.vx = this.speedX;
            this.vy = this.speedY;

            // Biological flash states: 'off', 'flash-up', 'flash-down'
            this.flashState = 'off';
            this.alpha = 0;
            
            // Max flash brightness scales with depth
            this.maxAlpha = 0.3 + this.z * 0.6; // deeper is dimmer, closer is brighter
            
            // Flash timings (in frames)
            this.flashUpSpeed = 0.04 + Math.random() * 0.04;   // Fast fade up
            this.flashDownSpeed = 0.008 + Math.random() * 0.012; // Slow fade down
            
            // Dark period timer (how long the firefly stays dark before flashing)
            this.darkDuration = 100 + Math.random() * 250; // frames
            this.darkTimer = isInitial ? Math.random() * this.darkDuration : this.darkDuration;

            // Flash type: 'single' or 'double' (adds variety to the blinking patterns)
            this.flashType = Math.random() > 0.4 ? 'single' : 'double';
            this.doubleFlashStage = 0; // 0 = first flash, 1 = mini dark, 2 = second flash

            // Sine wave floating offsets
            this.angle = Math.random() * Math.PI * 2;
            this.waveSpeed = 0.01 + Math.random() * 0.015;
            this.waveRadius = 0.05 + this.z * 0.12;

            // Reaction to mouse
            this.scared = false;
            this.scaredTimer = 0;
        }

        update() {
            // Apply slight random Brownian acceleration to velocity for organic movement
            this.vx += (Math.random() - 0.5) * 0.015;
            this.vy += (Math.random() - 0.5) * 0.015;
            
            // Speed limits based on depth and scared state
            let maxSpeed = 0.2 + this.z * 0.4;
            if (this.scared) {
                maxSpeed *= 4; // Fly away quickly!
            }
            
            // Damp and limit velocity
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > maxSpeed) {
                this.vx = (this.vx / currentSpeed) * maxSpeed;
                this.vy = (this.vy / currentSpeed) * maxSpeed;
            }
            
            // Sine wave overlay
            this.angle += this.waveSpeed;
            let driftX = this.vx + Math.cos(this.angle) * this.waveRadius;
            let driftY = this.vy + Math.sin(this.angle) * this.waveRadius;

            // --- J-Stroke Upward Swoop ---
            // Real fireflies do an upward swoop when flashing to attract mates.
            if (this.flashState === 'flash-up') {
                driftY -= (0.15 + this.z * 0.2); // upward lift
            } else if (this.flashState === 'flash-down') {
                driftY -= (0.05 + this.z * 0.1); // lingering upward lift
            }

            this.x += driftX;
            this.y += driftY;

            // --- Mouse Interaction ---
            // If mouse is close (desktop only, distance < 110px)
            if (state.mouseX > 0 && state.mouseY > 0) {
                const drawX = this.x + state.parallaxX * this.z * 1.5;
                const drawY = this.y + state.parallaxY * this.z * 1.5;
                const dx = state.mouseX - drawX;
                const dy = state.mouseY - drawY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    if (!this.scared) {
                        this.scared = true;
                        this.scaredTimer = 60; // stay scared for 1 second (60 frames)
                        // Accelerate away from mouse
                        const angleToMouse = Math.atan2(dy, dx);
                        this.vx = -Math.cos(angleToMouse) * 1.8;
                        this.vy = -Math.sin(angleToMouse) * 1.4;
                        // Turn off light immediately in fear!
                        this.flashState = 'off';
                        this.alpha = 0;
                        this.darkTimer = 180; // delay next flash
                    }
                }
            }

            if (this.scared) {
                this.scaredTimer--;
                if (this.scaredTimer <= 0) {
                    this.scared = false;
                }
            }

            // --- Biological Flash State Machine ---
            if (!this.scared) {
                if (this.flashState === 'off') {
                    this.darkTimer--;
                    if (this.darkTimer <= 0) {
                        this.flashState = 'flash-up';
                    }
                } else if (this.flashState === 'flash-up') {
                    this.alpha += this.flashUpSpeed;
                    if (this.alpha >= this.maxAlpha) {
                        this.alpha = this.maxAlpha;
                        this.flashState = 'flash-down';
                    }
                } else if (this.flashState === 'flash-down') {
                    // Exponential-like decay
                    this.alpha -= this.flashDownSpeed;
                    if (this.alpha <= 0.01) {
                        this.alpha = 0;
                        
                        if (this.flashType === 'double' && this.doubleFlashStage === 0) {
                            // First flash is done, brief dark period
                            this.flashState = 'off';
                            this.darkTimer = 15 + Math.random() * 15;
                            this.doubleFlashStage = 1;
                        } else if (this.flashType === 'double' && this.doubleFlashStage === 1) {
                            // Second flash
                            this.flashState = 'flash-up';
                            this.doubleFlashStage = 2;
                        } else {
                            // Reset cycle
                            this.flashState = 'off';
                            this.darkDuration = 120 + Math.random() * 240;
                            this.darkTimer = this.darkDuration;
                            this.doubleFlashStage = 0;
                        }
                    }
                }
            }

            // --- Soft Boundary Handling ---
            const margin = 50;
            const leftLimit = -margin;
            const rightLimit = state.width * 0.32 + margin;
            const topLimit = state.height * 0.30 - margin;
            const bottomLimit = state.height * 0.95 + margin;

            if (this.x < leftLimit || this.x > rightLimit || this.y < topLimit || this.y > bottomLimit) {
                if (this.alpha > 0.05) {
                    this.alpha -= 0.05;
                } else {
                    this.reset(false);
                }
            }
        }

        draw(ctx) {
            if (this.alpha <= 0) return;

            // Apply 3D Parallax offset based on depth (z)
            const drawX = this.x + state.parallaxX * this.z * 1.5;
            const drawY = this.y + state.parallaxY * this.z * 1.5;

            ctx.save();
            
            // Draw soft outer glowing halo (Bokeh effect)
            const outerGlowRadius = this.size * (4.5 + (1 - this.z) * 2);
            ctx.fillStyle = `rgba(180, 245, 110, ${this.alpha * 0.18})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, outerGlowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Draw mid glow layer for extra depth
            const midGlowRadius = this.size * 2.2;
            ctx.fillStyle = `rgba(200, 255, 130, ${this.alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, midGlowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Draw intense warm core (realistic lighting: glowing cores look white/warm yellow)
            ctx.fillStyle = `rgba(255, 255, 230, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    function getRandomCardSpot(rect) {
        // Return spots spread out horizontally along the top edge of the card (-1px offset)
        return {
            x: 25 + Math.random() * (rect.width - 50),
            y: -1.5
        };
    }

    // --- Bird Class (Day) ---
    class Bird {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = -20 - Math.random() * 200;
            this.y = state.height * 0.08 + Math.random() * (state.height * 0.25);
            this.speed = 0.4 + Math.random() * 0.6;
            this.wingPhase = Math.random() * Math.PI * 2;
            this.wingSpeed = 0.06 + Math.random() * 0.04;
            this.size = 3 + Math.random() * 4;
            this.alpha = 0.3 + Math.random() * 0.3;
            this.driftY = (Math.random() - 0.5) * 0.15;

            // State management
            this.state = 'flying'; // 'flying' | 'landing' | 'sitting' | 'takeoff'
            this.sitTime = 0;
            this.maxSitTime = 300 + Math.random() * 900; // Sits for 5 to 20 seconds
            this.cardOffsetX = 0;
            this.cardOffsetY = 0;
            this.targetX = 0;
            this.targetY = 0;
            this.facing = Math.random() > 0.5 ? 1 : -1; // Randomize facing direction
        }

        update() {
            if (this.state === 'flying') {
                this.x += this.speed;
                this.y += this.driftY + Math.sin(this.wingPhase * 0.3) * 0.05;
                this.wingPhase += this.wingSpeed;

                // Decision to land: approach the card from the left
                const rect = navbar ? navbar.getBoundingClientRect() : null;
                if (rect && rect.width > 0 && this.x > rect.left - 180 && this.x < rect.left - 40) {
                    const activeSittingCount = birds.filter(b => b.state === 'sitting' || b.state === 'landing').length;
                    if (activeSittingCount < 6 && Math.random() < 0.01) { // allowed up to 6 sitting birds
                        this.state = 'landing';
                        const spot = getRandomCardSpot(rect);
                        this.cardOffsetX = spot.x;
                        this.cardOffsetY = spot.y;
                        this.targetX = rect.left + this.cardOffsetX;
                        this.targetY = rect.top + this.cardOffsetY;
                    }
                }

                if (this.x > state.width + 50) {
                    this.reset();
                }
            } else if (this.state === 'landing') {
                const rect = navbar ? navbar.getBoundingClientRect() : null;
                if (rect) {
                    this.targetX = rect.left + this.cardOffsetX;
                    this.targetY = rect.top + this.cardOffsetY;
                }
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 3) {
                    this.state = 'sitting';
                    this.sitTime = 0;
                    this.x = this.targetX;
                    this.y = this.targetY;
                    triggerProceduralBirdChirp(0.1 + Math.random() * 0.45);
                } else {
                    this.x += dx * 0.04;
                    this.y += dy * 0.04;
                    this.wingSpeed = 0.08 + Math.min(0.2, 4 / dist);
                    this.wingPhase += this.wingSpeed;
                }
            } else if (this.state === 'sitting') {
                const rect = navbar ? navbar.getBoundingClientRect() : null;
                if (rect) {
                    this.x = rect.left + this.cardOffsetX;
                    this.y = rect.top + this.cardOffsetY;
                } else {
                    this.state = 'flying';
                }

                this.sitTime++;

                if (Math.random() < 0.008) {
                    this.wingPhase += 0.4;
                }

                if (Math.random() < 0.002) {
                    triggerProceduralBirdChirp(Math.random() * 0.6);
                }

                if (this.sitTime >= this.maxSitTime) {
                    this.state = 'takeoff';
                    this.speed = 1.0 + Math.random() * 0.5;
                    this.driftY = -0.8 - Math.random() * 0.5;
                }
            } else if (this.state === 'takeoff') {
                this.x += this.speed;
                this.y += this.driftY;
                this.wingSpeed = 0.12 + Math.random() * 0.08;
                this.wingPhase += this.wingSpeed;

                if (this.y < -50 || this.x > state.width + 50) {
                    this.reset();
                }
            }
        }

        draw(ctx) {
            if (this.state === 'sitting') {
                this.drawSitting(ctx);
                return;
            }

            const wingFlap = Math.sin(this.wingPhase) * this.size * 0.6;

            ctx.save();
            ctx.strokeStyle = `rgba(40, 40, 50, ${this.alpha})`;
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';

            // Left wing
            ctx.beginPath();
            ctx.moveTo(this.x - this.size, this.y - wingFlap);
            ctx.quadraticCurveTo(this.x - this.size * 0.3, this.y - wingFlap * 0.5, this.x, this.y);
            ctx.stroke();

            // Right wing
            ctx.beginPath();
            ctx.moveTo(this.x + this.size, this.y - wingFlap);
            ctx.quadraticCurveTo(this.x + this.size * 0.3, this.y - wingFlap * 0.5, this.x, this.y);
            ctx.stroke();

            ctx.restore();
        }

        drawSitting(ctx) {
            ctx.save();
            
            const opacity = this.alpha + 0.25;
            ctx.strokeStyle = `rgba(40, 40, 50, ${opacity})`;
            ctx.fillStyle = `rgba(40, 40, 50, ${opacity - 0.1})`;
            ctx.lineWidth = 1.0;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Translate to bird center and apply facing flip
            ctx.translate(this.x, this.y);
            ctx.scale(this.facing, 1);

            // Draw a tiny sitting bird relative to (0, 0):
            // 1. Tail (pointing down and left)
            ctx.beginPath();
            ctx.moveTo(-1, -1.5);
            ctx.lineTo(-5, 1);
            ctx.stroke();

            // 2. Body (ellipse)
            ctx.beginPath();
            ctx.ellipse(0, -2.5, 2.5, 1.8, Math.PI / 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 3. Head (circle)
            ctx.beginPath();
            ctx.arc(1.8, -4.5, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 4. Beak (small orange triangle pointing right-up)
            ctx.beginPath();
            ctx.moveTo(3.0, -4.8);
            ctx.lineTo(4.5, -4.2);
            ctx.lineTo(2.8, -3.8);
            ctx.fillStyle = `rgba(220, 140, 40, ${opacity})`;
            ctx.fill();

            // 5. Tiny Legs
            ctx.beginPath();
            ctx.moveTo(-0.5, -1);
            ctx.lineTo(-0.8, 0);
            ctx.moveTo(0.8, -1);
            ctx.lineTo(0.6, 0);
            ctx.strokeStyle = `rgba(40, 40, 50, ${opacity})`;
            ctx.stroke();

            ctx.restore();
        }
    }

    // --- Cloud Class (Day) ---
    class Cloud {
        constructor(startRandom) {
            this.reset(startRandom);
        }

        reset(startRandom = false) {
            this.x = startRandom ? Math.random() * state.width : -300 - Math.random() * 200;
            this.y = state.height * 0.05 + Math.random() * (state.height * 0.2);
            this.width = 120 + Math.random() * 180;
            this.height = 30 + Math.random() * 40;
            this.speed = 0.08 + Math.random() * 0.12;
            this.alpha = 0.04 + Math.random() * 0.06;
        }

        update() {
            this.x += this.speed;
            if (this.x > state.width + 400) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;

            // Draw soft cloud shape with multiple overlapping ellipses
            const cx = this.x;
            const cy = this.y;

            ctx.beginPath();
            ctx.ellipse(cx, cy, this.width * 0.5, this.height * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(cx - this.width * 0.25, cy + this.height * 0.1, this.width * 0.35, this.height * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(cx + this.width * 0.2, cy - this.height * 0.05, this.width * 0.3, this.height * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // --- Rain Particle Class (Rain) ---
    class RainDrop {
        constructor() {
            this.reset();
            this.y = Math.random() * state.height; // Stagger initial starts
        }

        reset() {
            this.x = Math.random() * state.width;
            this.y = -20 - Math.random() * 50;
            this.vy = 12 + Math.random() * 10;      // Dynamic falling speeds
            this.vx = -1.5 - Math.random() * 1.5;   // Angled wind velocity
            this.length = 15 + Math.random() * 20;
            this.thickness = 0.8 + Math.random() * 1.2;
            this.opacity = 0.12 + Math.random() * 0.22;
        }

        update() {
            const prevY = this.y;
            this.y += this.vy;
            this.x += this.vx;

            // Check if card exists and weather is rain
            const rect = navbar ? navbar.getBoundingClientRect() : null;
            if (rect && rect.width > 0 && state.weather === 'rain') {
                if (this.x >= rect.left && this.x <= rect.right) {
                    if (prevY < rect.top && this.y >= rect.top) {
                        // Impact card top edge!
                        splashes.push(new RainSplash(this.x, rect.top));
                        
                        // Spawn card flow (limit density)
                        if (cardFlows.length < 60 && Math.random() < 0.45) {
                            cardFlows.push(new CardWaterFlow(this.x, rect.top));
                        }
                        
                        this.reset();
                        return;
                    }
                }
            }

            if (this.y > state.height) {
                // Trigger splash ring at bottom on impact
                if (Math.random() < 0.18) {
                    splashes.push(new RainSplash(this.x, state.height - 4 - Math.random() * 15));
                }
                this.reset();
            }
            if (this.x < -20) {
                this.x = state.width + 20;
            }
        }

        draw(ctx) {
            ctx.strokeStyle = `rgba(174, 219, 255, ${this.opacity})`;
            ctx.lineWidth = this.thickness;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + (this.vx * 0.8), this.y + this.length);
            ctx.stroke();
        }
    }

    // --- Rain Ground Splashes ---
    class RainSplash {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 1;
            this.maxRadius = 8 + Math.random() * 14;
            this.alpha = 0.45;
            this.growSpeed = 0.6 + Math.random() * 0.8;
            this.decay = 0.015 + Math.random() * 0.02;
        }

        update() {
            this.radius += this.growSpeed;
            this.alpha -= this.decay;
        }

        draw(ctx) {
            ctx.strokeStyle = `rgba(180, 220, 255, ${this.alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            // Draw horizontal ellipses to represent horizontal pavement impact
            ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        isDead() {
            return this.alpha <= 0;
        }
    }

    // --- Card Water Flow runoff down the plaque (Rain) ---
    class CardWaterFlow {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vy = 1 + Math.random() * 1.5;
            this.vx = 0;
            this.r = 1.0 + Math.random() * 1.5;
            this.alpha = 0.4 + Math.random() * 0.4;
            this.isDripping = false;
            this.trail = [];
        }

        update(rect) {
            if (!rect) {
                this.y += this.vy;
                return;
            }

            if (!this.isDripping) {
                // Water flowing down the card
                this.y += this.vy * 0.4; // flow slowly
                this.x += Math.sin(this.y * 0.08 + this.r) * 0.2; // organic flow curves

                // Horizontal constraint: if it runs off left/right edges, drip early
                if (this.x < rect.left || this.x > rect.right) {
                    this.isDripping = true;
                    this.vy = 2; // initial freefall speed
                }

                // Save trail
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > 8) this.trail.shift();

                // Drip off the bottom
                if (this.y >= rect.bottom) {
                    this.y = rect.bottom;
                    this.isDripping = true;
                    this.vy = 0.5; // start drip off bottom edge slowly
                    this.vx = (Math.random() - 0.5) * 0.2; // minor wind drift
                }
            } else {
                // Dripping off the bottom
                this.vy += 0.24; // gravity
                this.y += this.vy;
                this.x += this.vx;

                // Splash at screen bottom
                if (this.y > state.height) {
                    if (Math.random() < 0.15) {
                        splashes.push(new RainSplash(this.x, state.height - 4 - Math.random() * 15));
                    }
                }
            }
        }

        draw(ctx) {
            ctx.save();

            if (!this.isDripping) {
                // Draw soft flow streak
                if (this.trail.length > 1) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(180, 215, 255, ${this.alpha * 0.3})`;
                    ctx.lineWidth = this.r * 1.1;
                    ctx.lineCap = 'round';
                    ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for (let i = 1; i < this.trail.length; i++) {
                        ctx.lineTo(this.trail[i].x, this.trail[i].y);
                    }
                    ctx.stroke();
                }

                // Draw droplet head
                ctx.fillStyle = `rgba(200, 225, 255, ${this.alpha * 0.65})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r * 1.3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Draw falling elongated drop
                ctx.strokeStyle = `rgba(180, 215, 255, ${this.alpha * 0.5})`;
                ctx.lineWidth = this.r * 0.8;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + 4);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // --- Foreground Glass Sliding Droplet Class (Rain) ---
    class GlassDrop {
        constructor(isInitial = false) {
            this.reset(isInitial);
        }

        reset(isInitial = false) {
            this.x = Math.random() * state.width;
            this.y = isInitial ? Math.random() * state.height : -10;
            this.r = 1.0 + Math.random() * 3.0; // Radius size
            this.vy = 0;                        // Velocity
            this.vx = 0;
            this.slideThreshold = 2.5 + Math.random() * 1.5; // Starts sliding when it accumulates mass
            this.trail = [];
            this.maxTrailLength = 15 + Math.floor(Math.random() * 20);
            this.isSliding = Math.random() > 0.82; // Some drops slide immediately

            if (this.isSliding) {
                this.vy = 0.4 + Math.random() * 1.8;
            }
            this.opacity = 0.4 + Math.random() * 0.4;
        }

        update() {
            // Small chance of randomly initiating a downward slide
            if (!this.isSliding && Math.random() < 0.0006) {
                this.isSliding = true;
                this.vy = 0.4 + Math.random() * 1.8;
            }

            // Occasional organic sliding friction adjustments
            if (this.isSliding) {
                this.vy += (Math.random() - 0.48) * 0.15;
                this.vy = Math.max(0.3, Math.min(this.vy, 3.2));

                // Angle slight side-drifts representing wind or gravity vectors
                this.vx += (Math.random() - 0.5) * 0.05;
                this.vx = Math.max(-0.2, Math.min(this.vx, 0.2));

                this.y += this.vy;
                this.x += this.vx;

                // Save coordinate to draw refraction trails
                this.trail.push({ x: this.x, y: this.y, r: this.r });
                if (this.trail.length > this.maxTrailLength) {
                    this.trail.shift();
                }

                // If droplet gets too small from trails, reset it
                this.r -= 0.003;
                if (this.r < 0.6) {
                    this.reset();
                }
            }

            // Boundary resets
            if (this.y > state.height + 10) {
                this.reset();
            }
        }

        draw(ctx) {
            // Draw Droplet Trail First (Soft Refractive Path)
            if (this.trail.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.18})`;
                ctx.lineWidth = this.r * 0.7;
                ctx.lineCap = 'round';
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let i = 1; i < this.trail.length; i++) {
                    ctx.lineTo(this.trail[i].x, this.trail[i].y);
                }
                ctx.stroke();
            }

            // Draw Head Droplet (Realistic Glass Refractive Sphere)
            ctx.save();

            // Faint Drop Shadow on screen
            ctx.shadowBlur = 3;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1.5;

            // Translucent water boundary
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.25})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();

            // Clear drop shadow for internal highlights
            ctx.shadowColor = 'transparent';

            // High specular sun highlight (top-left white dot)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(this.x - (this.r * 0.35), this.y - (this.r * 0.35), this.r * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Dark crescent refraction edge (bottom-right shadow)
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 0.9, 0.25 * Math.PI, 0.75 * Math.PI);
            ctx.stroke();

            ctx.restore();
        }
    }

    // Particle Pools
    const stars = [];
    const fireflies = [];
    const birds = [];
    const clouds = [];
    const rainDrops = [];
    let splashes = [];
    const glassDrops = [];
    const cardFlows = [];

    // Particle Limits (Dynamic based on screen width)
    function getParticleLimits() {
        const isMobile = window.innerWidth <= 768;
        return {
            stars: isMobile ? 30 : 75,
            fireflies: isMobile ? 5 : 15,
            birds: isMobile ? 6 : 12, // Increased from 3 : 5 to 6 : 12
            clouds: isMobile ? 2 : 4,
            rain: isMobile ? 100 : 320,
            glass: isMobile ? 30 : 90
        };
    }

    function initAtmosphericParticles() {
        stars.length = 0;
        fireflies.length = 0;
        birds.length = 0;
        clouds.length = 0;
        rainDrops.length = 0;
        splashes = [];
        cardFlows.length = 0;

        const limits = getParticleLimits();

        for (let i = 0; i < limits.stars; i++) stars.push(new Star());
        for (let i = 0; i < limits.fireflies; i++) fireflies.push(new Firefly());
        for (let i = 0; i < limits.birds; i++) birds.push(new Bird());
        for (let i = 0; i < limits.clouds; i++) clouds.push(new Cloud(true));
        for (let i = 0; i < limits.rain; i++) rainDrops.push(new RainDrop());
    }

    function initGlassDrops() {
        glassDrops.length = 0;
        const limits = getParticleLimits();
        for (let i = 0; i < limits.glass; i++) {
            glassDrops.push(new GlassDrop(true));
        }
    }

    // -------------------------------------------------------------------------
    // 8. Unified Dynamic Animation Loop
    // -------------------------------------------------------------------------
    let currentAtmosphericCanvasAlpha = 0;
    let currentGlassDropsCanvasAlpha = 0;

    // Trigger canvas fades based on weather
    function triggerCanvasTransition(from, to) {
        if (to === 'clear') {
            canvases.atmospheric.classList.add('active');  // Show for birds/clouds
            canvases.glassDrops.classList.remove('active');
        } else if (to === 'rain') {
            canvases.atmospheric.classList.add('active');
            canvases.glassDrops.classList.add('active');
        } else if (to === 'night') {
            canvases.atmospheric.classList.add('active');
            canvases.glassDrops.classList.remove('active');
        }
    }

    // Lightning Flash Scheduler (Rain Mode only)
    let lightningTimer = null;
    function scheduleLightning() {
        if (lightningTimer) clearTimeout(lightningTimer);

        if (state.weather !== 'rain') return;

        // Lightning occurs randomly between 5s and 14s
        const nextFlash = 5000 + Math.random() * 9000;
        lightningTimer = setTimeout(() => {
            triggerLightningFlash();
            scheduleLightning();
        }, nextFlash);
    }

    function triggerLightningFlash() {
        if (state.weather !== 'rain') return;

        const timeline = [
            { opacity: 0.85, time: 0 },
            { opacity: 0.2, time: 60 },
            { opacity: 0.95, time: 100 },
            { opacity: 0.0, time: 450 }
        ];

        // Animate overlay elements
        timeline.forEach(step => {
            setTimeout(() => {
                lightningOverlay.style.opacity = step.opacity;

                // Apply temporary background screen exposure curves
                if (step.opacity > 0) {
                    const currentBg = backgrounds.rain;
                    currentBg.style.filter = `brightness(${1.3 + step.opacity * 0.5}) contrast(1.1) saturate(0.85) hue-rotate(10deg)`;
                } else {
                    backgrounds.rain.style.filter = '';
                }
            }, step.time);
        });

        // Trigger dynamic synthesized thunder soundscape rumble
        setTimeout(() => {
            triggerThunderSynth();
        }, 150 + Math.random() * 200); // Speed of sound delay simulation
    }

    // Watch weather changes to kickstart timers
    function handleLightningScheduler(mode) {
        if (mode === 'rain') {
            scheduleLightning();
        } else {
            if (lightningTimer) {
                clearTimeout(lightningTimer);
                lightningTimer = null;
            }
            lightningOverlay.style.opacity = 0;
            backgrounds.rain.style.filter = '';
        }
    }

    // Global Anim Loop (60fps target)
    function animate() {
        // --- Smooth parallax interpolation ---
        state.parallaxX += (state.targetParallaxX - state.parallaxX) * 0.06;
        state.parallaxY += (state.targetParallaxY - state.parallaxY) * 0.06;

        if (heroSection) {
            heroSection.style.setProperty('--parallax-x', state.parallaxX.toFixed(2));
            heroSection.style.setProperty('--parallax-y', state.parallaxY.toFixed(2));
        }

        // --- 1. Draw Atmospheric Background Overlay Canvas (Stars, Rain, Fireflies, Birds, Clouds) ---
        const atmCtx = ctxs.atmospheric;
        atmCtx.clearRect(0, 0, state.width, state.height);

        if (state.weather === 'clear') {
            // Draw Birds
            birds.forEach(bird => {
                bird.update();
                bird.draw(atmCtx);
            });

            // Draw Clouds
            clouds.forEach(cloud => {
                cloud.update();
                cloud.draw(atmCtx);
            });
        }
        else if (state.weather === 'night') {
            // Draw Twinkling Stars
            stars.forEach(star => {
                star.update();
                star.draw(atmCtx);
            });

            // Draw Fireflies
            fireflies.forEach(firefly => {
                firefly.update();
                firefly.draw(atmCtx);
            });
        }
        else if (state.weather === 'rain') {
            // Get bounding rect of navbar/card once per frame
            const rect = navbar ? navbar.getBoundingClientRect() : null;

            // Draw Falling Rain drops
            rainDrops.forEach(drop => {
                drop.update();
                drop.draw(atmCtx);
            });

            // Update and draw Card Water Flows
            for (let i = cardFlows.length - 1; i >= 0; i--) {
                const flow = cardFlows[i];
                flow.update(rect);
                flow.draw(atmCtx);
                if (flow.y > state.height + 20) {
                    cardFlows.splice(i, 1);
                }
            }

            // Draw Ground Splashes
            for (let i = splashes.length - 1; i >= 0; i--) {
                const splash = splashes[i];
                splash.update();
                splash.draw(atmCtx);
                if (splash.isDead()) {
                    splashes.splice(i, 1);
                }
            }
        }

        // --- 2. Draw Foreground Glass Droplets (Rain only) ---
        const glassCtx = ctxs.glassDrops;
        glassCtx.clearRect(0, 0, state.width, state.height);

        if (state.weather === 'rain') {
            glassDrops.forEach(drop => {
                drop.update();
                // Check if drops are close enough to merge
                checkDropletMerges(drop);
                drop.draw(glassCtx);
            });
        }

        requestAnimationFrame(animate);
    }

    function checkDropletMerges(currentDrop) {
        if (!currentDrop.isSliding) return;

        for (let i = 0; i < glassDrops.length; i++) {
            const other = glassDrops[i];
            if (other === currentDrop) continue;

            // Calculate distance between two drops
            const dx = other.x - currentDrop.x;
            const dy = other.y - currentDrop.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mergeLimit = currentDrop.r + other.r + 1.2;

            if (dist < mergeLimit) {
                // Merge elements
                if (currentDrop.r >= other.r) {
                    currentDrop.r = Math.min(5.5, currentDrop.r + (other.r * 0.35));
                    // Increase speed slightly due to increased weight
                    currentDrop.vy = Math.min(3.2, currentDrop.vy + 0.35);
                    other.reset();
                } else {
                    other.r = Math.min(5.5, other.r + (currentDrop.r * 0.35));
                    other.isSliding = true;
                    other.vy = Math.min(3.2, other.vy + 0.35);
                    currentDrop.reset();
                }
                break;
            }
        }
    }

    // -------------------------------------------------------------------------
    // 9. Micro-Interactions & Premium UI Effects
    // -------------------------------------------------------------------------

    // --- Click Ripple Effect ---
    function triggerClickRipple(e, btn) {
        const rippleContainer = btn.querySelector('.ripple-container');
        if (!rippleContainer) return;

        const rect = btn.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-span';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        rippleContainer.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 750);
    }

    // --- Specular Reflection Highlight (Mouse tracking) ---
    function trackSpecularReflections() {
        const trackedButtons = document.querySelectorAll('.weather-btn, .btn');

        trackedButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Store mouse positions as CSS variables locally on the button
                btn.style.setProperty('--mx', `${x}px`);
                btn.style.setProperty('--my', `${y}px`);
            });
        });
    }

    // --- Controller Cursor Tilt ---
    function initControllerTilt() {
        if (window.innerWidth <= 768) return;

        const container = controllerTiltWrapper;
        if (!container) return;

        document.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Only tilt when mouse is within 300px of controller
            if (dist < 300) {
                const maxTilt = 3;
                const factor = 1 - (dist / 300);
                const tiltY = (dx / 300) * maxTilt * factor;
                const tiltX = -(dy / 300) * maxTilt * factor;

                controller.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
                controller.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
            } else {
                controller.style.setProperty('--tilt-x', '0deg');
                controller.style.setProperty('--tilt-y', '0deg');
            }
        });

        // Reset tilt when cursor leaves the page
        document.addEventListener('mouseleave', () => {
            controller.style.setProperty('--tilt-x', '0deg');
            controller.style.setProperty('--tilt-y', '0deg');
        });
    }

    // --- Parallax Mouse Tracking ---
    function initParallax() {
        if (window.innerWidth <= 768) return;

        document.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
            // Map mouse position to a range of -15 to 15
            const cx = state.width / 2;
            const cy = state.height / 2;
            state.targetParallaxX = ((e.clientX - cx) / cx) * 15;
            state.targetParallaxY = ((e.clientY - cy) / cy) * 15;

            // Spotlight shine variables for the hero title
            if (heroTitle) {
                const rect = heroTitle.getBoundingClientRect();
                const tx = e.clientX - rect.left;
                const ty = e.clientY - rect.top;
                heroTitle.style.setProperty('--text-mx', `${tx}px`);
                heroTitle.style.setProperty('--text-my', `${ty}px`);
            }
        });

        // Reset parallax when cursor leaves the page
        document.addEventListener('mouseleave', () => {
            state.mouseX = -1;
            state.mouseY = -1;
            state.targetParallaxX = 0;
            state.targetParallaxY = 0;
            if (heroTitle) {
                heroTitle.style.setProperty('--text-mx', '-9999px');
                heroTitle.style.setProperty('--text-my', '-9999px');
            }
        });
    }

    // --- Cursor Magnetism effect ---
    let magneticTargets = [];

    function initCursorMagnetism() {
        magneticTargets = Array.from(document.querySelectorAll('.magnet-target'));

        window.addEventListener('mousemove', (e) => {
            // Apply cursor magnetism pull if desktop size (width > 768px)
            if (window.innerWidth <= 768) {
                // Clear offset transforms on mobile sizes
                magneticTargets.forEach(target => {
                    target.style.transform = '';
                    target.magneticX = 0;
                    target.magneticY = 0;
                });
                return;
            }

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            magneticTargets.forEach(target => {
                // Use parent layout boundary to obtain original untransformed center coords (prevents layout-lag drifts)
                const parent = target.offsetParent || document.body;
                const parentRect = parent.getBoundingClientRect();

                const targetCenterX = parentRect.left + target.offsetLeft + target.offsetWidth / 2;
                const targetCenterY = parentRect.top + target.offsetTop + target.offsetHeight / 2;

                const dx = mouseX - targetCenterX;
                const dy = mouseY - targetCenterY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Threshold radius (pull distance)
                const magnetRadius = target.classList.contains('weather-btn') ? 75 : 95;

                if (dist < magnetRadius) {
                    // Pull strength (closer cursor = stronger pull)
                    const strength = target.classList.contains('weather-btn') ? 0.32 : 0.22;
                    const pullX = dx * strength;
                    const pullY = dy * strength;

                    target.magneticX = pullX;
                    target.magneticY = pullY;

                    // Slightly lift active elements
                    const extraScale = target.classList.contains('active') ? 'scale(1.02)' : 'scale(1.01)';
                    target.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) ${extraScale}`;
                    target.style.transition = 'transform 0.08s cubic-bezier(0.25, 0.8, 0.25, 1)';
                } else {
                    // Reset back to original CSS-defined position
                    target.magneticX = 0;
                    target.magneticY = 0;
                    target.style.transform = '';
                    target.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
                }
            });
        });

        // Reset ALL magnetic targets when cursor leaves the viewport
        document.addEventListener('mouseleave', () => {
            magneticTargets.forEach(target => {
                target.magneticX = 0;
                target.magneticY = 0;
                target.style.transform = '';
                target.style.transition = 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });
    }

    // -------------------------------------------------------------------------
    // 10. Event Listeners & Initialize
    // -------------------------------------------------------------------------
    function initEvents() {
        // Weather selection click events
        Object.keys(buttons).forEach(mode => {
            const btn = buttons[mode];
            btn.addEventListener('click', (e) => {
                triggerClickRipple(e, btn);
                changeWeather(mode);
                handleLightningScheduler(mode);
            });
        });

        // Window Resizing & Orientation
        window.addEventListener('resize', resizeCanvases);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvases, 250);
        });

        // Initialize design components
        trackSpecularReflections();
        initCursorMagnetism();
        initControllerTilt();
        initParallax();

        // Startle sitting birds when hovering over the card
        if (navbar) {
            navbar.addEventListener('mouseenter', () => {
                let startledCount = 0;
                birds.forEach(bird => {
                    if (bird.state === 'sitting' || bird.state === 'landing') {
                        bird.state = 'takeoff';
                        bird.speed = 1.6 + Math.random() * 0.8;
                        bird.driftY = -1.2 - Math.random() * 0.8;
                        bird.wingSpeed = 0.16 + Math.random() * 0.08;
                        startledCount++;
                    }
                });
                if (startledCount > 0) {
                    // Trigger startling warning bird chirp
                    triggerProceduralBirdChirp(0.85);
                }
            });
        }

    }

    // Master execution block
    function initialize() {
        // Resizing
        resizeCanvases();

        // Initial button positioning state setup
        updateActiveTracker();
        updateControllerGlow(state.weather);
        controller.setAttribute('data-active-weather', state.weather);
        navbar.setAttribute('data-weather', state.weather);
        if (heroSection) {
            heroSection.setAttribute('data-weather', state.weather);
        }

        // Show the atmospheric canvas for clear mode (birds + clouds)
        canvases.atmospheric.classList.add('active');

        // Core Listeners
        initEvents();
        initSpacesGallery();

        // Show initial atmosphere status briefly
        setTimeout(() => {
            atmosphereStatusEl.style.opacity = '0.4';
            atmosphereStatusText.textContent = 'Atmosphere Engine';
        }, 200);

        // Start requestAnimationFrame core loops
        animate();
    }

    // =========================================================================
    // SECTION 2: SIGNATURE SPACES ACCORDION GALLERY & SIDE-SCROLL ENGINE
    // =========================================================================
    function initSpacesGallery() {
        const gallerySection = document.getElementById('auralis-spaces');
        const galleryContainer = document.getElementById('spaces-gallery-container');
        const track = document.getElementById('accordion-track');
        const cards = Array.from(document.querySelectorAll('.accordion-card'));
        const dots = Array.from(document.querySelectorAll('.pagination-dot'));
        const prevBtn = document.getElementById('gallery-prev-btn');
        const nextBtn = document.getElementById('gallery-next-btn');
        const mobilePrevBtn = document.getElementById('mobile-prev-btn');
        const mobileNextBtn = document.getElementById('mobile-next-btn');
        const mobileCounterIndex = document.getElementById('mobile-counter-index');
        const mobileCounterName = document.getElementById('mobile-counter-name');
        const ambientGlow = document.getElementById('spaces-ambient-glow');
        const exploreHeroBtn = document.getElementById('hero-explore-btn');
        const scrollIndicator = document.querySelector('.scroll-indicator');

        if (!galleryContainer || !cards.length) return;

        let activeIndex = 2; // Default active card: index 2 (Imperial Open-Air Lawn)

        const spaceThemes = [
            { name: 'ballroom', title: 'The Grand Royal Ballroom',   glow: 'rgba(223, 166, 74, 0.20)', freq: 330 },
            { name: 'crystal',  title: 'Crystal Banquet Hall',       glow: 'rgba(167, 139, 250, 0.22)', freq: 440 },
            { name: 'lawn',     title: 'Imperial Open-Air Lawn',     glow: 'rgba(52, 211, 153, 0.20)', freq: 392 },
            { name: 'gala',     title: 'Starlight Gala Amphitheater', glow: 'rgba(56, 189, 248, 0.20)', freq: 523.25 },
            { name: 'facade',   title: 'The Grand Portico & Foyer',  glow: 'rgba(245, 158, 11, 0.20)', freq: 587.33 }
        ];

        // Synthesize subtle luxury audio glass chime
        function playGalleryChime(index) {
            try {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtxClass) return;
                const ctx = (typeof audioCtx !== 'undefined' && audioCtx) ? audioCtx : new AudioCtxClass();
                if (ctx.state === 'suspended') {
                    ctx.resume().catch(() => {});
                }
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                const freq = spaceThemes[index]?.freq || 440;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.26);
            } catch (e) {
                // Gracefully handled if browser policy restricts audio before user gesture
            }
        }

        // Mobile centered track positioning (pure translate3d, mathematically derived)
        function updateMobileTrackPosition() {
            if (window.innerWidth <= 768) {
                const containerWidth = galleryContainer.clientWidth || window.innerWidth;
                const activeCard = cards[activeIndex];
                const inactiveFallback = window.innerWidth <= 380 ? 38 : 46;
                const activeFallback = window.innerWidth <= 380 
                    ? Math.min(275, containerWidth - 90) 
                    : Math.min(310, containerWidth - 116);

                const gap = 10;
                let centerOffset = 0;

                for (let i = 0; i < activeIndex; i++) {
                    const cardW = (cards[i] && cards[i].offsetWidth > 0) ? cards[i].offsetWidth : inactiveFallback;
                    centerOffset += cardW + gap;
                }

                const currentActiveW = (activeCard && activeCard.offsetWidth > 0) ? activeCard.offsetWidth : activeFallback;
                centerOffset += (currentActiveW / 2);

                const targetX = (containerWidth / 2) - centerOffset;
                track.style.transform = `translate3d(${targetX.toFixed(1)}px, 0, 0)`;
            } else {
                track.style.transform = '';
            }
        }

        function setActiveSpace(newIndex, playSound = true) {
            if (newIndex < 0 || newIndex >= cards.length) return;
            if (newIndex === activeIndex) {
                updateMobileTrackPosition();
                return;
            }

            activeIndex = newIndex;

            // Update cards
            cards.forEach((card, idx) => {
                const isActive = (idx === activeIndex);
                card.classList.toggle('active', isActive);
                card.setAttribute('aria-selected', isActive ? 'true' : 'false');
                card.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            // Smoothly center the active card on mobile (zero window scrolling!)
            updateMobileTrackPosition();

            // Update dots
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeIndex);
            });

            // Update mobile space counter
            if (mobileCounterIndex) {
                mobileCounterIndex.textContent = `0${activeIndex + 1}`;
            }
            if (mobileCounterName) {
                mobileCounterName.textContent = spaceThemes[activeIndex]?.title || '';
            }

            // Update ambient glow
            if (ambientGlow) {
                const theme = spaceThemes[activeIndex];
                ambientGlow.style.setProperty('--space-glow-color', theme.glow);
            }

            if (playSound) {
                playGalleryChime(activeIndex);
            }
        }

        // Click card to activate
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                setActiveSpace(index);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveSpace(index);
                }
            });
        });

        // Click pagination dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                setActiveSpace(index);
            });
        });

        // Navigation arrow buttons (Desktop)
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = activeIndex > 0 ? activeIndex - 1 : cards.length - 1;
                setActiveSpace(target);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = activeIndex < cards.length - 1 ? activeIndex + 1 : 0;
                setActiveSpace(target);
            });
        }

        // Navigation arrow buttons (Mobile)
        if (mobilePrevBtn) {
            mobilePrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = activeIndex > 0 ? activeIndex - 1 : cards.length - 1;
                setActiveSpace(target);
            });
        }

        if (mobileNextBtn) {
            mobileNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = activeIndex < cards.length - 1 ? activeIndex + 1 : 0;
                setActiveSpace(target);
            });
        }

        // =====================================================================
        // SIDE-SCROLL & WHEEL GESTURE ENGINE
        // =====================================================================
        let wheelCooldown = false;
        let wheelAccumulator = 0;

        galleryContainer.addEventListener('wheel', (e) => {
            const absX = Math.abs(e.deltaX);

            // Handle horizontal side-scroll (trackpad or horizontal wheel)
            if (absX > 15) {
                e.preventDefault();
                if (wheelCooldown) return;

                if (e.deltaX > 15) {
                    if (activeIndex < cards.length - 1) {
                        setActiveSpace(activeIndex + 1);
                        triggerCooldown(380);
                    }
                } else if (e.deltaX < -15) {
                    if (activeIndex > 0) {
                        setActiveSpace(activeIndex - 1);
                        triggerCooldown(380);
                    }
                }
                return;
            }

            // Handle vertical mouse wheel when hovered directly over the card track
            const isOverTrack = e.target.closest('#accordion-track');
            if (isOverTrack) {
                if (e.deltaY > 25 && activeIndex < cards.length - 1) {
                    e.preventDefault();
                    wheelAccumulator += e.deltaY;
                    if (!wheelCooldown && wheelAccumulator > 30) {
                        setActiveSpace(activeIndex + 1);
                        wheelAccumulator = 0;
                        triggerCooldown(380);
                    }
                } else if (e.deltaY < -25 && activeIndex > 0) {
                    e.preventDefault();
                    wheelAccumulator += e.deltaY;
                    if (!wheelCooldown && wheelAccumulator < -30) {
                        setActiveSpace(activeIndex - 1);
                        wheelAccumulator = 0;
                        triggerCooldown(380);
                    }
                } else {
                    wheelAccumulator = 0;
                }
            }
        }, { passive: false });

        function triggerCooldown(ms = 350) {
            wheelCooldown = true;
            setTimeout(() => {
                wheelCooldown = false;
            }, ms);
        }

        // =====================================================================
        // TOUCH GESTURE ENGINE (Mobile Swipe)
        // =====================================================================
        let touchStartX = 0;
        let touchStartY = 0;
        let touchDiffX = 0;
        let isTouching = false;
        let isHorizontalSwipe = false;

        galleryContainer.addEventListener('touchstart', (e) => {
            if (e.target.closest('.mobile-nav-btn') || e.target.closest('.gallery-nav-btn') || e.target.closest('.pagination-dot')) return;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchDiffX = 0;
            isTouching = true;
            isHorizontalSwipe = false;
        }, { passive: true });

        galleryContainer.addEventListener('touchmove', (e) => {
            if (!isTouching) return;
            const touch = e.touches[0];
            touchDiffX = touch.clientX - touchStartX;
            const diffY = touch.clientY - touchStartY;

            if (!isHorizontalSwipe && Math.abs(touchDiffX) > 8) {
                if (Math.abs(touchDiffX) > Math.abs(diffY)) {
                    isHorizontalSwipe = true;
                }
            }
        }, { passive: true });

        function handleTouchEnd() {
            if (!isTouching) return;
            isTouching = false;

            if (isHorizontalSwipe) {
                if (touchDiffX < -35) {
                    // Swiped Left -> Next Card
                    if (activeIndex < cards.length - 1) {
                        setActiveSpace(activeIndex + 1);
                    } else {
                        setActiveSpace(0);
                    }
                } else if (touchDiffX > 35) {
                    // Swiped Right -> Prev Card
                    if (activeIndex > 0) {
                        setActiveSpace(activeIndex - 1);
                    } else {
                        setActiveSpace(cards.length - 1);
                    }
                } else {
                    updateMobileTrackPosition();
                }
            }
            isHorizontalSwipe = false;
        }

        galleryContainer.addEventListener('touchend', handleTouchEnd);
        galleryContainer.addEventListener('touchcancel', handleTouchEnd);

        // =====================================================================
        // DESKTOP MOUSE POINTER DRAG
        // =====================================================================
        let isPointerDown = false;
        let mouseStartX = 0;
        let mouseCurrentX = 0;

        track.addEventListener('mousedown', (e) => {
            if (e.target.closest('.gallery-nav-btn') || e.target.closest('.mobile-nav-btn')) return;
            if (window.innerWidth <= 768) return; // handled by touch
            isPointerDown = true;
            mouseStartX = e.clientX;
            mouseCurrentX = e.clientX;
            track.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isPointerDown) return;
            mouseCurrentX = e.clientX;
        });

        window.addEventListener('mouseup', () => {
            if (!isPointerDown) return;
            isPointerDown = false;
            track.style.cursor = '';
            const diff = mouseCurrentX - mouseStartX;
            if (diff < -45) {
                if (activeIndex < cards.length - 1) setActiveSpace(activeIndex + 1);
                else setActiveSpace(0);
            } else if (diff > 45) {
                if (activeIndex > 0) setActiveSpace(activeIndex - 1);
                else setActiveSpace(cards.length - 1);
            }
        });

        // Re-verify alignment when card layout animation completes
        track.addEventListener('transitionend', (e) => {
            if (window.innerWidth <= 768 && e.target && e.target.classList && e.target.classList.contains('accordion-card')) {
                updateMobileTrackPosition();
            }
        });

        // Keep track positioned on window resize and orientation change
        let galleryResizeTimer = null;
        const handleResize = () => {
            clearTimeout(galleryResizeTimer);
            galleryResizeTimer = setTimeout(updateMobileTrackPosition, 50);
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => setTimeout(updateMobileTrackPosition, 180));

        // Initial setup for mobile track position across key lifecycles
        updateMobileTrackPosition();
        setTimeout(updateMobileTrackPosition, 60);
        setTimeout(updateMobileTrackPosition, 300);
        setTimeout(updateMobileTrackPosition, 1000);

        // Recalculate as soon as the loader exit event fires
        document.addEventListener('gce:loaderDone', () => {
            setTimeout(updateMobileTrackPosition, 50);
            setTimeout(updateMobileTrackPosition, 350);
        });

        window.addEventListener('load', () => {
            setTimeout(updateMobileTrackPosition, 100);
        });

        // When Section 2 scrolls into view, re-check mobile alignment
        if ('IntersectionObserver' in window && gallerySection) {
            const spacesObserver = new IntersectionObserver((entries) => {
                if (entries[0] && entries[0].isIntersecting) {
                    updateMobileTrackPosition();
                }
            }, { threshold: 0.1 });
            spacesObserver.observe(gallerySection);
        }

        // Prevent accidental horizontal drift on mobile devices
        window.addEventListener('scroll', () => {
            if (window.scrollX !== 0) {
                window.scrollTo(0, window.scrollY);
            }
        }, { passive: true });

        // Keyboard navigation (Left / Right arrow keys when gallery is in view)
        window.addEventListener('keydown', (e) => {
            if (!gallerySection) return;
            const rect = gallerySection.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
            if (!isInView) return;

            if (e.key === 'ArrowRight') {
                if (activeIndex < cards.length - 1) {
                    setActiveSpace(activeIndex + 1);
                }
            } else if (e.key === 'ArrowLeft') {
                if (activeIndex > 0) {
                    setActiveSpace(activeIndex - 1);
                }
            }
        });

        // Smooth scroll to gallery from Hero CTA and Scroll Mouse Indicator
        if (exploreHeroBtn) {
            exploreHeroBtn.addEventListener('click', () => {
                gallerySection.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                gallerySection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // -------------------------------------------------------------------------
    // AUTO-START AUDIO — Cinematic Welcome Experience

    // Fires when the cinematic loader exits (counts as user gesture context).
    // Plays a beautiful welcome chord then fades in the ambient atmosphere.
    // -------------------------------------------------------------------------
    function playCinematicWelcomeChord() {
        // Initialize audio engine on first call
        if (!state.audioInitialized) {
            initAudioEngine();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // --- Cinematic Orchestral Welcome Chord ---
        // A warm, rich ascending arpeggio (A major chord with shimmer)
        const notes = [
            { freq: 220.0,  start: 0.0,  dur: 3.5, gain: 0.06 },  // A3 — root deep bass
            { freq: 277.18, start: 0.12, dur: 3.2, gain: 0.05 },  // C#4
            { freq: 329.63, start: 0.24, dur: 3.0, gain: 0.05 },  // E4
            { freq: 440.0,  start: 0.38, dur: 2.8, gain: 0.04 },  // A4 — octave rise
            { freq: 554.37, start: 0.52, dur: 2.6, gain: 0.035 }, // C#5 shimmer
            { freq: 659.25, start: 0.66, dur: 2.2, gain: 0.03 },  // E5 sparkle
            { freq: 880.0,  start: 0.82, dur: 1.8, gain: 0.02 },  // A5 — golden high note
        ];

        // Reverb-style convolver: simple delay feedback tail
        const reverbDelay = audioCtx.createDelay(0.6);
        reverbDelay.delayTime.value = 0.28;
        const reverbFeedback = audioCtx.createGain();
        reverbFeedback.gain.value = 0.22;
        const reverbDry = audioCtx.createGain();
        reverbDry.gain.value = 0.75;
        reverbDelay.connect(reverbFeedback);
        reverbFeedback.connect(reverbDelay);
        reverbDelay.connect(audioCtx.destination);
        reverbDry.connect(audioCtx.destination);

        notes.forEach(({ freq, start, dur, gain: gainVal }) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            const harmOsc = audioCtx.createOscillator(); // subtle harmonic shimmer
            const harmGain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + start);

            harmOsc.type = 'sine';
            harmOsc.frequency.setValueAtTime(freq * 2.001, now + start); // slight detune octave
            harmGain.gain.setValueAtTime(gainVal * 0.25, now + start);
            harmGain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

            gainNode.gain.setValueAtTime(0.0001, now + start);
            gainNode.gain.linearRampToValueAtTime(gainVal, now + start + 0.15);  // attack
            gainNode.gain.setValueAtTime(gainVal, now + start + dur * 0.5);      // sustain
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur); // release

            osc.connect(gainNode);
            harmOsc.connect(harmGain);
            gainNode.connect(reverbDry);
            gainNode.connect(reverbDelay);
            harmGain.connect(reverbDry);

            osc.start(now + start);
            osc.stop(now + start + dur + 0.1);
            harmOsc.start(now + start);
            harmOsc.stop(now + start + dur + 0.1);
        });

        // --- After chord settles (~1.8s), fade in ambient atmosphere ---
        setTimeout(() => {
            state.audioEnabled = true;
            audioWidget.classList.add('playing');
            audioStatusText.innerText = '🎵 Atmosphere ON';
            fadeAudioToMode(state.weather, 1.8); // soft 1.8s fade-in
        }, 1800);
    }

    // Listen for loader exit event → play welcome + auto-start ambient
    document.addEventListener('gce:loaderDone', () => {
        // Small delay so loader exit animation begins first
        setTimeout(playCinematicWelcomeChord, 300);
    }, { once: true });

    // Fallback: if loader was skipped (return visit), auto-start on first interaction
    let autoStartFallbackDone = false;
    function autoStartFallback() {
        if (autoStartFallbackDone || state.audioEnabled) return;
        autoStartFallbackDone = true;
        document.removeEventListener('click', autoStartFallback);
        document.removeEventListener('touchstart', autoStartFallback);
        // Small delay — feels intentional, not abrupt
        setTimeout(playCinematicWelcomeChord, 200);
    }

    // Only register fallback if the loader is NOT showing (i.e. return visit)
    if (sessionStorage.getItem('gce_loader_seen')) {
        document.addEventListener('click', autoStartFallback, { once: true });
        document.addEventListener('touchstart', autoStartFallback, { once: true });
    }

    // Execute setup!
    initialize();
});
