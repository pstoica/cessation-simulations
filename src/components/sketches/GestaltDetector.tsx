import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { debounce } from "lodash-es";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface GestaltDetectorProps {
  values: {
    angleX: number;
    angleY: number;
    angleZ: number;
    scale: number;
    nearMissDepth: number;
  };
  onValuesChange: (values: Partial<GestaltDetectorProps["values"]>) => void;
}

interface Shape {
  type: "triangle" | "square";
  points: Point3D[];
  size: number;
  tolerance: number;
  is2D: boolean;
}

function PointCloud({ points, scale }: { points: Point3D[]; scale: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, i) => {
      positions[i * 3] = point.x * scale;
      positions[i * 3 + 1] = point.y * scale;
      positions[i * 3 + 2] = point.z * scale;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [points, scale]);

  return (
    <points ref={pointsRef}>
      <pointsMaterial size={4} color="white" sizeAttenuation={false} />
      <primitive object={geometry} />
    </points>
  );
}

function distance(p1: Point3D, p2: Point3D) {
  return Math.sqrt(
    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2
  );
}

function distance2D(p1: Point3D, p2: Point3D) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function checkTriangle(
  p1: Point3D,
  p2: Point3D,
  p3: Point3D,
  maxTolerance: number
): Shape | null {
  const sides = [distance2D(p1, p2), distance2D(p2, p3), distance2D(p3, p1)];

  const avgSide = (sides[0] + sides[1] + sides[2]) / 3;
  const maxDiff = Math.max(...sides.map((side) => Math.abs(side - avgSide)));
  const tolerance = maxDiff / avgSide;

  if (tolerance <= maxTolerance) {
    return {
      type: "triangle",
      points: [p1, p2, p3],
      size: avgSide,
      tolerance,
      is2D:
        Math.abs(p1.z - p2.z) < 0.1 &&
        Math.abs(p2.z - p3.z) < 0.1 &&
        Math.abs(p3.z - p1.z) < 0.1,
    };
  }
  return null;
}

function checkSquare(
  p1: Point3D,
  p2: Point3D,
  p3: Point3D,
  p4: Point3D,
  maxTolerance: number
): Shape | null {
  const sides = [
    distance2D(p1, p2),
    distance2D(p2, p3),
    distance2D(p3, p4),
    distance2D(p4, p1),
  ];

  const diagonals = [distance2D(p1, p3), distance2D(p2, p4)];

  const avgSide = sides.reduce((a, b) => a + b) / 4;
  const maxSideDiff = Math.max(
    ...sides.map((side) => Math.abs(side - avgSide))
  );
  const diagDiff = Math.abs(diagonals[0] - diagonals[1]);

  const tolerance = Math.max(maxSideDiff / avgSide, diagDiff / diagonals[0]);

  if (tolerance <= maxTolerance) {
    return {
      type: "square",
      points: [p1, p2, p3, p4],
      size: avgSide,
      tolerance,
      is2D:
        Math.abs(p1.z - p2.z) < 0.1 &&
        Math.abs(p2.z - p3.z) < 0.1 &&
        Math.abs(p3.z - p4.z) < 0.1 &&
        Math.abs(p4.z - p1.z) < 0.1,
    };
  }
  return null;
}

