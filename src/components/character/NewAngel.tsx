/* eslint-disable react/no-unknown-property */
import React from "react";
import { Asset } from "expo-asset";
import usePromise from "react-promise-suspense";
import { GLTFLoader } from "three-stdlib";
import { useLoader } from "@react-three/fiber/native";

const modelPath = Asset.fromModule(require("@/assets/models/test.glb"));

const getModelPath = async () => {
  await modelPath.downloadAsync();
  return modelPath.localUri || modelPath.uri;
};

export function NewAngel(props: any) {
  const url = usePromise(getModelPath, []);

  const gltf = useLoader(GLTFLoader, url);

  return <primitive object={gltf.scene} />;
}
