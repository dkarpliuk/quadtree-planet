import { Object3D } from 'three';

export class Controls {
  private _keyboard: Record<string, boolean> = {};
  private _previousTimeStamp = 0;
  private _controlledObject!: Object3D;
  private _speedMetersPerSecond = 500;
  private _turnDegreesPerSecond = 45;
  private _acceleration = 20;

  get controlledObject(): Object3D { return this._controlledObject; }
  set controlledObject(value: Object3D) { this._controlledObject = value; }

  constructor() {
    window.addEventListener('keydown', this._keyDown.bind(this));
    window.addEventListener('keyup', this._keyUp.bind(this));
    window.addEventListener('wheel', this._scroll.bind(this));
  }

  control() {
    const timeFactor = this._calculateTimeFactor();

    if (this._keyboard['KeyW'])
      this.controlledObject.translateZ(-this._speedMetersPerSecond * timeFactor);
    if (this._keyboard['KeyS'])
      this.controlledObject.translateZ(this._speedMetersPerSecond * timeFactor);
    if (this._keyboard['KeyA'])
      this.controlledObject.translateX(-this._speedMetersPerSecond * timeFactor);
    if (this._keyboard['KeyD'])
      this.controlledObject.translateX(this._speedMetersPerSecond * timeFactor);
    if (this._keyboard['KeyR'])
      this.controlledObject.translateY(this._speedMetersPerSecond * timeFactor);
    if (this._keyboard['KeyF'])
      this.controlledObject.translateY(-this._speedMetersPerSecond * timeFactor);
    if (this._keyboard['KeyQ'])
      this.controlledObject.rotateZ(this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    if (this._keyboard['KeyE'])
      this.controlledObject.rotateZ(-this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    if (this._keyboard['ArrowLeft'])
      this.controlledObject.rotateY(this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    if (this._keyboard['ArrowRight'])
      this.controlledObject.rotateY(-this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    if (this._keyboard['ArrowUp'])
      this.controlledObject.rotateX(-this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    if (this._keyboard['ArrowDown'])
      this.controlledObject.rotateX(this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
  }

  private _calculateTimeFactor(): number {
    const now = +new Date();
    const diff = now - this._previousTimeStamp;
    this._previousTimeStamp = now;
    return diff / 1000;
  }

  private _keyDown = (event: KeyboardEvent) =>
    this._keyboard[event.code] = true;

  private _keyUp = (event: KeyboardEvent) =>
    this._keyboard[event.code] = false;

  private _scroll(e: WheelEvent) {
    if (e.deltaY > 0 && this._speedMetersPerSecond - this._acceleration >= 0)
      this._speedMetersPerSecond -= this._acceleration;
    else if (e.deltaY < 0)
      this._speedMetersPerSecond += this._acceleration;
  }
}
