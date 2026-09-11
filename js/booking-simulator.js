/**
 * ONLYCYBERCABS - Interactive Summon & Cabin Customizer Studio
 * Domain: www.onlycybercabs.com
 */

class BookingStudio {
  constructor() {
    this.selectedTier = 'solo';
    this.selectedColor = 'amber';
    this.isSimulating = false;
    this.simulationTimer = null;

    this.rates = {
      solo: { base: 4.50, perMile: 1.20, name: 'Cybercab Solo (2-Seat)' },
      duo: { base: 8.00, perMile: 2.10, name: 'Executive Fleet Duo' },
      cargo: { base: 6.00, perMile: 1.50, name: 'Airport Express & Luggage' }
    };

    this.initElements();
    this.setupListeners();
    this.updateQuote();
  }

  initElements() {
    this.pickupSelect = document.getElementById('pickupSelect');
    this.dropoffSelect = document.getElementById('dropoffSelect');
    this.tierOptions = document.querySelectorAll('.tier-option');
    this.colorSwatches = document.querySelectorAll('.swatch-btn');
    this.summonBtn = document.getElementById('summonBtn');
    this.cancelSimBtn = document.getElementById('cancelSimBtn');
    this.simulationCard = document.getElementById('simulationCard');

    // Quote Elements
    this.quoteEta = document.getElementById('quoteEta');
    this.quoteDistance = document.getElementById('quoteDistance');
    this.quotePrice = document.getElementById('quotePrice');
  }

