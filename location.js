/**
 * ============================================================================
 * Auralis Wedding Hall — Section 5: Location, Directions & Client Suite
 * Copy Address, Direction Wayfinding, VIP Gallery & Digital Invitation Handlers
 * ============================================================================
 */

(function () {
    'use strict';

    // Tactile Audio Feedback
    let audioCtx = null;
    function playTactileTick(freq = 740, duration = 0.035) {
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

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    // Dynamic Toast Notification Element
    let toastEl = null;
    let toastTimeout = null;

    function showToast(icon, message, duration = 4000) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'loc-toast';
            toastEl.innerHTML = `
                <span class="loc-toast-icon"></span>
                <span class="loc-toast-text"></span>
            `;
            document.body.appendChild(toastEl);
        }

        const iconSpan = toastEl.querySelector('.loc-toast-icon');
        const textSpan = toastEl.querySelector('.loc-toast-text');

        if (iconSpan) iconSpan.textContent = icon;
        if (textSpan) textSpan.textContent = message;

        toastEl.classList.add('show');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
        }, duration);
    }

    // Initialize Section 5 Interactivity
    function initLocationSection() {
        const section = document.getElementById('auralis-location');
        if (!section) return;

        // 1. Copy Address Functionality
        const copyBtn = document.getElementById('loc-copy-btn');
        const copyTextEl = document.getElementById('loc-copy-text');
        const addressEl = document.getElementById('loc-address-text');

        if (copyBtn && addressEl) {
            copyBtn.addEventListener('click', () => {
                playTactileTick(820);
                const addressText = addressEl.innerText.replace(/\s+/g, ' ').trim();

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(addressText).then(() => {
                        handleCopiedState();
                    }).catch(() => {
                        fallbackCopy(addressText);
                    });
                } else {
                    fallbackCopy(addressText);
                }
            });
        }

        function fallbackCopy(text) {
            const temp = document.createElement('textarea');
            temp.value = text;
            temp.style.position = 'fixed';
            temp.style.opacity = '0';
            document.body.appendChild(temp);
            temp.select();
            try {
                document.execCommand('copy');
                handleCopiedState();
            } catch (e) {
                showToast('📍', 'Address: ' + text);
            }
            document.body.removeChild(temp);
        }

        function handleCopiedState() {
            if (copyBtn) copyBtn.classList.add('copied');
            if (copyTextEl) copyTextEl.textContent = 'Copied to Clipboard!';
            showToast('✓', 'Estate address copied to clipboard');

            setTimeout(() => {
                if (copyBtn) copyBtn.classList.remove('copied');
                if (copyTextEl) copyTextEl.textContent = 'Copy Address';
            }, 3000);
        }

        // 2. Client Main Button 1: Client Gallery
        const btnGallery = document.getElementById('btn-client-gallery');
        if (btnGallery) {
            btnGallery.addEventListener('click', (e) => {
                const currentHref = btnGallery.getAttribute('href');
                const targetLink = btnGallery.getAttribute('data-link');

                playTactileTick(880);

                // If no real link is assigned yet (href is # or blank or empty data-link)
                if (!targetLink && (!currentHref || currentHref === '#' || currentHref === '')) {
                    e.preventDefault();
                    showToast('📸', 'Client Gallery: Ready for your link! Share your gallery URL and we will connect it instantly.');
                }
            });
        }

        // 3. Client Main Button 2: Digital Invitation
        const btnInvitation = document.getElementById('btn-digital-invitation');
        if (btnInvitation) {
            btnInvitation.addEventListener('click', (e) => {
                const currentHref = btnInvitation.getAttribute('href');
                const targetLink = btnInvitation.getAttribute('data-link');

                playTactileTick(920);

                // If no real link is assigned yet (href is # or blank or empty data-link)
                if (!targetLink && (!currentHref || currentHref === '#' || currentHref === '')) {
                    e.preventDefault();
                    showToast('✉️', 'Digital Invitation: Ready for your link! Share your invitation URL and we will connect it instantly.');
                }
            });
        }

        // 4. Direction CTA Button
        const dirBtn = document.getElementById('btn-get-directions');
        if (dirBtn) {
            dirBtn.addEventListener('click', () => {
                playTactileTick(960);
            });
        }

        const phoneBtn = document.getElementById('btn-contact-concierge');
        if (phoneBtn) {
            phoneBtn.addEventListener('click', () => {
                playTactileTick(780);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLocationSection);
    } else {
        initLocationSection();
    }
})();
