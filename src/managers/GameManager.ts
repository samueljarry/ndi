import type { PNJData } from "@/constants/PNJConstants";
import { MapCameraController } from "@/controllers/cameras/MapCameraController";
import { ViewId } from "@/core/commons/constants/views/ViewId";
import { ViewsManager } from "@/core/commons/managers/ViewsManager";
import { Action } from "@/core/commons/utils/Action";
import { CamerasId } from "@/core/three/constants/CamerasId";
import { CamerasManager } from "@/core/three/managers/CamerasManager";

export class GameManager {
  private static _CurrentData: PNJData;
  private static _Camera: MapCameraController;

  public static OnShow = new Action();
  public static OnHide = new Action();
  
  public static Show(pnjData: PNJData) {
    this._Camera = CamerasManager.Get<MapCameraController>(CamerasId.MAP);
    this._Camera.removeListeners();
    this._CurrentData = pnjData;
    ViewsManager.Show(ViewId.HOUSE_DIALOG);

    this.OnShow.execute();
    console.log('show pd')
  }

  public static Hide() {
    this._Camera.addListeners();
    ViewsManager.Hide(ViewId.HOUSE_DIALOG);
    console.log(this._CurrentData.viewId)
    ViewsManager.Hide(this._CurrentData.viewId);

    this.OnHide.execute();
    console.log('hide pd')
  }

  public static get CurrentData() {
    return this._CurrentData;
  }
}