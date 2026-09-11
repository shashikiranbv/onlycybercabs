/**
 * ONLYCYBERCABS - Interactive Fleet Radar & Canvas Telemetry
 * Domain: www.onlycybercabs.com
 */

class FleetRadar {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.filter = 'all'; // all, available, transit, charging
    this.selectedCabId = 1;
    this.hoveredCabId = null;

    // Simulated Cybercabs in fleet
    this.cabs = [
      { id: 1, name: 'Cybercab #01 Apex', status: 'available', x: 220, y: 180, targetX: 420, targetY: 180, speed: 44, battery: 94, temp: '21°C', fsdVersion: 'v13.4.2', tripsToday: 18, rating: 4.98 },
      { id: 2, name: 'Cybercab #02 Valkyrie', status: 'transit', x: 520, y: 260, targetX: 680, targetY: 380, speed: 58, battery: 82, temp: '20°C', fsdVersion: 'v13.4.2', tripsToday: 24, rating: 4.99 },
      { id: 3, name: 'Cybercab #03 Ghost', status: 'transit', x: 380, y: 360, targetX: 160, targetY: 360, speed: 52, battery: 76, temp: '22°C', fsdVersion: 'v13.4.2', tripsToday: 14, rating: 5.0 },
      { id: 4, name: 'Cybercab #04 Obsidian', status: 'charging', x: 700, y: 140, targetX: 700, targetY: 140, speed: 0, battery: 64, temp: '24°C', fsdVersion: 'v13.4.2', tripsToday: 21, rating: 4.97 },
      { id: 5, name: 'Cybercab #05 Nexus', status: 'available', x: 160, y: 310, targetX: 300, targetY: 420, speed: 41, battery: 98, temp: '20°C', fsdVersion: 'v13.4.2', tripsToday: 9, rating: 4.96 },
      { id: 6, name: 'Cybercab #06 Sol', status: 'transit', x: 620, y: 190, targetX: 480, targetY: 110, speed: 49, battery: 71, temp: '21°C', fsdVersion: 'v13.4.2', tripsToday: 27, rating: 4.99 },
      { id: 7, name: 'Cybercab #07 Phantom', status: 'charging', x: 740, y: 140, targetX: 740, targetY: 140, speed: 0, battery: 52, temp: '25°C', fsdVersion: 'v13.4.2', tripsToday: 19, rating: 4.98 }
    ];

    // City street network waypoints
    this.streets = [
      { x1: 80, y1: 100, x2: 820, y2: 100 },
      { x1: 80, y1: 180, x2: 820, y2: 180 },
      { x1: 80, y1: 280, x2: 820, y2: 280 },
      { x1: 80, y1: 380, x2: 820, y2: 380 },
      { x1: 140, y1: 60, x2: 140, y2: 440 },
      { x1: 300, y1: 60, x2: 300, y2: 440 },
      { x1: 480, y1: 60, x2: 480, y2: 440 },
      { x1: 680, y1: 60, x2: 680, y2: 440 }
    ];

    // Charging Hub zone
    this.chargingPadZone = { x: 660, y: 110, w: 140, h: 70, label: 'INDUCTIVE CHARGING HUB' };

