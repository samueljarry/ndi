import { Ticker } from "@/core/commons/utils/Ticker";
import { ExtendedObject3D } from "@/core/three/components/ExtendedObject3D";
import { createTimeline } from "animejs";
import { BoxGeometry, DoubleSide, Mesh, MeshStandardMaterial } from 'three';

export class DemoObject extends ExtendedObject3D {
  private _mesh: Mesh<BoxGeometry, MeshStandardMaterial>;
  private _audioLevel: number = 0;
  private _targetScale: number = 1;

  constructor() {
    super();
    
    this._createMesh();
    this._setupAudioListener();
  }

  private _setupAudioListener() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('audioLevel', ((e: CustomEvent) => {
      this._audioLevel = e.detail.level;
    }) as EventListener);
  }

  private _createMesh() {
    this._mesh = new Mesh(
      new BoxGeometry(1.6, 1.6, 1.6),
      new MeshStandardMaterial({
        color: 0x66ccff,
        metalness: 0.2,
        roughness: 0.3,
        emissive: 0x002244,
        side: DoubleSide,
      })
    );

    this.add(this._mesh);
  }

  private _createIntroAnimation() {
    return createTimeline({ autoplay: true }).add(this._mesh.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1700,
      ease: "inOutExpo",
    });
  }

  public override init(): void {
    super.init();

    this._mesh.scale.setScalar(0);
    const animation = this._createIntroAnimation();
    animation.play();
  }

  public override update(dt: number): void {
    super.update(dt);

    this._updateMesh(dt);
  }

  private _updateMesh(dt: number) {
    this._mesh.rotation.y -= dt;
    this._mesh.rotation.z += dt;

    // Animation de base avec le temps
    const baseScale = Math.cos(Ticker.ElapsedTime * 1.4) * 0.25 + 1;
    
    // Réaction à l'audio
    const audioBoost = this._audioLevel * 0.5;
    this._targetScale = baseScale + audioBoost;
    
    // Interpolation douce vers la cible
    const currentScale = this.scale.x;
    const newScale = currentScale + (this._targetScale - currentScale) * 0.15;
    
    this.scale.setScalar(newScale);
    
    // Rotation plus rapide quand il y a du son
    if (this._audioLevel > 0.1) {
      this._mesh.rotation.y -= dt * this._audioLevel * 2;
      this._mesh.rotation.z += dt * this._audioLevel * 1.5;
    }
  }
}