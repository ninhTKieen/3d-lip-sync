/* eslint-disable react/no-unknown-property */
import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { Asset } from "expo-asset";
import React, { useEffect, useMemo, useRef } from "react";
import usePromise from "react-promise-suspense";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { vanguardNormal, vanguardDiffuse } from "@/assets/models/char_texture";

type GLTFResult = GLTF & {
  nodes: {
    vanguard_Mesh: THREE.SkinnedMesh;
    vanguard_visor: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    VanguardBodyMat: THREE.MeshPhysicalMaterial;
    Vanguard_VisorMat: THREE.MeshPhysicalMaterial;
  };
};

const getUrl = async () => {
  const asset = Asset.fromModule(require("@/assets/models/Character.glb"));
  await asset.downloadAsync();

  return asset.localUri || asset.uri;
};

export function Character(props: React.JSX.IntrinsicElements["group"]) {
  const url = usePromise(getUrl, []);

  const ActionName = "Armature|mixamo.com|Layer0";
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF(
    url
  ) as unknown as GLTFResult;
  const { actions } = useAnimations(animations, group);

  const normalMap = useTexture(vanguardNormal);
  const diffuseMap = useTexture(vanguardDiffuse);

  const bodyMaterial = useMemo(() => {
    const material = materials.VanguardBodyMat.clone();
    material.map = diffuseMap as any;
    material.normalMap = normalMap as any;
    // material.emissiveMap = diffuseMap as any;

    return material;
  }, [materials.VanguardBodyMat, diffuseMap, normalMap]);

  useEffect(() => {
    actions[ActionName]?.play();
  }, [actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group
          name="Armature"
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.02}
          position={[0, -1.5, 0]}
        >
          <skinnedMesh
            name="vanguard_Mesh"
            geometry={nodes.vanguard_Mesh.geometry}
            material={bodyMaterial}
            skeleton={nodes.vanguard_Mesh.skeleton}
          />
          <skinnedMesh
            name="vanguard_visor"
            geometry={nodes.vanguard_visor.geometry}
            material={bodyMaterial}
            skeleton={nodes.vanguard_visor.skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}
// useGLTF.preload(modelAsset.localUri || modelAsset.uri);
