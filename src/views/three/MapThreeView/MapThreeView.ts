import { ViewId } from "@/core/commons/constants/views/ViewId";
import { ViewLayer } from "@/core/commons/constants/views/ViewLayer";
import { ThreeView } from "@/core/three/views/ThreeView";
import { Map3D } from "./components/Map3D";

export class MapThreeView extends ThreeView {
  private _map: Map3D; 
  
  constructor() {
    super(ViewId.MAP, ViewLayer.MAIN_THREE);

    this._map = new Map3D();

    this.add(this._map);
  };

  public override init() {
    super.init();
  }

  public override reset() {
    super.reset();
  }
}