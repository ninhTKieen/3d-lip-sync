/* eslint-disable react/no-unknown-property */
import React, { useMemo } from "react";
import { useGLTF, PerspectiveCamera, useTexture } from "@react-three/drei";
import { Asset } from "expo-asset";
import usePromise from "react-promise-suspense";
import { GLTF } from "three-stdlib";
import * as THREE from "three";
import texturePath from "@/assets/models/duck_texture/Texture.png";

const getUrl = async () => {
  const asset = await Asset.fromModule(require("@/assets/models/Duck.glb"));
  await asset.downloadAsync();

  return asset.localUri || asset.uri;
};

type GLTFResult = GLTF & {
  nodes: {
    LOD3spShape: THREE.Mesh;
  };
  materials: {
    ["blinn3-fx"]: THREE.MeshStandardMaterial;
  };
};

export function Duck(props: React.JSX.IntrinsicElements["group"]) {
  const url = usePromise(getUrl, []);
  const { nodes, materials } = useGLTF(url) as unknown as GLTFResult;

  const texture = useTexture(texturePath, (tex) => {
    if (Array.isArray(tex)) {
      throw new Error("Array of textures is not supported");
    }
    tex.flipY = false;
    tex.unpackAlignment = 8;
  });

  //   replace the material with the texture
  const duckMaterial = useMemo(() => {
    let material = materials["blinn3-fx"].clone();

    material.map = texture as any;
    material.emissiveMap = texture as any;

    return material;
  }, [materials, texture]);

  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.LOD3spShape.geometry}
          material={materials["blinn3-fx"]}
        />
        <PerspectiveCamera
          makeDefault={false}
          far={10000}
          near={1}
          fov={37.849}
          position={[400.113, 463.264, -431.078]}
          rotation={[-2.314, 0.566, 2.614]}
        />
      </group>
    </group>
  );
}
