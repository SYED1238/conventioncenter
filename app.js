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
            clear: "Assets/images/campus-day.webp.jpeg",
            rain:  "Assets/images/campus-rain.webp.jpeg",
            night: "Assets/images/campus-night.webp.jpeg"
        },
        mobile: {
            clear: "Assets/images/mobile/campus-day-mobile.webp.jpeg",
            rain:  "Assets/images/mobile/campus-rain-mobile.webp.jpeg",
            night: "Assets/images/mobile/campus-night-mobile.webp.jpeg"
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
            title: 'Engineering the Future. <br><span class="text-gradient">Rooted in Excellence.</span>',
            subtitle: 'Step onto a campus designed for the next century. Experience our state-of-the-art laboratory hubs, architectural marvels, and collaborative student spaces.'
        },
        rain: {
            title: 'Experience Ghousia<br><span class="text-gradient">in the Monsoon.</span>',
            subtitle: 'Watch the campus come alive as monsoon rains transform every corridor into a cinematic frame. The rhythm of rain meets the pulse of learning.'
        },
        night: {
            title: 'A Campus That Never<br><span class="text-gradient">Stops Inspiring.</span>',
            subtitle: 'When the sun sets, our campus illuminates with purpose. Late-night labs, lit pathways, and the quiet energy of minds at work.'
        }
    };

    const statusMessages = {
        clear: { initializing: 'Initializing Day...', active: 'Morning Atmosphere Active' },
        rain: { initializing: 'Initializing Rain...', active: 'Monsoon Atmosphere Active' },
        night: { initializing: 'Initializing Night...', active: 'Campus Lights Active' }
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
            heroSubtitle.textContent = content.subtitle;
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

    // --- Stars Class (Night) ---
    class Star {
        constructor() {
            this.reset();
            this.opacity = Math.random(); // Randomize initial phase
        }

        reset() {
            this.x = Math.random() * state.width;
            this.y = Math.random() * (state.height * 0.7); // Mostly sky coverage
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
            this.reset();
        }

        reset() {
            // Constrain fireflies horizontally to the left side where the trees are
            this.x = Math.random() * (state.width * 0.28);
            // Constrain vertically around the foliage (from 35% down to 90% of screen height)
            this.y = state.height * 0.35 + Math.random() * (state.height * 0.55);
            this.size = 1.0 + Math.random() * 1.5;
            this.speedX = (Math.random() - 0.45) * 0.25; // Drifting slightly
            this.speedY = (Math.random() - 0.5) * 0.25;
            this.alpha = 0;
            this.alphaTarget = 0.2 + Math.random() * 0.5;
            this.fadeSpeed = 0.005 + Math.random() * 0.01;
            this.fadingIn = true;
            this.angle = Math.random() * Math.PI * 2;
            this.waveSpeed = 0.01 + Math.random() * 0.02;
            this.waveRadius = 0.1 + Math.random() * 0.25;
        }

        update() {
            // Dynamic Brownian-like float curves
            this.angle += this.waveSpeed;
            this.x += this.speedX + Math.cos(this.angle) * this.waveRadius;
            this.y += this.speedY + Math.sin(this.angle) * this.waveRadius;

            // Handle glowing fading phases
            if (this.fadingIn) {
                this.alpha += this.fadeSpeed;
                if (this.alpha >= this.alphaTarget) {
                    this.alpha = this.alphaTarget;
                    this.fadingIn = false;
                }
            } else {
                this.alpha -= this.fadeSpeed * 0.7; // Fade out slightly slower
                if (this.alpha <= 0.0) {
                    this.reset();
                }
            }

            // Screen boundary reset (Lock near the trees on the left)
            if (this.x < -10 || this.x > state.width * 0.32 || this.y < state.height * 0.30 || this.y > state.height * 0.95) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(180, 245, 110, 0.8)';
            ctx.fillStyle = `rgba(180, 245, 110, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
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
            stars: isMobile ? 60 : 150,
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
        const trackedButtons = document.querySelectorAll('.weather-btn, .btn, .live-sync-container');

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
    }

    // --- Parallax Mouse Tracking ---
    function initParallax() {
        if (window.innerWidth <= 768) return;

        document.addEventListener('mousemove', (e) => {
            // Map mouse position to a range of -15 to 15
            const cx = state.width / 2;
            const cy = state.height / 2;
            state.targetParallaxX = ((e.clientX - cx) / cx) * 15;
            state.targetParallaxY = ((e.clientY - cy) / cy) * 15;
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
                    // Reset back to original layout position
                    target.magneticX = 0;
                    target.magneticY = 0;

                    const scaleFactor = target.classList.contains('active') ? 'scale(1.02)' : '';
                    const translationY = target.classList.contains('active') ? 'translateY(-2px)' : '';
                    target.style.transform = `${translationY} ${scaleFactor}`;
                    target.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
                }
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

        // Live Weather Sync Toggle & Premium Feature Card Interactive Events
        const liveSyncWidget = document.getElementById('live-sync-widget');
        const syncFeatureCard = document.getElementById('sync-feature-card');

        if (liveSyncWidget && syncFeatureCard) {
            // Hover show/hide premium feature card
            liveSyncWidget.addEventListener('mouseenter', () => {
                syncFeatureCard.classList.add('active');
            });
            liveSyncWidget.addEventListener('mouseleave', () => {
                syncFeatureCard.classList.remove('active');
            });

            // Click triggers locked chime + toggle switch container bounce
            liveSyncWidget.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Play locked sensory sound blip
                triggerLockedChime();
                
                // Subtle visual bounce response on the toggle widget
                liveSyncWidget.style.transform = 'translate3d(0, 0, 10px) scale(0.97)';
                setTimeout(() => {
                    // Let the magnetism restore normal state
                    liveSyncWidget.style.transform = '';
                }, 100);
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

        // Show initial atmosphere status briefly
        setTimeout(() => {
            atmosphereStatusEl.style.opacity = '0.4';
            atmosphereStatusText.textContent = 'Atmosphere Engine';
        }, 200);

        // Start requestAnimationFrame core loops
        animate();
    }

    // Execute setup!
    initialize();
});
