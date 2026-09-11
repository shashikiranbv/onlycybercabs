/**
 * ONLYCYBERCABS - Fleet Host & Investor Yield Calculator
 * Domain: www.onlycybercabs.com
 */

class FleetCalculator {
  constructor() {
    this.cabsSlider = document.getElementById('calcCabsCount');
    this.hoursSlider = document.getElementById('calcHoursPerDay');
    this.fareSlider = document.getElementById('calcAvgFare');

    this.cabsVal = document.getElementById('valCabsCount');
    this.hoursVal = document.getElementById('valHoursPerDay');
    this.fareVal = document.getElementById('valAvgFare');

    this.netMonthlyEl = document.getElementById('calcNetMonthly');
    this.netAnnualEl = document.getElementById('calcNetAnnual');
    this.grossDailyEl = document.getElementById('calcGrossDaily');
    this.powerCostEl = document.getElementById('calcPowerCost');
    this.co2OffsetEl = document.getElementById('calcCo2Offset');

    this.setupListeners();
    this.calculate();
  }

  setupListeners() {
    [this.cabsSlider, this.hoursSlider, this.fareSlider].forEach(slider => {
      if (slider) {
        slider.addEventListener('input', () => {
          this.calculate();
          if (window.soundFX) window.soundFX.playSliderTick();
        });
      }
    });
  }

  calculate() {
    const cabs = parseInt(this.cabsSlider ? this.cabsSlider.value : 2, 10);
    const hours = parseInt(this.hoursSlider ? this.hoursSlider.value : 14, 10);
    const fare = parseFloat(this.fareSlider ? this.fareSlider.value : 18);

    // Display slider values
    if (this.cabsVal) this.cabsVal.textContent = `${cabs} ${cabs === 1 ? 'Cybercab' : 'Cybercabs'}`;
    if (this.hoursVal) this.hoursVal.textContent = `${hours} hrs / day`;
    if (this.fareVal) this.fareVal.textContent = `$${fare.toFixed(2)}`;

    // Realistic modeling:
    // ~1.8 rides per operating hour during dispatch
    const ridesPerDayPerCab = hours * 1.8;
    const dailyGross = cabs * ridesPerDayPerCab * fare;

    // Platform fee: 12% (autonomous network routing, insurance pool, remote supervision)
    const platformFee = dailyGross * 0.12;

    // Inductive wireless electricity + UV-C cleaning consumables: ~$0.14 per ride
    const dailyExpenses = (cabs * ridesPerDayPerCab * 0.85);

    const dailyNet = dailyGross - platformFee - dailyExpenses;
    const monthlyNet = dailyNet * 30.5;
    const annualNet = monthlyNet * 12;
    const co2Offset = (cabs * hours * 30.5 * 0.0084).toFixed(1);

    // Format results
    if (this.netMonthlyEl) this.netMonthlyEl.textContent = `$${Math.round(monthlyNet).toLocaleString()}`;
    if (this.netAnnualEl) this.netAnnualEl.textContent = `$${Math.round(annualNet).toLocaleString()}`;
    if (this.grossDailyEl) this.grossDailyEl.textContent = `$${Math.round(dailyGross).toLocaleString()}`;
    if (this.powerCostEl) this.powerCostEl.textContent = `-$${Math.round(platformFee + dailyExpenses).toLocaleString()} / day`;
    if (this.co2OffsetEl) this.co2OffsetEl.textContent = `${co2Offset} Tons / mo`;
  }
}

window.FleetCalculator = FleetCalculator;