    this.initCanvasSize();
    this.setupEventListeners();
    this.updateInspector(this.cabs[0]);
    this.animate();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 480;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.initCanvasSize());

    this.canvas.addEventListener('mousemove', (e) => {
      const pos = this.getMousePos(e);
      let found = null;
      for (const cab of this.cabs) {
        const dist = Math.hypot(cab.x - pos.x, cab.y - pos.y);
        if (dist < 18) {
          found = cab.id;
          break;
        }
      }
      this.hoveredCabId = found;
      this.canvas.style.cursor = found ? 'pointer' : 'crosshair';
    });

    this.canvas.addEventListener('click', (e) => {
      const pos = this.getMousePos(e);
      for (const cab of this.cabs) {
        const dist = Math.hypot(cab.x - pos.x, cab.y - pos.y);
        if (dist < 20) {
          this.selectedCabId = cab.id;
          this.updateInspector(cab);
          if (window.soundFX) window.soundFX.playClick();
          break;
        }
      }
    });

    // Radar Filter Buttons
    document.querySelectorAll('.radar-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.radar-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.filter = e.currentTarget.dataset.filter;
        if (window.soundFX) window.soundFX.playBeep();
      });
    });

    // Quick dispatch from inspector
    const dispatchBtn = document.getElementById('quickDispatchBtn');
    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', () => {
        const cab = this.cabs.find(c => c.id === this.selectedCabId);
        if (cab) {
          if (cab.status === 'charging') {
            window.showToast('Unit is currently inductive charging. Disconnect scheduled.', 'info');
          } else {
            cab.status = 'transit';
            cab.speed = Math.floor(Math.random() * 20) + 40;
            this.updateInspector(cab);
            window.showToast(`Dispatched ${cab.name} to nearest summon zone.`, 'success');
            if (window.soundFX) window.soundFX.playSuccess();
          }
        }
      });
    }
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  updateInspector(cab) {
    const nameEl = document.getElementById('inspectorCabName');
    const statusEl = document.getElementById('inspectorCabStatus');
    const batteryValEl = document.getElementById('inspectorBatteryVal');
    const batteryFillEl = document.getElementById('inspectorBatteryFill');
    const speedEl = document.getElementById('inspectorSpeedVal');
    const tempEl = document.getElementById('inspectorCabinTemp');
    const fsdEl = document.getElementById('inspectorFsdVersion');
    const ratingEl = document.getElementById('inspectorRatingVal');

    if (nameEl) nameEl.textContent = cab.name;
    if (statusEl) {
      statusEl.textContent = cab.status.toUpperCase();
      statusEl.className = 'inspector-status ' + (cab.status === 'transit' ? 'status-in-transit' : (cab.status === 'charging' ? 'status-charging' : 'status-available'));
    }
    if (batteryValEl) batteryValEl.textContent = `${cab.battery}%`;
    if (batteryFillEl) {
      batteryFillEl.style.width = `${cab.battery}%`;
      batteryFillEl.style.background = cab.battery > 40 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #ef4444)';
    }
    if (speedEl) speedEl.textContent = `${cab.speed} MPH`;
    if (tempEl) tempEl.textContent = cab.temp;
    if (fsdEl) fsdEl.textContent = cab.fsdVersion;
    if (ratingEl) ratingEl.textContent = `★ ${cab.rating} (${cab.tripsToday} rides)`;
  }

  animate() {
    this.updatePositions();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  updatePositions() {
    this.cabs.forEach(cab => {
      if (cab.status === 'charging') {
        // slow trickle charge
        if (Math.random() < 0.02 && cab.battery < 100) {
          cab.battery++;
          if (cab.id === this.selectedCabId) this.updateInspector(cab);
        }
        return;
      }

      // Smooth step towards target waypoint
      const dx = cab.targetX - cab.x;
      const dy = cab.targetY - cab.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 4) {
        // Pick new random street intersection
        const xSpots = [140, 300, 480, 680];
        const ySpots = [100, 180, 280, 380];
        cab.targetX = xSpots[Math.floor(Math.random() * xSpots.length)];
        cab.targetY = ySpots[Math.floor(Math.random() * ySpots.length)];
      } else {
        const step = (cab.speed * 0.025);
        cab.x += (dx / dist) * step;
        cab.y += (dy / dist) * step;
      }
    });
  }

  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // 1. Grid Background
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // 2. City District Zones
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.font = '10px JetBrains Mono, monospace';
    this.ctx.fillText('SECTOR 01 // DOWNTOWN CORE', 90, 80);
    this.ctx.fillText('SECTOR 02 // SKYLINE MARINA', 320, 80);
    this.ctx.fillText('SECTOR 03 // METRO AIRPORT LINK', 500, 80);

    // 3. Charging Depot Area
    const pad = this.chargingPadZone;
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeRect(pad.x, pad.y, pad.w, pad.h);
    this.ctx.setLineDash([]);
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
    this.ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    this.ctx.fillText('⚡ INDUCTIVE PAD GRID', pad.x + 8, pad.y + 20);

    // 4. Street Vectors
    this.streets.forEach(street => {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 14;
      this.ctx.beginPath();
      this.ctx.moveTo(street.x1, street.y1);
      this.ctx.lineTo(street.x2, street.y2);
      this.ctx.stroke();

      // Road Center dash
      this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([6, 8]);
      this.ctx.beginPath();
      this.ctx.moveTo(street.x1, street.y1);
      this.ctx.lineTo(street.x2, street.y2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    });

    // 5. Draw Cybercabs
    const time = Date.now() * 0.003;
    this.cabs.forEach(cab => {
      if (this.filter !== 'all' && cab.status !== this.filter) return;

      const isSelected = cab.id === this.selectedCabId;
      const isHovered = cab.id === this.hoveredCabId;

      // Color coding
      let color = '#10b981'; // available
      if (cab.status === 'transit') color = '#f59e0b';
      if (cab.status === 'charging') color = '#00f0ff';

      // Pulse ring for selected / active
      if (isSelected || isHovered) {
        this.ctx.beginPath();
        this.ctx.arc(cab.x, cab.y, 18 + Math.sin(time * 2) * 3, 0, Math.PI * 2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      // Trajectory vector line
      if (cab.status === 'transit') {
        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        this.ctx.setLineDash([3, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(cab.x, cab.y);
        this.ctx.lineTo(cab.targetX, cab.targetY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // Cybercab Dot Body
      this.ctx.beginPath();
      this.ctx.arc(cab.x, cab.y, 8, 0, Math.PI * 2);
      this.ctx.fillStyle = '#0e111a';
      this.ctx.fill();
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      // Mini indicator center
      this.ctx.beginPath();
      this.ctx.arc(cab.x, cab.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();

      // Cybercab Tag
      this.ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      this.ctx.font = '10px JetBrains Mono, monospace';
      this.ctx.fillText(`C-${cab.id.toString().padStart(2, '0')}`, cab.x + 12, cab.y + 4);
    });
  }
}

window.FleetRadar = FleetRadar;