function ShapeHighlights({
  points,
  nearMissDepth,
  scale,
}: {
  points: Point3D[];
  nearMissDepth: number;
  scale: number;
}) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const detectShapesRef = useRef<number>(0);

  useEffect(() => {
    const currentDetection = ++detectShapesRef.current;

    const detectShapes = () => {
      if (currentDetection !== detectShapesRef.current) return;

      const newShapes: Shape[] = [];
      const processed = new Set<string>();
      const MAX_SHAPES = 2000;

      // Simple O(n^4) approach but with early termination
      for (let i = 0; i < points.length && newShapes.length < MAX_SHAPES; i++) {
        for (
          let j = i + 1;
          j < points.length && newShapes.length < MAX_SHAPES;
          j++
        ) {
          // Early distance check
          const d1 = distance(points[i], points[j]);
          if (d1 > 200) continue; // Skip if points are too far apart

          for (
            let k = j + 1;
            k < points.length && newShapes.length < MAX_SHAPES;
            k++
          ) {
            // Early distance check
            const d2 = distance(points[j], points[k]);
            const d3 = distance(points[k], points[i]);
            if (d2 > 200 || d3 > 200) continue;

            const triangleKey = [i, j, k].sort().join(",");
            if (!processed.has(triangleKey)) {
              processed.add(triangleKey);
              const triangle = checkTriangle(
                points[i],
                points[j],
                points[k],
                nearMissDepth
              );
              if (triangle) {
                newShapes.push(triangle);
              }
            }

            for (
              let l = k + 1;
              l < points.length && newShapes.length < MAX_SHAPES;
              l++
            ) {
              // Early distance check for the fourth point
              const d4 = distance(points[l], points[k]);
              const d5 = distance(points[l], points[j]);
              const d6 = distance(points[l], points[i]);
              if (d4 > 200 || d5 > 200 || d6 > 200) continue;

              const squareKey = [i, j, k, l].sort().join(",");
              if (!processed.has(squareKey)) {
                processed.add(squareKey);
                const square = checkSquare(
                  points[i],
                  points[j],
                  points[k],
                  points[l],
                  nearMissDepth
                );
                if (square) {
                  newShapes.push(square);
                }
              }
            }
          }
        }
      }

      // Sort shapes so 2D shapes render on top
      newShapes.sort((a, b) => (a.is2D === b.is2D ? 0 : a.is2D ? 1 : -1));

      if (currentDetection === detectShapesRef.current) {
        setShapes(newShapes);
      }
    };

    const frame = requestAnimationFrame(detectShapes);
    return () => {
      cancelAnimationFrame(frame);
      detectShapesRef.current++;
    };
  }, [points, nearMissDepth]);

  // Optimize geometry creation
  const geometries = useMemo(() => {
    return shapes.map((shape) => {
      const vertices = shape.points.map(
        (p) => new THREE.Vector3(p.x, p.y, p.z)
      );

      // Line geometry
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setFromPoints([...vertices, vertices[0]]);

      // Face geometry - use indexed triangles for better performance
      const faceGeo = new THREE.BufferGeometry();
      faceGeo.setFromPoints(vertices);

      // Add a small offset to prevent z-fighting
      const normal = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(vertices[1], vertices[0]),
          new THREE.Vector3().subVectors(vertices[2], vertices[0])
        )
        .normalize();

      vertices.forEach((v) => v.add(normal.multiplyScalar(0.1)));

      if (shape.type === "triangle") {
        faceGeo.setIndex([0, 1, 2]);
      } else {
        faceGeo.setIndex([0, 1, 2, 0, 2, 3]);
      }

      return { lineGeo, faceGeo };
    });
  }, [shapes]);

  return (
    <group scale={scale}>
      {shapes.map((shape, i) => {
        const hue = shape.type === "triangle" ? 120 : 240; // Green for triangles, Blue for squares
        const saturation = 100 - (shape.tolerance / nearMissDepth) * 100; // Decrease saturation for near misses
        const lightness = shape.is2D ? 50 : 25; // Brighter for 2D shapes
        const alpha = 1 - shape.tolerance / nearMissDepth; // More transparent for near misses

        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        return (
          <group key={i}>
            <line geometry={geometries[i].lineGeo}>
              <lineBasicMaterial
                color={color}
                opacity={alpha}
                transparent
                linewidth={2}
                depthWrite={false}
              />
            </line>
            <mesh geometry={geometries[i].faceGeo}>
              <meshBasicMaterial
                color={color}
                opacity={alpha * 0.2}
                transparent
                side={THREE.DoubleSide}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={shape.is2D ? -i - 1000 : -i}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Scene({
  groupRef,
  values,
}: {
  groupRef: React.RefObject<THREE.Group>;
  values: GestaltDetectorProps["values"];
}) {
  const points = useMemo(() => {
    const latticePoints: Point3D[] = [];
    const spacing = 50;
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          latticePoints.push({
            x: x * spacing,
            y: y * spacing,
            z: z * spacing,
          });
        }
      }
    }
    return latticePoints;
  }, []);

  return (
    <group ref={groupRef}>
      <group scale={values.scale}>
        <PointCloud points={points} scale={1} />
        <ShapeHighlights
          points={points}
          nearMissDepth={values.nearMissDepth}
          scale={1}
        />
      </group>
    </group>
  );
}

export function GestaltDetector({
  values,
  onValuesChange,
}: GestaltDetectorProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Handle slider changes
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = (values.angleX * Math.PI) / 180;
    groupRef.current.rotation.y = (values.angleY * Math.PI) / 180;
    groupRef.current.rotation.z = (values.angleZ * Math.PI) / 180;
  }, [values.angleX, values.angleY, values.angleZ]);

  return (
    <Canvas camera={{ position: [200, 200, 200], fov: 50 }}>
      <color attach="background" args={["#000000"]} />
      <OrbitControls enableDamping={true} dampingFactor={0.05} />
      <Scene groupRef={groupRef} values={values} />
    </Canvas>
  );
}
