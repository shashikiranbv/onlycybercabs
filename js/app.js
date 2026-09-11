/**
 * ONLYCYBERCABS - Main Application Controller & Audio Engine
 * Domain: www.onlycybercabs.com
 */

// Web Audio API Futuristic Sound Synthesizer
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playBeep() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playSliderTick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch (e) {}
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const notes = [587.33, 739.99, 880.00]; // D, F#, A
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.08));
        gain.gain.setValueAtTime(0.07, this.ctx.currentTime + (idx * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (idx * 0.08) + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + (idx * 0.08));
        osc.stop(this.ctx.currentTime + (idx * 0.08) + 0.25);
      });
    } catch (e) {}
  }

  playSummon() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {}
  }
}

window.soundFX = new SoundFX();

// Toast notification helper
window.showToast = function(msg, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  let icon = '⚡';
  if (type === 'success') icon = '✓';
  if (type === 'warn') icon = '⚠';

  toast.innerHTML = `<span style="color:var(--accent-amber); font-weight:bold;">${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3800);
};

// Application Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  // 1. Audio toggle button
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      window.soundFX.enabled = !window.soundFX.enabled;
      soundBtn.classList.toggle('active', window.soundFX.enabled);
      soundBtn.querySelector('.sound-label').textContent = window.soundFX.enabled ? 'AUDIO: ON' : 'AUDIO: OFF';
      if (window.soundFX.enabled) {
        window.soundFX.playClick();
        window.showToast('Autonomous UI feedback audio enabled', 'info');
      } else {
        window.showToast('Audio feedback muted', 'info');
      }
    });
  }

  // 2. Initialize Subsystems
  if (window.FleetRadar) {
    new window.FleetRadar('radarCanvas');
  }
  if (window.BookingStudio) {
    new window.BookingStudio();
  }
  if (window.FleetCalculator) {
    new window.FleetCalculator();
  }

  // 3. Live Ticker Mileage & Active Counter
  let autonomousMiles = 1428590;
  const milesEl = document.getElementById('tickerMiles');
  if (milesEl) {
    setInterval(() => {
      autonomousMiles += Math.floor(Math.random() * 3) + 1;
      milesEl.textContent = autonomousMiles.toLocaleString();
    }, 2800);
  }

  // 4. Host Modal Handlers
  const openHostModalBtns = document.querySelectorAll('.open-host-modal-btn');
  const hostModal = document.getElementById('hostModal');
  const closeHostModalBtn = document.getElementById('closeHostModalBtn');
  const hostForm = document.getElementById('hostEnrollmentForm');

  openHostModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (hostModal) {
        hostModal.style.display = 'flex';
        if (window.soundFX) window.soundFX.playClick();
      }
    });
  });

  if (closeHostModalBtn && hostModal) {
    closeHostModalBtn.addEventListener('click', () => {
      hostModal.style.display = 'none';
      if (window.soundFX) window.soundFX.playClick();
    });
    hostModal.addEventListener('click', (e) => {
      if (e.target === hostModal) hostModal.style.display = 'none';
    });
  }

  if (hostForm) {
    hostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const vin = document.getElementById('hostVinInput').value;
      if (hostModal) hostModal.style.display = 'none';
      window.showToast(`Enrollment request submitted for VIN ending in ${vin.slice(-4) || '7890'}. Telemetry validation pending.`, 'success');
      if (window.soundFX) window.soundFX.playSuccess();
      hostForm.reset();
    });
  }

  // Smooth scroll for nav anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (window.soundFX) window.soundFX.playClick();
        }
      }
    });
  });
});
