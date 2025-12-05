import { Action } from "@/core/commons/utils/Action";
import { Ticker } from "@/core/commons/utils/Ticker";
import { Three } from "@/core/three/Three";
import {
  Object3D,
  Raycaster,
  Vector2,
  type Intersection,
  type Object3DEventMap,
} from "three";

export class RaycastHandler {
  private _raycaster: Raycaster;
  private _objectsToIntersects = new Set<Object3D>();
  private _objectsToIntersectsArray: Object3D[];
  private _pointer = new Vector2();
  private _started = false;
  private _needCheck = false;
  private _intersects: Intersection<Object3D<Object3DEventMap>>[] = [];
  private _currentIntersectedObject: Object3D | null = null;

  public onIntersection = new Action<[Intersection]>();
  public onMouseDown = new Action<[Intersection]>();
  public onClick = new Action<[Intersection]>();
  public onMouseEnter = new Action<[Intersection]>();
  public onMouseLeave = new Action<[Object3D]>();

  private _mouseDownPosition = new Vector2();

  constructor(...objects: Object3D[]) {
    this._raycaster = new Raycaster();

    this.add(...objects);
  }

  private _addListeners(): void {
    window.addEventListener("pointermove", this._handlePointerMove);
    window.addEventListener("mousedown", this._handleMousedown);
    window.addEventListener("click", this._handleClick);

    Ticker.Add(this._update);
  }

  private _removeListeners(): void {
    window.removeEventListener("pointermove", this._handlePointerMove);
    window.removeEventListener("mousedown", this._handleMousedown);
    window.removeEventListener("click", this._handleClick);

    Ticker.Remove(this._update);
  }

  public start(): void {
    if (this._started) return;

    this._addListeners();
    this._started = true;
  }

  public stop(): void {
    this._started = false;
    this._removeListeners();
  }

  public destroy(): void {
    this.onIntersection.clear();
    this.onMouseDown.clear();
    this.onClick.clear();
    this.onMouseEnter.clear();
    this.onMouseLeave.clear();

    this.clear();
    this.stop();

    this._currentIntersectedObject = null;
  }

  public clear(): void {
    this.remove(...this._objectsToIntersects);
  }

  public add(...objects: Object3D[]): void {
    for (const object of objects) {
      this._objectsToIntersects.add(object);
    }

    this._updateArray();
  }

  private _updateArray(): void {
    this._objectsToIntersectsArray = [...this._objectsToIntersects];
  }

  public remove(...objects: Object3D[]): void {
    for (const object of objects) {
      this._objectsToIntersects.delete(object);
    }

    this._updateArray();
  }

  private _setPosition(x: number, y: number): void {
    const _x = (x / window.innerWidth) * 2 - 1;
    const _y = -(y / window.innerHeight) * 2 + 1;

    this._pointer.set(_x, _y);
  }

  private _handlePointerMove = ({
    clientX,
    clientY,
  }: PointerEvent | MouseEvent): void => {
    this._setPosition(clientX, clientY);

    this._needCheck = true;
  };

  private _handleMousedown = ({
    clientX,
    clientY,
  }: PointerEvent | MouseEvent): void => {
    this._setPosition(clientX, clientY);
    this._mouseDownPosition.copy(this._pointer);

    const [hasIntersection, intersects] = this._checkIntersections();

    if (hasIntersection) {
      this.onMouseDown.execute(intersects);
    }
  };

  private _handleClick = ({ clientX, clientY }: PointerEvent): void => {
    this._setPosition(clientX, clientY);

    const notSamePosition =
      this._pointer.x !== this._mouseDownPosition.x ||
      this._pointer.y !== this._mouseDownPosition.y;

    if (notSamePosition) return;

    const [hasIntersection, intersects] = this._checkIntersections();

    if (hasIntersection) {
      this.onClick.execute(intersects);
    }
  };

  private _checkIntersections(): [false] | [true, Intersection] {
    this._needCheck = false;

    this._raycaster.setFromCamera(this._pointer, Three.Camera);
    this._intersects = this._raycaster.intersectObjects(
      this._objectsToIntersectsArray
    );

    const hasIntersection = this._intersects.length > 0;
    const newIntersectedObject = hasIntersection
      ? this._intersects[0].object
      : null;

    // Gestion du MouseEnter et MouseLeave
    if (newIntersectedObject !== this._currentIntersectedObject) {
      // MouseLeave sur l'ancien objet
      if (this._currentIntersectedObject) {
        this.onMouseLeave.execute(this._currentIntersectedObject);
      }

      // MouseEnter sur le nouvel objet
      if (newIntersectedObject) {
        this.onMouseEnter.execute(this._intersects[0]);
      }

      this._currentIntersectedObject = newIntersectedObject;
    }

    if (!hasIntersection) {
      return [false];
    }

    this.onIntersection.execute(this._intersects[0]);

    return [true, this._intersects[0]];
  }

  public _update = (): void => {
    if (!this._needCheck) return;

    this._checkIntersections();
  };

  public get started() {
    return this._started;
  }

  public get hasIntersection() {
    return this._intersects.length > 0;
  }

  public get objectsToIntersect() {
    return this._objectsToIntersects;
  }

  public get currentIntersectedObject() {
    return this._currentIntersectedObject;
  }
}
