import { AssetsId } from "@/core/commons/constants/AssetsId";
import { SceneId } from "@/core/commons/constants/scenes/SceneId";
import { SceneLayer } from "@/core/commons/constants/scenes/SceneLayer";
import { ViewId } from "@/core/commons/constants/views/ViewId";
import { CamerasId } from "@/core/three/constants/CamerasId";
import { PassId } from "@/core/three/postprocessing/constants/PassId";
import { PostProcessingManager } from "@/core/three/postprocessing/managers/PostProcessingManager";
import { ThreeScene } from "@/core/three/scenes/ThreeScene";
import { Three } from "@/core/three/Three";
import { Color, Fog } from "three";
import { Pane } from "tweakpane";

export class DemoScene extends ThreeScene {
  private _fog: Fog;
  private _pane: Pane;

  constructor() {
    super(SceneId.DEFAULT, SceneLayer.MAIN, {
      hdr: AssetsId.HDR_SKY,
      camera: CamerasId.MAP,
    });

    this._fog = new Fog(new Color(0x6f6f6f).convertLinearToSRGB(), 10, 100);
    Three.Scene.fog = this._fog;

    // Tweakpane
    this._pane = new Pane({ title: "Fog Settings" });

    const fogParams = {
      color: { r: 1, g: 1, b: 1 },
      near: 17,
      far: 80,
      enabled: true,
    };

    this._pane.addBinding(fogParams, "enabled").on("change", (ev) => {
      if (ev.value) {
        Three.Scene.fog = this._fog;
      } else {
        Three.Scene.fog = null;
      }
    });

    this._pane
      .addBinding(fogParams, "color", {
        color: { type: "float" },
      })
      .on("change", (ev) => {
        this._fog.color.setRGB(ev.value.r, ev.value.g, ev.value.b);
      });

    this._pane
      .addBinding(fogParams, "near", {
        min: 0,
        max: 200,
        step: 1,
      })
      .on("change", (ev) => {
        this._fog.near = ev.value;
      });

    this._pane
      .addBinding(fogParams, "far", {
        min: 0,
        max: 500,
        step: 1,
      })
      .on("change", (ev) => {
        this._fog.far = ev.value;
      });

    // this._views.add(ViewId.DIALOG_MODAL);
    this._views.add(ViewId.MAP);
    this._views.add(ViewId.HOUSE_DISPLAY);
    this._linkedViews.add(ViewId.HOUSE_DIALOG);
    
    this._views.add(ViewId.FORGERON_GAME)
    this._linkedViews.add(ViewId.SCIENTIFIQUE_GAME)
    this._linkedViews.add(ViewId.STRATEGE_GAME)
    this._linkedViews.add(ViewId.JARDINIER_GAME)
    this._linkedViews.add(ViewId.MECANO_GAME)
  }

  public override init(): void {
    super.init();
    PostProcessingManager.AddPass(PassId.MAIN);
  }
}
