/**
 * ============================================================================
 * Auralis Wedding Hall — Section 4: 360° Real Drone Orbit & 3D Spatial Suite
 * Interactive Cursor Scrubbing, 3D Perspective Tilt & Canvas Turntable Engine
 * ============================================================================
 */

(function () {
    'use strict';

    // 1. ARCHITECTURAL ESTATE ZONE DATA
    const ZONES_DATA = {
        ballroom: {
            id: 'ballroom',
            code: 'FACADE 01 / GRAND ENTRY',
            badge: 'MAIN ENTRANCE & STEPS',
            title: 'Grand Royal Portico & Entrance',
            desc: 'The monumental entrance of Auralis Wedding Hall featuring a palatial sweeping staircase, double-height architectural columns, and majestic glass-fronted atrium overlooking the arrival plaza.',
            videoTime: 1.5,
            frameIndex: 12,
            camTarget: { x: 0, y: 3, z: 0 },
            camPos: { x: 42, y: 35, z: 42 },
            metrics: {
                area: '15,000 SQ. FT.',
                areaSub: 'Main Hall + Atrium',
                capacity: '1,200 GUESTS',
                capacitySub: 'Banqueting (1,800 Theater)',
                height: '28 FT.',
                heightSub: 'Double-Height Clearance',
                flooring: 'Italian Statuario',
                flooringSub: 'Polished Marble & Parquet'
            },
            features: [
                'Sweeping grand entrance staircase leading to double-height main foyer',
                'Motorized DMX structural rigging for bespoke floral canopies & chandeliers',
                'Integrated ultra-wide 8K micro-LED display backdrop (40ft × 16ft)'
            ]
        },
        stage: {
            id: 'stage',
            code: 'ZONE 02 / ELEVATED PLINTH',
            badge: 'CEREMONY STAGE',
            title: 'Imperial Sovereign Stage',
            desc: 'A monumental raised plinth engineered for royal mandaps, nikah thrones, and grand reception ceremonies, offering clear sightlines from every corner of the hall.',
            videoTime: 18.5,
            frameIndex: 172,
            camTarget: { x: 0, y: 3.5, z: -15 },
            camPos: { x: 0, y: 18, z: 16 },
            metrics: {
                area: '1,440 SQ. FT.',
                areaSub: '60 ft × 24 ft Dimensions',
                capacity: '80 ENTOURAGE',
                capacitySub: 'Simultaneous Stage Load',
                height: '4.5 FT.',
                heightSub: 'Elevated Sightline Level',
                flooring: 'Acoustic Hardwood',
                flooringSub: 'Shock-Absorbing Subfloor'
            },
            features: [
                'Motorized hydraulic central platform for bride & groom reveal',
                'Discreet dual backstage corridors directly connected to Green Rooms',
                'Pre-wired 64-channel live symphonic concert audio patch system'
            ]
        },
        dining: {
            id: 'dining',
            code: 'WING 02 / EAST FACADE',
            badge: 'BANQUET PAVILION',
            title: 'East Wing & Crystal Dining Pavilion',
            desc: 'The elongated east wing architecture housing the expansive dining pavilion, banquet kitchens, and perimeter garden views with abundant natural light.',
            videoTime: 6.8,
            frameIndex: 58,
            camTarget: { x: 32, y: 4, z: 0 },
            camPos: { x: 55, y: 26, z: 32 },
            metrics: {
                area: '10,500 SQ. FT.',
                areaSub: '975 sq. meters',
                capacity: '800 SEATED',
                capacitySub: 'Simultaneous Dining',
                height: '22 FT.',
                heightSub: 'Natural Skylight Atrium',
                flooring: 'Honed Travertine',
                flooringSub: 'Slip-Resistant Finish'
            },
            features: [
                '12 Built-in live artisanal culinary stations with copper extraction hoods',
                'Fast-service insulated breezeway connecting directly to Master Production Kitchen',
                'Customizable round table arrangements (6, 8, or 10-guest configurations)'
            ]
        },
        bridal: {
            id: 'bridal',
            code: 'WING 03 / REAR SANCTUARY',
            badge: 'VIP RETREAT',
            title: 'Sovereign Bridal & Groom Suites',
            desc: 'The private rear wing sanctuary complete with luxury dressing suites, en-suite Italian marble powder rooms, and private relaxation lounges shielded from public areas.',
            videoTime: 12.0,
            frameIndex: 104,
            camTarget: { x: -30, y: 3, z: -10 },
            camPos: { x: -48, y: 22, z: 18 },
            metrics: {
                area: '2,200 SQ. FT.',
                areaSub: 'Dual Private Wings',
                capacity: '25 VIP GUESTS',
                capacitySub: 'Family & Bridal Entourage',
                height: '14 FT.',
                heightSub: 'Acoustic Sound-Proofed',
                flooring: 'Handmade Silk Plush',
                flooringSub: 'Carpet & Calcutta Marble'
            },
            features: [
                'Daylight-balanced 98+ CRI vanity stations designed for makeup artists',
                'Dedicated butler service pantry with champagne bar & refrigerated amenities',
                'Private VIP elevator and discreet motorcade drop-off corridor'
            ]
        },
        lawns: {
            id: 'lawns',
            code: 'GROUNDS 01 / EAST GARDENS',
            badge: 'GARDENS & LAWNS',
            title: 'Imperial Lawns & Garden Perimeter',
            desc: 'Expansive open green lawns flanking the hall, offering manicured turf and open sky for grand outdoor sangeet nights, receptions, and open-air ceremonies.',
            videoTime: 7.8,
            frameIndex: 70,
            camTarget: { x: 14, y: 1, z: 24 },
            camPos: { x: 38, y: 30, z: 54 },
            metrics: {
                area: '35,000 SQ. FT.',
                areaSub: '3,250 sq. meters',
                capacity: '2,000+ GUESTS',
                capacitySub: 'Al Fresco Celebrations',
                height: 'OPEN SKY',
                heightSub: 'Starlit Canopy Overlook',
                flooring: 'Bermuda Grass',
                flooringSub: 'Paved Stone Walkways'
            },
            features: [
                'Illuminated central reflecting pool with choreographed fountain nozzles',
                'Dedicated fireworks and aerial drone light show launch pad',
                'Modular German clear-span waterproof marquee available on demand'
            ]
        },
        valet: {
            id: 'valet',
            code: 'CONCOURSE / WEST DRIVEWAY',
            badge: 'VALET CONCOURSE',
            title: 'West Facade & Paved Valet Bay',
            desc: 'The broad paved motorcade driveway and arrival plaza with parking capacity for over 500 vehicles and smooth dual-lane circular flow.',
            videoTime: 16.5,
            frameIndex: 146,
            camTarget: { x: -26, y: 2, z: 20 },
            camPos: { x: -48, y: 24, z: 46 },
            metrics: {
                area: '18,000 SQ. FT.',
                areaSub: 'Covered Portico + Loops',
                capacity: '500+ VEHICLES',
                capacitySub: 'Subterranean & Paved Bays',
                height: '24 FT.',
                heightSub: 'Grand Archway Clearance',
                flooring: 'Granite Cobblestone',
                flooringSub: 'Heated & Weather-Shielded'
            },
            features: [
                'Grand illuminated facade with water cascade arrival area',
                'Chauffeur lounge with private refreshments and live CCTV monitors',
                'Universal barrier-free wheelchair & VIP motorcade access'
            ]
        }
    };

    // Total frames extracted from drone orbit footage
    const TOTAL_FRAMES = 182;

    // 2. STATE OBJECT
    const state = {
        activeZoneKey: 'ballroom',
        isAutoOrbiting: true,
        isMuted: true,
        // 360 Canvas Turntable
        currentFrame: 0,
        targetFrame: 0,
        lastRenderedFrame: -1,
        lastTickFrame: 0,
        // User Interaction
        isDragging: false,
        isHovered: false,
        dragStartX: 0,
        dragStartFrame: 0,
        dragVelocity: 0,
        lastDragX: 0,
        lastDragTime: 0,
        // 3D Perspective Tilt
        tiltX: 0,
        tiltY: 0,
        targetTiltX: 0,
        targetTiltY: 0
    };

    // Tactile Audio Feedback
    let audioCtx = null;
    function playTactileTick(freq = 720, duration = 0.03) {
        if (state.isMuted) return;
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
            osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + duration);

            gain.gain.setValueAtTime(0.035, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    // --------------------------------------------------------------------------
    // 3. 360° CANVAS TURNTABLE ENGINE (INSTANT CURSOR & DRAG ROTATION)
    // --------------------------------------------------------------------------
    const canvas = document.getElementById('fp-orbit-canvas');
    const canvasWrapper = document.getElementById('fp-video-orbit-wrapper');
    const stageContainer = document.getElementById('fp-video-3d-stage');
    const angleBadgeText = document.getElementById('fp-live-angle-text');
    const orbitLoader = document.getElementById('fp-orbit-loader');
    const loaderText = document.getElementById('fp-loader-text');

    let ctx = null;
    const loadedImages = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let imagesPreloaded = false;

    function initVideoOrbit() {
        if (!canvas || !canvasWrapper) return;
        ctx = canvas.getContext('2d', { alpha: false });

        // Show subtle loading state
        if (orbitLoader) orbitLoader.classList.add('visible');

        // Preload all 182 high-definition frames into browser cache
        preloadOrbitFrames();

        // Responsive canvas sizing
        window.addEventListener('resize', handleCanvasResize);
        handleCanvasResize();

        // Cursor & Drag Interaction Listeners
        canvasWrapper.addEventListener('mouseenter', onPointerEnter);
        canvasWrapper.addEventListener('mouseleave', onPointerLeave);
        canvasWrapper.addEventListener('mousemove', onPointerMove);
        canvasWrapper.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mouseup', onPointerUp);

        // Touch support for mobile / tablet
        canvasWrapper.addEventListener('touchstart', onTouchStart, { passive: true });
        canvasWrapper.addEventListener('touchmove', onTouchMove, { passive: false });
        canvasWrapper.addEventListener('touchend', onTouchEnd);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleCanvasResize, 250);
        });

        // Auto Orbit button
        const btnAuto = document.getElementById('fp-video-autorotate');
        if (btnAuto) {
            btnAuto.addEventListener('click', toggleAutoOrbit);
        }

        // Audio button
        const btnAudio = document.getElementById('fp-video-audio');
        if (btnAudio) {
            btnAudio.addEventListener('click', toggleAudio);
        }

        // Fullscreen button
        const btnFullscreen = document.getElementById('fp-video-fullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', toggleFullscreen);
        }

        // Start 60fps render loop
        requestAnimationFrame(updateOrbitLoop);
    }

    function preloadOrbitFrames() {
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            const paddedNum = String(i).padStart(3, '0');
            img.src = `Assets/orbit360/frame_${paddedNum}.jpg`;

            const frameIndex = i - 1;
            img.onload = () => {
                loadedImages[frameIndex] = img;
                loadedCount++;

                // Draw frame 0 immediately upon loading
                if (frameIndex === 0) {
                    renderOrbitFrame(0, true);
                }

                // Update loader progress
                if (loaderText && loadedCount < TOTAL_FRAMES) {
                    const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
                    loaderText.textContent = `Loading 3D Orbit... ${pct}%`;
                }

                // Hide loader once initial batch is ready
                if (loadedCount >= 20 && orbitLoader) {
                    orbitLoader.classList.remove('visible');
                    imagesPreloaded = true;
                }
            };

            img.onerror = () => {
                loadedCount++;
            };
        }
    }

    function handleCanvasResize() {
        if (!canvas || !canvasWrapper) return;
        const rect = canvasWrapper.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = Math.round(rect.width * dpr);
        const targetH = Math.round(rect.height * dpr);

        if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
            renderOrbitFrame(getWrappedFrameIndex(state.currentFrame), true);
        }
    }

    function drawImageCover(img) {
        if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        const scale = Math.max(cw / iw, ch / ih);
        const nw = iw * scale;
        const nh = ih * scale;
        const ox = (cw - nw) * 0.5;
        const oy = (ch - nh) * 0.5;

        ctx.drawImage(img, ox, oy, nw, nh);
    }

    function getWrappedFrameIndex(frame) {
        const raw = Math.round(frame);
        return ((raw % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES;
    }

    function renderOrbitFrame(frameIndex, force = false) {
        if (!force && frameIndex === state.lastRenderedFrame) return;

        let img = loadedImages[frameIndex];
        // If this specific frame hasn't loaded yet, fallback to closest loaded frame
        if (!img || !img.complete || img.naturalWidth === 0) {
            for (let offset = 1; offset < 30; offset++) {
                const prev = getWrappedFrameIndex(frameIndex - offset);
                if (loadedImages[prev] && loadedImages[prev].complete) {
                    img = loadedImages[prev];
                    break;
                }
                const next = getWrappedFrameIndex(frameIndex + offset);
                if (loadedImages[next] && loadedImages[next].complete) {
                    img = loadedImages[next];
                    break;
                }
            }
        }

        if (img && img.complete && img.naturalWidth > 0) {
            drawImageCover(img);
            state.lastRenderedFrame = frameIndex;

            // Tactile feedback on rotation
            if (Math.abs(frameIndex - state.lastTickFrame) >= 5) {
                state.lastTickFrame = frameIndex;
                playTactileTick(760);
            }

            // Sync dynamic angle badge & inspector HUD
            syncAngleHUD(frameIndex);
        }
    }

    function onPointerEnter() {
        state.isHovered = true;
    }

    function onPointerLeave() {
        state.isHovered = false;
        state.targetTiltX = 0;
        state.targetTiltY = 0;
    }

    function onPointerMove(e) {
        const rect = canvasWrapper.getBoundingClientRect();
        const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        // 3D Perspective Tilt on viewport container
        state.targetTiltX = (normX - 0.5) * 12; // rotateY
        state.targetTiltY = -(normY - 0.5) * 8; // rotateX

        if (state.isDragging) {
            // Drag rotation: continuous seamless 360 wrap
            const dx = e.clientX - state.dragStartX;
            const deltaFrames = -(dx / rect.width) * TOTAL_FRAMES * 1.35;
            state.targetFrame = state.dragStartFrame + deltaFrames;

            // Track velocity for inertia release
            const now = performance.now();
            const dt = now - state.lastDragTime;
            if (dt > 8) {
                state.dragVelocity = (e.clientX - state.lastDragX) / dt;
                state.lastDragX = e.clientX;
                state.lastDragTime = now;
            }
        } else {
            // Direct Cursor Scrubbing: moving mouse directly rotates the hall 360°
            // Map normX across the total frame range so the building spins as you move the cursor!
            state.targetFrame = normX * (TOTAL_FRAMES - 1);
        }
    }

    function onPointerDown(e) {
        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.dragStartFrame = state.targetFrame;
        state.dragVelocity = 0;
        state.lastDragX = e.clientX;
        state.lastDragTime = performance.now();

        // Pause auto orbit on manual drag
        if (state.isAutoOrbiting) {
            state.isAutoOrbiting = false;
            updatePlayBtnState();
        }
        canvasWrapper.style.cursor = 'grabbing';
    }

    function onPointerUp() {
        if (state.isDragging) {
            state.isDragging = false;
            canvasWrapper.style.cursor = 'ew-resize';

            // Apply inertia momentum
            if (Math.abs(state.dragVelocity) > 0.15) {
                state.targetFrame -= state.dragVelocity * 45;
            }
        }
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalSwipe = null;

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            state.isDragging = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            state.dragStartX = touchStartX;
            state.dragStartFrame = state.targetFrame;
            state.dragVelocity = 0;
            state.lastDragX = touchStartX;
            state.lastDragTime = performance.now();
            isHorizontalSwipe = null;

            if (state.isAutoOrbiting) {
                state.isAutoOrbiting = false;
                updatePlayBtnState();
            }
        }
    }

    function onTouchMove(e) {
        if (state.isDragging && e.touches.length === 1) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const diffX = Math.abs(touchX - touchStartX);
            const diffY = Math.abs(touchY - touchStartY);

            if (isHorizontalSwipe === null && (diffX > 7 || diffY > 7)) {
                isHorizontalSwipe = diffX >= diffY;
            }

            // Vertical scroll intent: allow normal page scroll without hijacking
            if (isHorizontalSwipe === false) {
                return;
            }

            // Horizontal swipe intent: prevent page bounce/navigation and rotate model
            if (isHorizontalSwipe === true && e.cancelable) {
                e.preventDefault();
            }

            const rect = canvasWrapper.getBoundingClientRect();
            const dx = touchX - state.dragStartX;
            const deltaFrames = -(dx / rect.width) * TOTAL_FRAMES * 1.45;
            state.targetFrame = state.dragStartFrame + deltaFrames;

            const now = performance.now();
            const dt = now - state.lastDragTime;
            if (dt > 8) {
                state.dragVelocity = (touchX - state.lastDragX) / dt;
                state.lastDragX = touchX;
                state.lastDragTime = now;
            }
        }
    }

    function onTouchEnd() {
        if (state.isDragging) {
            state.isDragging = false;
            if (isHorizontalSwipe === true && Math.abs(state.dragVelocity) > 0.12) {
                state.targetFrame -= state.dragVelocity * 35;
            }
            isHorizontalSwipe = null;
        }
    }

    function toggleAutoOrbit() {
        playTactileTick(800);
        state.isAutoOrbiting = !state.isAutoOrbiting;
        updatePlayBtnState();
    }

    function updatePlayBtnState() {
        const btnAuto = document.getElementById('fp-video-autorotate');
        if (btnAuto) {
            btnAuto.classList.toggle('active', state.isAutoOrbiting);
            const textSpan = btnAuto.querySelector('span:last-child');
            if (textSpan) {
                textSpan.textContent = state.isAutoOrbiting ? 'Pause Spin' : 'Auto Orbit';
            }
        }
    }

    function toggleAudio() {
        state.isMuted = !state.isMuted;
        if (!state.isMuted) {
            playTactileTick(820);
        }
        const btnAudio = document.getElementById('fp-video-audio');
        if (btnAudio) {
            btnAudio.classList.toggle('active', !state.isMuted);
            const iconSpan = btnAudio.querySelector('.fp-cam-btn-icon');
            if (iconSpan) iconSpan.textContent = state.isMuted ? '🔇' : '🔊';
        }
    }

    function toggleFullscreen() {
        playTactileTick(900);
        if (!document.fullscreenElement) {
            const container = document.getElementById('fp-map-viewport');
            if (container && container.requestFullscreen) {
                container.requestFullscreen().catch(() => {});
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    // Main 60fps render loop
    function updateOrbitLoop() {
        // 1. Smooth 3D Perspective Tilt on the stage
        state.tiltX += (state.targetTiltX - state.tiltX) * 0.12;
        state.tiltY += (state.targetTiltY - state.tiltY) * 0.12;

        if (stageContainer) {
            stageContainer.style.transform = `perspective(1100px) rotateX(${state.tiltY.toFixed(2)}deg) rotateY(${state.tiltX.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        }

        // 2. Majestic Auto-Orbit when user is not actively interacting
        if (state.isAutoOrbiting && !state.isHovered && !state.isDragging) {
            state.targetFrame += 0.32;
        }

        // 3. Silky frame interpolation
        state.currentFrame += (state.targetFrame - state.currentFrame) * 0.28;

        // 4. Render active frame to canvas
        const activeIndex = getWrappedFrameIndex(state.currentFrame);
        renderOrbitFrame(activeIndex);

        requestAnimationFrame(updateOrbitLoop);
    }

    // Map frame index (0 to 181) to venue facade
    let lastDetectedZone = null;
    function syncAngleHUD(frameIndex) {
        let detectedZone = 'ballroom';

        if (frameIndex >= 0 && frameIndex < 38) {
            detectedZone = 'ballroom';
        } else if (frameIndex >= 38 && frameIndex < 82) {
            detectedZone = 'dining';
        } else if (frameIndex >= 82 && frameIndex < 128) {
            detectedZone = 'bridal';
        } else if (frameIndex >= 128 && frameIndex < 165) {
            detectedZone = 'valet';
        } else {
            detectedZone = 'ballroom';
        }

        if (detectedZone !== lastDetectedZone) {
            lastDetectedZone = detectedZone;
            const data = ZONES_DATA[detectedZone];
            if (data && angleBadgeText) {
                angleBadgeText.textContent = data.badge;
            }

            // Sync quick chips
            const chips = document.querySelectorAll('.fp-chip-btn');
            chips.forEach(chip => {
                if (chip.getAttribute('data-zone-chip') === detectedZone) {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            });

            // Sync inspector specifications
            updateInspectorData(detectedZone);
        }
    }

    // Jump 360 view to specific zone view via shortest angular rotation
    function jumpVideoToZone(zoneKey) {
        const data = ZONES_DATA[zoneKey];
        if (!data) return;

        state.isAutoOrbiting = false;
        updatePlayBtnState();

        const target = data.frameIndex ?? 10;
        const currentNorm = getWrappedFrameIndex(state.targetFrame);
        let diff = target - currentNorm;
        if (diff > TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES;
        if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES;

        state.targetFrame += diff;
    }



    // --------------------------------------------------------------------------
    // 5. HUD SPECS INSPECTOR UPDATE
    // --------------------------------------------------------------------------
    function updateInspectorData(zoneKey) {
        const data = ZONES_DATA[zoneKey];
        if (!data) return;
        state.activeZoneKey = zoneKey;

        const codeEl = document.getElementById('inspector-zone-code');
        const badgeEl = document.getElementById('inspector-live-tag');
        const titleEl = document.getElementById('inspector-zone-title');
        const descEl = document.getElementById('inspector-zone-desc');

        if (codeEl) codeEl.textContent = data.code;
        if (badgeEl) badgeEl.textContent = data.badge;
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;

        const areaVal = document.getElementById('metric-area-val');
        const areaSub = document.getElementById('metric-area-sub');
        const capVal = document.getElementById('metric-cap-val');
        const capSub = document.getElementById('metric-cap-sub');
        const hgtVal = document.getElementById('metric-hgt-val');
        const hgtSub = document.getElementById('metric-hgt-sub');
        const flrVal = document.getElementById('metric-flr-val');
        const flrSub = document.getElementById('metric-flr-sub');

        if (areaVal) areaVal.textContent = data.metrics.area;
        if (areaSub) areaSub.textContent = data.metrics.areaSub;
        if (capVal) capVal.textContent = data.metrics.capacity;
        if (capSub) capSub.textContent = data.metrics.capacitySub;
        if (hgtVal) hgtVal.textContent = data.metrics.height;
        if (hgtSub) hgtSub.textContent = data.metrics.heightSub;
        if (flrVal) flrVal.textContent = data.metrics.flooring;
        if (flrSub) flrSub.textContent = data.metrics.flooringSub;

        const featuresContainer = document.getElementById('inspector-features-list');
        if (featuresContainer) {
            featuresContainer.innerHTML = data.features.map(feat => `
                <div class="feature-bullet-item">
                    <span class="feature-bullet-icon">✦</span>
                    <span>${feat}</span>
                </div>
            `).join('');
        }
    }

    // --------------------------------------------------------------------------
    // 6. INITIALIZATION & LISTENERS
    // --------------------------------------------------------------------------
    function initFloorplan() {
        const section = document.getElementById('auralis-floorplan');
        if (!section) return;

        // Initialize 360 Video Engine
        initVideoOrbit();

        // Quick Zone Chips
        const chips = document.querySelectorAll('.fp-chip-btn');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const zone = chip.getAttribute('data-zone-chip');
                if (zone) {
                    playTactileTick(680);
                    jumpVideoToZone(zone);
                }
            });
        });

        // CTA Reserve Button
        const ctaBtn = document.getElementById('fp-book-cta');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', (e) => {
                playTactileTick(880);
                const availSection = document.getElementById('auralis-availability');
                if (availSection) {
                    e.preventDefault();
                    availSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Print Plan Button
        const downloadBtn = document.getElementById('fp-download-plan-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                playTactileTick(600);
                window.print();
            });
        }

        // Default to ballroom
        updateInspectorData('ballroom');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloorplan);
    } else {
        initFloorplan();
    }
})();
