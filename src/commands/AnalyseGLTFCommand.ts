import { Object3DId } from "@/constants/Object3DId";
import type { AssetsId } from "@/core/commons/constants/AssetsId";
import type { GLB } from "@/core/three/loaders/GLBLoader";
import { ThreeAssetsManager } from "@/core/three/managers/ThreeAssetsManager";
import { Object3DProxy } from "@/proxies/Object3DProxy";

export class AnalyseGLTFCommand {
  public static Analyse(glbId: AssetsId): void {
    const glb = ThreeAssetsManager.GetModel(glbId);

    // this._AnalyseAnimations(glb);
    this._AnalyseScene(glb);
  }

  // private static _AnalyseAnimations(glb: GLB): void {
  //   const animationsId = Object.values(ThreeAnimationsId);

  //   for (const animationClip of glb.animations) {
  //     for (const id of animationsId) {
  //       if (id === animationClip.name) {
  //         ThreeAnimationsProxy.SetAnimationClip(
  //           id as unknown as ThreeAnimationsId,
  //           animationClip
  //         );
  //       }
  //     }
  //   }
  // }

  private static _AnalyseScene(glb: GLB): void {
    glb.scene.traverse((child) => {
      console.log(child.name)
      for (const id of Object.values(Object3DId)) {
        if (!child.isObject3D) continue;
        if (child.name === id) {
          Object3DProxy.SetObject3D(id, child);
        }
      }
    });
  }
}
