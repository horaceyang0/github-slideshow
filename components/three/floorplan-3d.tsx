"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FloorPlanState, Wall } from "@/types/floor";

const WallMesh = ({ wall }: { wall: Wall }) => {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const midX = (wall.start.x + wall.end.x) / 2;
  const midY = (wall.start.y + wall.end.y) / 2;

  return (
    <mesh position={[midX, wall.height / 2, midY]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, wall.height, wall.thickness]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
  );
};

export const FloorPlan3D = ({ state }: { state: FloorPlanState }) => {
  return (
    <Canvas camera={{ position: [6, 6, 6], fov: 50 }} className="rounded-2xl bg-white">
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow />
      <OrbitControls enableDamping target={[0, 1, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {state.walls.map((wall) => (
        <WallMesh key={wall.id} wall={wall} />
      ))}
    </Canvas>
  );
};
