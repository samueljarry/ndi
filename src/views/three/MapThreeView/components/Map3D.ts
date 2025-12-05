import { Object3DId } from "@/constants/Object3DId";
import { AssetsId } from "@/core/commons/constants/AssetsId";
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
  }

  private _onMouseEnter = (intersection: Intersection) => {
    document.body.style.cursor = "pointer";
    intersection.object.userData.id
  };

  private _onMouseLeave = () => {
    document.body.style.cursor = "default";
  };

  public override reset(): void {
    super.reset();
    this._raycaster.stop();
  }

  private _handleClick = (intersection: Intersection) => {
    const id = intersection.object.userData.id;
    const pnjId = PNJHouseIndices[id];
    const data = PNJDatas[pnjId];

    GameManager.Show(data);
  };
}