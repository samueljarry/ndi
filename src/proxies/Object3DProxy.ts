import type { Object3DId } from "@/constants/Object3DId";
import { Object3D } from "three";

export class Object3DProxy {
  private static _ObjectMap = new Map<Object3DId, Object3D>();

  public static SetObject3D(id: Object3DId, object: Object3D): void {
    this._ObjectMap.set(id, object);
  }

  public static GetObject3D<T = Object3D>(id: Object3DId): T {
    return this._ObjectMap.get(id) as T;
  }

  public static GetObject3DClone<T = Object3D>(id: Object3DId): T {
    return this._ObjectMap.get(id)!.clone() as T;
  }
}
