/* eslint-disable react/no-unknown-property */
import lipsyncJson from "@/assets/viseme/pizza_paper.json";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei/native";
import { useFrame } from "@react-three/fiber";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    EyeLeft: THREE.SkinnedMesh;
    EyeRight: THREE.SkinnedMesh;
    Wolf3D_Head: THREE.SkinnedMesh;
    Wolf3D_Teeth: THREE.SkinnedMesh;
    Wolf3D_Body: THREE.SkinnedMesh;
    Wolf3D_Outfit_Bottom: THREE.SkinnedMesh;
    Wolf3D_Outfit_Footwear: THREE.SkinnedMesh;
    Wolf3D_Outfit_Top: THREE.SkinnedMesh;
    Hips: THREE.Bone;
  };
  materials: {
    Wolf3D_Eye: THREE.MeshStandardMaterial;
    Wolf3D_Skin: THREE.MeshStandardMaterial;
    Wolf3D_Teeth: THREE.MeshStandardMaterial;
    Wolf3D_Body: THREE.MeshStandardMaterial;
    Wolf3D_Outfit_Bottom: THREE.MeshStandardMaterial;
    Wolf3D_Outfit_Footwear: THREE.MeshStandardMaterial;
    Wolf3D_Outfit_Top: THREE.MeshStandardMaterial;
  };
};

const VISEME_MAP = new Map([
  ["A", "viseme_PP"],
  ["B", "viseme_kk"],
  ["C", "viseme_I"],
  ["D", "viseme_AA"],
  ["E", "viseme_O"],
  ["F", "viseme_U"],
  ["G", "viseme_FF"],
  ["H", "viseme_TH"],
  ["X", "viseme_sil"],
]);

export function Black(props: JSX.IntrinsicElements["group"]) {
  const [animation, setAnimation] = useState<
    "angry" | "greeting" | "idle" | "talking"
  >("talking");
  const [audio, setAudio] = useState<Audio.Sound | null>(null);

  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.SkinnedMesh>(null);
  const isPlaying = useRef(false);

  const { nodes, materials } = useGLTF(
    require("@/assets/models/black.glb")
  ) as GLTFResult;

  const { animations: angryAnim } = useFBX(
    require("@/assets/models/animations/black/angry.fbx")
  );
  const { animations: greetingAnim } = useFBX(
    require("@/assets/models/animations/black/greeting.fbx")
  );
  const { animations: idleAnim } = useFBX(
    require("@/assets/models/animations/black/idle.fbx")
  );
  const { animations: talkingAnim } = useFBX(
    require("@/assets/models/animations/black/talking.fbx")
  );

  angryAnim[0].name = "angry";
  greetingAnim[0].name = "greeting";
  idleAnim[0].name = "idle";
  talkingAnim[0].name = "talking";
  const { actions } = useAnimations(
    [angryAnim[0], greetingAnim[0], idleAnim[0], talkingAnim[0]],
    group
  );

  const stopSound = useCallback(async () => {
    if (audio) {
      await audio.stopAsync();
      setAudio(null);
    }
  }, [audio]);

  const playSound = useCallback(async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/audios/pizza_paper.mp3")
      );
      setAudio(sound);

      await sound.playAsync();
      isPlaying.current = true;
      setAnimation("talking");
    } catch (error) {
      console.log(error);
    }
  }, [stopSound]);

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.5).play();

    return () => {
      actions[animation]?.fadeOut(0.5);
    };
  }, [actions, animation]);

  useEffect(() => {
    if (!isPlaying.current) {
      playSound();
    }
  }, [isPlaying.current]);

  useFrame(() => {
    const handleMouthCue = async () => {
      if (audio) {
        const status = await audio.getStatusAsync();
        if (status.isLoaded && status.isPlaying && status.durationMillis) {
          const currentTime = status.positionMillis / 1000;
          const mouthCues = lipsyncJson.mouthCues;
          const mouthCue = mouthCues.find(
            (cue) => cue.start <= currentTime && cue.end >= currentTime
          );
          if (
            nodes.Wolf3D_Head?.morphTargetDictionary &&
            nodes.Wolf3D_Head?.morphTargetInfluences &&
            headRef.current
          ) {
            const index =
              nodes.Wolf3D_Head.morphTargetDictionary[
                VISEME_MAP.get(mouthCue?.value || "") || ""
              ];
            if (index !== undefined) {
              const influences = new Array(
                Object.keys(nodes.Wolf3D_Head.morphTargetDictionary).length
              ).fill(0);
              influences[index] = 1;
              nodes.Wolf3D_Head.morphTargetInfluences = influences;
              headRef.current.morphTargetInfluences = influences;
              headRef.current.geometry.attributes.position.needsUpdate = true;
            }
          }
        } else {
          setAnimation("idle");
        }
      }
    };

    handleMouthCue();
  });

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        ref={headRef}
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        userData={{
          targetNames: [
            "viseme_sil",
            "viseme_PP",
            "viseme_FF",
            "viseme_TH",
            "viseme_DD",
            "viseme_kk",
            "viseme_CH",
            "viseme_SS",
            "viseme_nn",
            "viseme_RR",
            "viseme_aa",
            "viseme_E",
            "viseme_I",
            "viseme_O",
            "viseme_U",
          ],
          name: "Wolf3D_Head",
        }}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

useGLTF.preload(require("@/assets/models/black.glb"));
