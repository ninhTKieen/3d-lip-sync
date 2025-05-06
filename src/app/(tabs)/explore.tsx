import { Asset } from "expo-asset";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { StyleSheet, View } from "react-native";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const modelAsset = Asset.fromModule(require("@/assets/models/test.glb"));

const scene = new THREE.Scene();

export default function TabTwoScreen() {
  // const requestRef = useRef<number>(0);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    await modelAsset.downloadAsync();
    const loader = new GLTFLoader();
    const glbScene = await new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        modelAsset.localUri || modelAsset.uri,
        (gltf) => {
          // Traverse and configure materials
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const material = mesh.material as THREE.Material;
                material.side = THREE.FrontSide;
                material.needsUpdate = true;
              }
            }
          });
          resolve(gltf.scene);
        },
        undefined,
        reject
      );
    });

    scene.add(glbScene);

    // Animation loop
    const animate = () => {
      // requestRef.current = requestAnimationFrame(animate);
      glbScene.rotation.y += 0.01;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };
  return (
    <View style={styles.container}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
