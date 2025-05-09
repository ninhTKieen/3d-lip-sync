import { Assistant } from "@/components/character/Assistant";
import { Canvas } from "@react-three/fiber/native";
import { Environment } from "@react-three/drei/native";
import useControls from "r3f-native-orbitcontrols";
import { Suspense } from "react";
import { Button, SafeAreaView, StyleSheet, View } from "react-native";
import { Black } from "@/components/character/Black";

export default function TabTwoScreen() {
  const [OrbitControls, events] = useControls();

  return (
    <SafeAreaView style={styles.container} {...events}>
      <View style={{ flex: 1 }} {...events}>
        <Canvas
          events={null as any}
          onCreated={(state) => {
            const _gl: any = state.gl.getContext();
            const pixelStorei = _gl.pixelStorei.bind(_gl);
            _gl.pixelStorei = function (...args: any[]) {
              const [parameter] = args;
              switch (parameter) {
                case _gl.UNPACK_FLIP_Y_WEBGL:
                  return pixelStorei(...args);
              }
            };
          }}
        >
          <OrbitControls />
          <ambientLight intensity={3} />
          <Suspense>
            <Black scale={4} position={[0, -6, 1]} />
            <Environment preset="apartment" />
          </Suspense>
        </Canvas>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
