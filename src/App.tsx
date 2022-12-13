import { useRef, useState } from "react";
import "./App.css";
import { Canvas, MeshProps } from "@react-three/fiber";
import {
  Controllers,
  Hands,
  useController,
  useXR,
  VRButton,
  XR,
} from "@react-three/xr";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function App() {
  const model = useGLTF("./Fox.gltf");
  const schoolModel = useGLTF("./classroom.gltf");

  return (
    <div className="App">
      <main className="h-full">
        <VRButton />
        <Canvas shadows gl={{ antialias: true }} linear>
          <XR>
            <Controllers />
            <Hands />
            <PlayerController />
            <LightBulb />
            {/* <group position={[0, 0, -5]}>
            <mesh scale={[4, 6, 1]}>
              <boxGeometry />
              <meshBasicMaterial color="grey" />
            </mesh>

            <Interactive
              onSelect={(e) => {
                console.log("clicked");
              }}
              onHover={(e) => {
                setColor("green");
                console.log("hover");
              }}
              onBlur={() => {
                setColor("red");
              }}
            >
              <mesh position={[0, 0, 1]} scale={[1, 1, 1]}>
                <Text
                  scale={[0.5, 0.5, 0.5]}
                  position={[0, 0, 1]}
                  fontSize={0.2}
                  color={color}
                  anchorX="center"
                  anchorY="middle"
                >
                  test tesxt
                </Text>
                <boxGeometry />
                <meshBasicMaterial color="blue" />
              </mesh>
            </Interactive>
          </group> */}
            <primitive
              scale={1}
              object={schoolModel.scene}
              position={[0, 0, 3]}
            />
            <primitive
              object={model.scene}
              scale={0.02}
              position={[-2.5, 0, -2.5]}
              rotation-y={0.3}
            />
            {/* <ambientLight color={"white"} intensity={0.3} /> */}
            <color attach="background" args={["#818cf8"]} />
          </XR>
        </Canvas>
      </main>
    </div>
  );
}

function PlayerController(): null {
  const {
    // An array of connected `XRController`
    controllers,
    // Whether the XR device is presenting in an XR session
    isPresenting,
    // Whether hand tracking inputs are active
    isHandTracking,
    // A THREE.Group representing the XR viewer or player
    player,
    // The active `XRSession`
    session,
    // `XRSession` foveation. This can be configured as `foveation` on <XR>. Default is `0`
    foveation,
    // `XRSession` reference-space type. This can be configured as `referenceSpace` on <XR>. Default is `local-floor`
    referenceSpace,
  } = useXR();

  const leftController = useController("left");
  const rightController = useController("right");

  const arrowRef = useRef<any>();

  const SPEED = 2;

  useFrame(({ gl, scene, camera, controls, viewport, internal }, delta) => {
    let dx = 0;
    let dz = 0;

    if (session) {
      for (const source of session.inputSources) {
        const gamepad = source.gamepad;
        if (gamepad) {
          if (gamepad.axes[2]) {
            dx = delta * SPEED * gamepad.axes[2];
          }
          if (gamepad.axes[3]) {
            dz = delta * SPEED * gamepad.axes[3];
          }
        }
      }
    }
    const vector = new THREE.Vector3(0, 0, 0);

    scene.remove(arrowRef.current);
    arrowRef.current = new THREE.ArrowHelper(
      camera.getWorldDirection(new THREE.Vector3()),
      camera.getWorldPosition(new THREE.Vector3()),
      100,
      Math.random() * 0xffffff
    );
    scene.add(arrowRef.current);

    if (dz) {
      player.translateOnAxis(
        new THREE.Vector3(
          -camera.getWorldDirection(vector).x,
          0,
          -camera.getWorldDirection(vector).z
        ),
        dz
      );
    }

    if (dx) {
      player.translateOnAxis(
        new THREE.Vector3(
          camera.getWorldDirection(vector).cross(new THREE.Vector3(0, 1, 0)).x,
          0,
          camera.getWorldDirection(vector).cross(new THREE.Vector3(0, 1, 0)).z
        ),
        dx
      );
    }
  });
  return null;
}

function LightBulb(props: MeshProps) {
  return (
    <mesh {...props}>
      <pointLight castShadow />
      <sphereGeometry args={[0.2, 30, 10]} />
      <meshPhongMaterial emissive={"yellow"} />
    </mesh>
  );
}

export default App;
