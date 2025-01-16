let initialized = false;
let canvas, ctx, width, height;
let oscillators = [];
let rotationX = 0;
let rotationY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;
let animationFrame;

const characteristicDistances = [0.1, 0.3, 0.6, 0.9]; // as fractions of max distance
const ringWidths = [0.05, 0.08, 0.12, 0.15]; // as fractions of max distance

const controlValues = {
  coupling1: 0.0,
  coupling2: 0.0,
  coupling3: 0.0,
  coupling4: -0.1,
  autoRotate: false,
  rotationSpeed: 0.01,
  useProjectedDistance: true,
};

// Export resize handler
export function handleResize(canvasEl, container) {
  if (!container) return;
  
  const rect = container.getBoundingClientRect();
  canvasEl.width = rect.width;
  canvasEl.height = rect.height;
  
  if (initialized) {
    width = canvasEl.width;
    height = canvasEl.height;
  }
}

function ringFunction(distance, center, width) {
  const innerGaussian = Math.exp(-Math.pow(distance - center, 2) / (2 * Math.pow(width * 0.5, 2)));
  const outerGaussian = Math.exp(-Math.pow(distance - center, 2) / (2 * Math.pow(width, 2)));
  return innerGaussian - outerGaussian;
}

function influenceFunction(distance, maxDistance) {
  const couplings = [
    controlValues.coupling1,
    controlValues.coupling2,
    controlValues.coupling3,
    controlValues.coupling4
  ];
  let totalInfluence = 0;

  for (let i = 0; i < couplings.length; i++) {
    const r_i = characteristicDistances[i] * maxDistance;
    const width_i = ringWidths[i] * maxDistance;
    const A_i = -couplings[i];

    totalInfluence += A_i * ringFunction(distance, r_i, width_i);
  }

  return totalInfluence;
}

class Oscillator {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.phase = Math.random() * Math.PI * 2;
    this.frequency = 0.5 + Math.random() * 0.5;
  }

  update(dt, oscillators) {
    const useProjected = controlValues.useProjectedDistance;
    const maxDistance = useProjected ? Math.sqrt(width * width + height * height) : Math.sqrt(48); // √48 for a 4x4x4 lattice
    let couplingTerm = 0;

    for (const other of oscillators) {
      if (other === this) continue;
      let distance;
      if (useProjected) {
        const dx = other.projectedX - this.projectedX;
        const dy = other.projectedY - this.projectedY;
        distance = Math.sqrt(dx * dx + dy * dy);
      } else {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dz = other.z - this.z;
        distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      const phaseDiff = other.phase - this.phase;

      const influence = influenceFunction(distance, maxDistance);
      couplingTerm += influence * Math.sin(phaseDiff);
    }

    this.phase += (this.frequency + couplingTerm) * dt;
    this.phase %= Math.PI * 2;
  }

  project(rotationX, rotationY) {
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    const rotatedX = this.x * cosY - this.z * sinY;
    const rotatedZ = this.x * sinY + this.z * cosY;
    const rotatedY = this.y * cosX - rotatedZ * sinX;

    const scale = 40; // Fixed scale factor
    this.projectedX = width / 2 + rotatedX * scale;
    this.projectedY = height / 2 + rotatedY * scale;
    this.projectedZ = rotatedZ;
  }

  draw() {
    const baseRadius = 5;
    const oscillationAmount = 3;
    const radius = baseRadius + Math.sin(this.phase) * oscillationAmount;
    const hue = (this.phase / (Math.PI * 2)) * 360;
    const depth = (this.projectedZ + 5) / 10; // Normalize depth
    ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${depth})`;
    ctx.beginPath();
    ctx.arc(this.projectedX, this.projectedY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createLattice() {
  const latticeSize = 3;
  const spacing = 1;

  oscillators = [];
  for (let x = -latticeSize; x <= latticeSize; x++) {
    for (let y = -latticeSize; y <= latticeSize; y++) {
      for (let z = -latticeSize; z <= latticeSize; z++) {
        oscillators.push(new Oscillator(x * spacing, y * spacing, z * spacing));
      }
    }
  }
}

function update() {
  ctx.clearRect(0, 0, width, height);

  if (controlValues.autoRotate) {
    const speed = parseFloat(controlValues.rotationSpeed);
    rotationY += speed;
    rotationX += speed * 0.7;
  }

  const dt = 0.05;
  for (const oscillator of oscillators) {
    oscillator.project(rotationX, rotationY);
  }

  // Sort oscillators by z-depth for proper rendering
  oscillators.sort((a, b) => b.projectedZ - a.projectedZ);

  for (const oscillator of oscillators) {
    oscillator.update(dt, oscillators);
    oscillator.draw();
  }

  animationFrame = requestAnimationFrame(update);
}

function setupEventListeners(canvas) {
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      rotationY += deltaX * 0.01;
      rotationX += deltaY * 0.01;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // Listen for control changes
  window.addEventListener("sketch-control-change", (event) => {
    const { id, value } = event.detail;
    if (id in controlValues) {
      controlValues[id] = value;
    }
  });
}

// Export initialize function
export function initialize() {
  if (initialized) return;
  
  canvas = document.getElementById('canvas');
  ctx = canvas?.getContext('2d');
  
  // If canvas isn't ready yet, retry in a bit
  if (!canvas || !ctx) {
    requestAnimationFrame(initialize);
    return;
  }

  width = canvas.width;
  height = canvas.height;

  setupEventListeners(canvas);
  createLattice();
  update();
  
  initialized = true;
}

// Clean up function to stop animation when needed
export function cleanup() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  initialized = false;
} 