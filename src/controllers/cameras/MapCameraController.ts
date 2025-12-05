import { PNJHouseIndices } from "@/constants/PNJConstants";
import { Action } from "@/core/commons/utils/Action";
import { expDecay } from "@/core/commons/utils/expDecay";
import { CamerasId } from "@/core/three/constants/CamerasId";
import { PerspectiveCameraController } from "@/core/three/controllers/cameras/abstracts/PerspectiveCameraController";

export class MapCameraController extends PerspectiveCameraController {
  public onFocusedHouseChange = new Action();

  private readonly HOUSE_COUNT = 5;
  private readonly HOUSE_TURN = Math.PI / (this.HOUSE_COUNT * 0.5);
  private _targetY = 0;
  private _lastWheelTime = -Infinity;
  private readonly WHEEL_COOLDOWN = 1000; // ms

  constructor() {
    super(CamerasId.MAP);

    this.position.y = 6;
    this.camera.rotation.x = -0.15;
    this.camera.zoom = 2.5;
  }

  // #region lifecycle
  public override init() {
    super.init();

    this.addListeners();
  }

  public override reset() {
    super.reset();

    this.removeListeners();
  }

  public addListeners() {
     window.addEventListener("keydown", this._handleKeydown);
     window.addEventListener("wheel", this._handleWheel);
  }

  public removeListeners() {
    window.removeEventListener("keydown", this._handleKeydown);
    window.removeEventListener("wheel", this._handleWheel);
  }

  private _handleWheel = (event: WheelEvent) => {
    const now = performance.now();

    if (now - this._lastWheelTime < this.WHEEL_COOLDOWN) return;

    this._lastWheelTime = now;

    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);

    const delta = absX > absY ? event.deltaX : event.deltaY;
    const direction = Math.sign(delta);

    switch (direction) {
      case 1:
        this.nextHouse();
        break;
      case -1:
        this.previousHouse();
        break;
    }
  };

  private _handleKeydown = (event: KeyboardEvent) => {
    switch (event.code) {
      case "ArrowLeft":
        this.previousHouse();
        break;
      case "ArrowRight":
        this.nextHouse();
        break;
    }
  };

  public nextHouse() {
    this._targetY -= this.HOUSE_TURN;
    this.onFocusedHouseChange.execute();
  }

  public previousHouse() {
    this._targetY += this.HOUSE_TURN;
    this.onFocusedHouseChange.execute();
  }

  public override update(dt: number): void {
    super.update(dt);

    this.rotation.y = expDecay(this.rotation.y, this._targetY, 8, dt);
  }
  // #endregion

  public get pnjHouseId() {
    const rawIndex = Math.round(this._targetY / this.HOUSE_TURN);
    return (
      ((rawIndex % this.HOUSE_COUNT) + this.HOUSE_COUNT) % this.HOUSE_COUNT
    );
  }

  public get currentHousePNJ() {
    return PNJHouseIndices[this.pnjHouseId];
  }
}
