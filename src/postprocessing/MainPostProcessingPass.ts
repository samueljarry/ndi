import {
  BlendFunction,
  BloomEffect,
  KernelSize,
  TiltShiftEffect,
} from "postprocessing";

import { CamerasId } from "@/core/three/constants/CamerasId";
import { CamerasManager } from "@/core/three/managers/CamerasManager";
import { ExtendedEffectPass } from "@/core/three/postprocessing/abstracts/ExtendedEffectPass";
import { Pane } from "tweakpane";

export class MainPostProcessingPass extends ExtendedEffectPass {
  private _bloomEffect: BloomEffect;
  private _tiltShiftEffect: TiltShiftEffect;
  private _pane: Pane;

  constructor() {
    const bloomEffect = new BloomEffect({
      luminanceThreshold: 1.2,
      luminanceSmoothing: 0.4,
      intensity: 0.2,
      radius: 0.5,
    });

    const tiltShiftEffect = new TiltShiftEffect({
      blendFunction: BlendFunction.NORMAL,
      offset: 0.09,
      rotation: 3.75,
      focusArea: 1,
      feather: 0.5,
      bias: 0,
      resolutionScale: 1,
      kernelSize: KernelSize.LARGE,
    });

    super(
      CamerasManager.Get(CamerasId.MAP).camera,
      bloomEffect,
      tiltShiftEffect
    );

    this._bloomEffect = bloomEffect;
    this._tiltShiftEffect = tiltShiftEffect;

    // Tweakpane
    // this._pane = new Pane({ title: "Post Processing" });

    // // Tilt Shift folder
    // const tiltShiftFolder = this._pane.addFolder({ title: "Tilt Shift" });
    // tiltShiftFolder.addBinding(this._tiltShiftEffect, "offset", {
    //   min: -1,
    //   max: 1,
    //   step: 0.01,
    // });
    // tiltShiftFolder.addBinding(this._tiltShiftEffect, "rotation", {
    //   min: 0,
    //   max: Math.PI * 2,
    //   step: 0.01,
    // });
    // tiltShiftFolder.addBinding(this._tiltShiftEffect, "focusArea", {
    //   min: 0,
    //   max: 1,
    //   step: 0.01,
    // });
    // tiltShiftFolder.addBinding(this._tiltShiftEffect, "feather", {
    //   min: 0,
    //   max: 1,
    //   step: 0.01,
    // });

    // const tiltShiftParams = {
    //   kernelSize: "LARGE",
    //   blendFunction: "NORMAL",
    // };

    // tiltShiftFolder
    //   .addBinding(tiltShiftParams, "kernelSize", {
    //     options: {
    //       VERY_SMALL: "VERY_SMALL",
    //       SMALL: "SMALL",
    //       MEDIUM: "MEDIUM",
    //       LARGE: "LARGE",
    //       VERY_LARGE: "VERY_LARGE",
    //       HUGE: "HUGE",
    //     },
    //   })
      

    // tiltShiftFolder
    //   .addBinding(tiltShiftParams, "blendFunction", {
    //     options: {
    //       SKIP: "SKIP",
    //       ADD: "ADD",
    //       ALPHA: "ALPHA",
    //       AVERAGE: "AVERAGE",
    //       COLOR_BURN: "COLOR_BURN",
    //       COLOR_DODGE: "COLOR_DODGE",
    //       DARKEN: "DARKEN",
    //       DIFFERENCE: "DIFFERENCE",
    //       EXCLUSION: "EXCLUSION",
    //       LIGHTEN: "LIGHTEN",
    //       MULTIPLY: "MULTIPLY",
    //       DIVIDE: "DIVIDE",
    //       NEGATION: "NEGATION",
    //       NORMAL: "NORMAL",
    //       OVERLAY: "OVERLAY",
    //       REFLECT: "REFLECT",
    //       SCREEN: "SCREEN",
    //       SOFT_LIGHT: "SOFT_LIGHT",
    //       SUBTRACT: "SUBTRACT",
    //     },
    //   })
    //   .on("change", (ev) => {
    //     this._tiltShiftEffect.blendMode.blendFunction =
    //       BlendFunction[ev.value as keyof typeof BlendFunction];
    //   });
  }
}
