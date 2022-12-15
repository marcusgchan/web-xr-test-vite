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

function PlayerController({
  translationSpeed = 2,
  rotationSpeed = 2,
}: {
  translationSpeed?: number;
  rotationSpeed?: number;
}): null {
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

  const arrowRef = useRef<THREE.ArrowHelper>();

  const yBasisVector = new THREE.Vector3(0, 1, 0);
  const zeroVector = new THREE.Vector3(0, 0, 0);

  useFrame(({ gl, scene, camera, controls, viewport, internal }, delta) => {
    if (!session) return null;

    // In the future make player body turn when the camera reaches a certain threshold

    const cameraWorldDireciton = camera
      .getWorldDirection(new THREE.Vector3(0, 0, 0))
      .normalize();

    // Player rotation
    const rightControllerGamepad = rightController?.inputSource.gamepad;
    if (rightControllerGamepad) {
      if (rightControllerGamepad.axes[2]) {
        player.rotateY(delta * rotationSpeed * -rightControllerGamepad.axes[2]);
      }
    }

    // Player translation
    const leftControllerGamepad = leftController?.inputSource.gamepad;
    if (leftControllerGamepad) {
      if (leftControllerGamepad.axes[2]) {
        const translationDx =
          delta * translationSpeed * leftControllerGamepad.axes[2];
        player.position.add(
          new THREE.Vector3(
            cameraWorldDireciton.cross(yBasisVector).x,
            0,
            cameraWorldDireciton.cross(yBasisVector).z
          ).multiplyScalar(translationDx)
        );
      }
      if (leftControllerGamepad.axes[3]) {
        const translationDz =
          delta * translationSpeed * leftControllerGamepad.axes[3];
        player.position.add(
          new THREE.Vector3(
            -cameraWorldDireciton.x,
            0,
            -cameraWorldDireciton.z
          ).multiplyScalar(translationDz)
        );
      }
    }

    // Laser foar testing
    if (arrowRef.current) scene.remove(arrowRef.current);
    arrowRef.current = new THREE.ArrowHelper(
      camera.getWorldDirection(zeroVector),
      camera.getWorldPosition(zeroVector),
      100,
      Math.random() * 0xffffff
    );
    scene.add(arrowRef.current);
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