  setupListeners() {
    // Dropdowns
    if (this.pickupSelect) {
      this.pickupSelect.addEventListener('change', () => this.updateQuote());
    }
    if (this.dropoffSelect) {
      this.dropoffSelect.addEventListener('change', () => this.updateQuote());
    }

    // Tier Selector
    this.tierOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        this.tierOptions.forEach(o => o.classList.remove('selected'));
        const target = e.currentTarget;
        target.classList.add('selected');
        this.selectedTier = target.dataset.tier;
        if (window.soundFX) window.soundFX.playClick();
        this.updateQuote();
      });
    });

    // Cabin Mood Swatches
    this.colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        this.colorSwatches.forEach(s => s.classList.remove('active'));
        const btn = e.currentTarget;
        btn.classList.add('active');
        const color = btn.dataset.color;
        const hex = btn.dataset.hex;
        this.setCabinAmbiance(color, hex);
        if (window.soundFX) window.soundFX.playBeep();
      });
    });

    // Summon Button
    if (this.summonBtn) {
      this.summonBtn.addEventListener('click', () => {
        if (!this.isSimulating) {
          this.startSummonSimulation();
        }
      });
    }

    if (this.cancelSimBtn) {
      this.cancelSimBtn.addEventListener('click', () => {
        this.stopSimulation();
      });
    }
  }

  setCabinAmbiance(name, hex) {
    const root = document.documentElement;
    root.style.setProperty('--cabin-ambient', hex);
    
    // Hex to rgba glow
    let rgb = '245, 158, 11';
    if (name === 'cyan') rgb = '0, 240, 255';
    if (name === 'violet') rgb = '168, 85, 247';
    if (name === 'white') rgb = '255, 255, 255';

    root.style.setProperty('--cabin-glow', `rgba(${rgb}, 0.38)`);

    const hudText = document.getElementById('cabinHudLighting');
    if (hudText) {
      hudText.textContent = `AMBIANCE: ${name.toUpperCase()}`;
    }

    window.showToast(`Cabin ambiance synchronised to ${name.toUpperCase()}`, 'info');
  }

  updateQuote() {
    const pickup = this.pickupSelect ? this.pickupSelect.value : 'Downtown Core';
    const dropoff = this.dropoffSelect ? this.dropoffSelect.value : 'Airport Skyway Hub';

    // Approximate distance logic based on routes
    let distance = 6.4;
    let eta = 3;

    if (pickup === dropoff) {
      distance = 1.2;
      eta = 2;
    } else if (pickup.includes('Airport') || dropoff.includes('Airport')) {
      distance = 14.8;
      eta = 4;
    } else if (pickup.includes('Marina') || dropoff.includes('Marina')) {
      distance = 8.2;
      eta = 3;
    }

    const tier = this.rates[this.selectedTier] || this.rates.solo;
    const price = tier.base + (distance * tier.perMile);

    if (this.quoteEta) this.quoteEta.textContent = `${eta} mins`;
    if (this.quoteDistance) this.quoteDistance.textContent = `${distance.toFixed(1)} mi`;
    if (this.quotePrice) this.quotePrice.textContent = `$${price.toFixed(2)}`;
  }

  startSummonSimulation() {
    this.isSimulating = true;
    if (this.summonBtn) {
      this.summonBtn.disabled = true;
      this.summonBtn.innerHTML = `<span>DISPATCHING AI FLEET...</span>`;
    }

    if (this.simulationCard) {
      this.simulationCard.classList.add('active');
    }

    if (window.soundFX) window.soundFX.playSummon();
    window.showToast('Connecting to OnlyCybercabs AI Dispatch Cloud...', 'info');

    const steps = document.querySelectorAll('.sim-step');
    const simStatusText = document.getElementById('simStatusText');
    const simEtaCountdown = document.getElementById('simEtaCountdown');
    const simVehicleCard = document.getElementById('simVehicleCard');

    let currentStep = 0;
    const updateSteps = (stepIdx) => {
      steps.forEach((s, idx) => {
        s.classList.remove('active', 'completed');
        if (idx < stepIdx) s.classList.add('completed');
        if (idx === stepIdx) s.classList.add('active');
      });
    };

    // Step 1: Matching
    updateSteps(0);
    if (simStatusText) simStatusText.textContent = 'Allocating closest Cybercab unit with 90%+ battery...';

    // Step 2: In transit (after 2s)
    this.simulationTimer = setTimeout(() => {
      updateSteps(1);
      if (simStatusText) simStatusText.textContent = 'Cybercab #01 Apex is navigating to pickup point autonomously.';
      if (simVehicleCard) simVehicleCard.style.display = 'flex';
      if (simEtaCountdown) simEtaCountdown.textContent = 'Arriving in 1 min 45s';
      if (window.soundFX) window.soundFX.playBeep();

      // Step 3: Arrived & Dihedral Doors Actuated (after 4s)
      this.simulationTimer = setTimeout(() => {
        updateSteps(2);
        if (simStatusText) simStatusText.textContent = 'Cybercab #01 Apex has arrived! Butterfly doors opening automatically.';
        if (simEtaCountdown) simEtaCountdown.textContent = 'DOORS UNLOCKED // READY TO BOARD';
        if (window.soundFX) window.soundFX.playSuccess();
        window.showToast('Cybercab #01 Apex arrived at pickup point! Butterfly doors open.', 'success');

        // Step 4: En Route (after 3.5s)
        this.simulationTimer = setTimeout(() => {
          updateSteps(3);
          if (simStatusText) simStatusText.textContent = 'Doors secured. En route to destination via zero-intervention FSD.';
          if (simEtaCountdown) simEtaCountdown.textContent = 'EN ROUTE // ETA 8 MINS';
          if (this.summonBtn) {
            this.summonBtn.disabled = false;
            this.summonBtn.innerHTML = `<span>TRIP ACTIVE (CLICK TO CANCEL)</span>`;
          }
        }, 3500);

      }, 4000);

    }, 2000);
  }

  stopSimulation() {
    clearTimeout(this.simulationTimer);
    this.isSimulating = false;
    if (this.simulationCard) this.simulationCard.classList.remove('active');
    if (this.summonBtn) {
      this.summonBtn.disabled = false;
      this.summonBtn.innerHTML = `<span>SUMMON CYBERCAB NOW</span>`;
    }
    const simVehicleCard = document.getElementById('simVehicleCard');
    if (simVehicleCard) simVehicleCard.style.display = 'none';

    window.showToast('Summon simulation reset.', 'info');
  }
}

window.BookingStudio = BookingStudio;
