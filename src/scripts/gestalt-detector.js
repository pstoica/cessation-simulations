class Lattice {
    constructor() {
        this.points = [];
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                for (let z = -2; z <= 2; z++) {
                    this.points.push({x: x * 50, y: y * 50, z: z * 50});
                }
            }
        }
    }

    rotatePoint(point, angleX, angleY, angleZ) {
        let {x, y, z} = point;
        
        // Rotation around X-axis
        let tempY = y * Math.cos(angleX) - z * Math.sin(angleX);
        let tempZ = z * Math.cos(angleX) + y * Math.sin(angleX);
        y = tempY;
        z = tempZ;

        // Rotation around Y-axis
        let tempX = x * Math.cos(angleY) - z * Math.sin(angleY);
        tempZ = z * Math.cos(angleY) + x * Math.sin(angleY);
        x = tempX;
        z = tempZ;

        // Rotation around Z-axis
        tempX = x * Math.cos(angleZ) - y * Math.sin(angleZ);
        tempY = y * Math.cos(angleZ) + x * Math.sin(angleZ);
        x = tempX;
        y = tempY;

        return {x, y, z};
    }
}

function project(point, scale) {
    return {
        x: point.x * scale,
        y: point.y * scale,
        z: point.z * scale
    };
}

function detectShapes(points, maxTolerance) {
    let shapes = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            for (let k = j + 1; k < points.length; k++) {
                let triangle = checkTriangle(points[i], points[j], points[k], maxTolerance);
                if (triangle) shapes.push(triangle);
                
                for (let l = k + 1; l < points.length; l++) {
                    let square = checkSquare(points[i], points[j], points[k], points[l], maxTolerance);
                    if (square) shapes.push(square);
                }
            }
        }
    }
    return shapes;
}

function checkTriangle(p1, p2, p3, maxTolerance) {
    let sides = [
        distance2D(p1, p2),
        distance2D(p2, p3),
        distance2D(p3, p1)
    ];

    let avgSide = (sides[0] + sides[1] + sides[2]) / 3;
    let maxDiff = Math.max(...sides.map(side => Math.abs(side - avgSide)));
    let tolerance = maxDiff / avgSide;

    if (tolerance <= maxTolerance) {
        return {
            type: 'triangle',
            points: [p1, p2, p3],
            size: avgSide,
            tolerance: tolerance,
            is2D: Math.abs(p1.z - p2.z) < 0.1 && Math.abs(p2.z - p3.z) < 0.1 && Math.abs(p3.z - p1.z) < 0.1
        };
    }
    return null;
}

function checkSquare(p1, p2, p3, p4, maxTolerance) {
    let sides = [
        distance2D(p1, p2),
        distance2D(p2, p3),
        distance2D(p3, p4),
        distance2D(p4, p1)
    ];

    let diagonals = [
        distance2D(p1, p3),
        distance2D(p2, p4)
    ];

    let avgSide = sides.reduce((a, b) => a + b) / 4;
    let maxSideDiff = Math.max(...sides.map(side => Math.abs(side - avgSide)));
    let diagDiff = Math.abs(diagonals[0] - diagonals[1]);

    let tolerance = Math.max(maxSideDiff / avgSide, diagDiff / diagonals[0]);

    if (tolerance <= maxTolerance) {
        return {
            type: 'square',
            points: [p1, p2, p3, p4],
            size: avgSide,
            tolerance: tolerance,
            is2D: Math.abs(p1.z - p2.z) < 0.1 && Math.abs(p2.z - p3.z) < 0.1 &&
                  Math.abs(p3.z - p4.z) < 0.1 && Math.abs(p4.z - p1.z) < 0.1
        };
    }
    return null;
}

function distance2D(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let lattice = new Lattice();
let scale = 1;

// Store current values with proper initialization
const values = {
    angleX: 0,
    angleY: 0,
    angleZ: 0,
    scale: 1.0,
    nearMissDepth: 0.2,
    get: function(id) {
        return Number(this[id] || 0);
    }
};

// Function to emit value update
function emitValueUpdate(id, value) {
    window.dispatchEvent(new CustomEvent('sketch-value-update', {
        detail: { id, value }
    }));
}

// Emit initial values to React
Object.entries(values).forEach(([id, value]) => {
    if (id !== 'get') {  // Skip the getter function
        emitValueUpdate(id, value);
    }
});

// Listen for control changes from React
window.addEventListener("sketch-control-change", (event) => {
    const { id, value } = event.detail;
    if (id in values && id !== 'get') {
        values[id] = Number(value);
        // Echo back the validated value
        emitValueUpdate(id, values[id]);
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use the getter to ensure we always have numbers
    let angleX = values.get('angleX') * Math.PI / 180;
    let angleY = values.get('angleY') * Math.PI / 180;
    let angleZ = values.get('angleZ') * Math.PI / 180;
    scale = values.get('scale');
    let nearMissDepth = values.get('nearMissDepth');

    let rotatedPoints = lattice.points.map(p => lattice.rotatePoint(p, angleX, angleY, angleZ));
    let projectedPoints = rotatedPoints.map(p => project(p, scale));

    // Draw points
    ctx.fillStyle = 'white';
    for (let point of projectedPoints) {
        ctx.beginPath();
        ctx.arc(point.x + canvas.width / 2, point.y + canvas.height / 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw shapes
    let shapes = detectShapes(projectedPoints, nearMissDepth);
    for (let shape of shapes) {
        let hue = shape.type === 'triangle' ? 120 : 240;
        let saturation = 100 - (shape.tolerance / nearMissDepth) * 100;
        let lightness = shape.is2D ? 50 : 25;
        let alpha = 1 - (shape.tolerance / nearMissDepth);

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(shape.points[0].x + canvas.width / 2, shape.points[0].y + canvas.height / 2);
        for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x + canvas.width / 2, shape.points[i].y + canvas.height / 2);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.2})`;
        ctx.fill();
    }

    requestAnimationFrame(animate);
}

animate(); 