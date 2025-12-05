import { Object3DId } from "@/constants/Object3DId";
import { AssetsId } from "@/core/commons/constants/AssetsId";
import { ViewId } from "@/core/commons/constants/views/ViewId";
import { ViewsManager } from "@/core/commons/managers/ViewsManager";
import { ExtendedObject3D } from "@/core/three/components/ExtendedObject3D";
import type { GLB } from "@/core/three/loaders/GLBLoader";
import { ThreeAssetsManager } from "@/core/three/managers/ThreeAssetsManager";
import { GameManager } from "@/managers/GameManager";
import { Object3DProxy } from "@/proxies/Object3DProxy";
import { RaycastHandler } from "@/utils/RaycastHandler";
import { BoxGeometry, Mesh, MeshBasicMaterial, type Intersection, type Scene } from "three";
import { PNJDatas, PNJHouseIndices } from '../../../../constants/PNJConstants';

export class Map3D extends ExtendedObject3D {
  private _glb: GLB;
  private _scene: Scene;
  private _hitboxes = new Set<Mesh>();
  private _raycaster: RaycastHandler;
  private _snakeRaycaster: RaycastHandler;
  private _robotRaycaster: RaycastHandler;

  private readonly HOUSES_ID = [
    Object3DId.HOUSE_1,
    Object3DId.HOUSE_2,
    Object3DId.HOUSE_3,
    Object3DId.HOUSE_4,
    Object3DId.HOUSE_5,
  ] as const;

  constructor() {
    super();

    this._glb = ThreeAssetsManager.GetModel(AssetsId.GLB_MAP);
    this._scene = this._glb.scene;

    this.add(this._scene);
    this.name = "🏠 MAP 3D";
    this._raycaster = new RaycastHandler();
    this._snakeRaycaster = new RaycastHandler();
    this._robotRaycaster = new RaycastHandler();
  }

  public override init(): void {
    super.init();

    let i = 0;
    for (const id of this.HOUSES_ID) {
      const obj = Object3DProxy.GetObject3D(id);

      const box = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({ color: "red" })
      );

      box.position.copy(obj.position);
      box.scale.x = 8;
      box.scale.y = 8;
      box.scale.z = 10;
      box.rotation.copy(obj.rotation);
      box.position.y = 3.9;
      box.visible = false;
      box.userData.id = i;
      box.userData.objId = id;
      box.userData.target = obj;

      this._hitboxes.add(box);
      this.add(box);
      i++;
    }

    this._raycaster.add(...this._hitboxes);
    this._raycaster.start();
    this._raycaster.onClick.add(this._handleClick);
    this._raycaster.onMouseEnter.add(this._onMouseEnter);
    this._raycaster.onMouseLeave.add(this._onMouseLeave);

    const hitboxRobot = Object3DProxy.GetObject3D(Object3DId.ROBOT_HITBOX);
    hitboxRobot.visible = false;

    this._robotRaycaster.add(
      hitboxRobot
    );
    this._robotRaycaster.start();
    this._robotRaycaster.onClick.add(this._onRobotClick);
    this._robotRaycaster.onMouseEnter.add(this._onMouseEnter);
    this._robotRaycaster.onMouseLeave.add(this._onMouseLeave);
    const snakeHitbox = Object3DProxy.GetObject3D(Object3DId.SNAKE_HITBOX);
    snakeHitbox.visible = false;

    this._snakeRaycaster.add(
      snakeHitbox
    );
    this._snakeRaycaster.start();
    this._snakeRaycaster.onClick.add(this._onSnakeClick);
    this._snakeRaycaster.onMouseEnter.add(this._onMouseEnter);
    this._snakeRaycaster.onMouseLeave.add(this._onMouseLeave);

    GameManager.OnShow.add(this._handleGameStart);
    GameManager.OnHide.add(this._handleGameEnd);
  }

  private _onRobotClick = () => {
    console.log("CLICK ROBOT");
    ViewsManager.Show(ViewId.ROBOT_A_I);
  };

  private _onSnakeClick = () => {
    console.log("CLICK Snake");
  };

  private _handleGameStart = () => {
    this._raycaster.stop();
    this._snakeRaycaster.stop();
    this._robotRaycaster.stop();
  };

  private _handleGameEnd = () => {
    this._raycaster.start();
    this._snakeRaycaster.start();
    this._robotRaycaster.start();
  };

  private _onMouseEnter = (intersection: Intersection) => {
    document.body.style.cursor = "pointer";
    intersection.object.userData.id;
  };

  private _onMouseLeave = () => {
    document.body.style.cursor = "default";
  };

  public override reset(): void {
    super.reset();
    this._raycaster.stop();

    GameManager.OnShow.remove(this._handleGameStart);
    GameManager.OnHide.remove(this._handleGameEnd);
  }

  private _handleClick = (intersection: Intersection) => {
    const id = intersection.object.userData.id;
    const pnjId = PNJHouseIndices[id];
    const data = PNJDatas[pnjId];

    GameManager.Show(data);
  };
}