import { METER_UNITS } from '@config/common';
import type { ControlsConfig } from '@config/controls-config';
import { Object3D } from 'three';

export class Controls {
  private _keyboard: Record<string, boolean> = {};
  private _previousTimeStamp = 0;
  private _controlledObject: Object3D;
  private _config: ControlsConfig;
  private _turnRad: number;
  private _currentSpeed: number;

  constructor(controlledObject: Object3D, config: ControlsConfig) {
    this._controlledObject = controlledObject;
    this._config = config;
    this._turnRad = config.turnDegreesSec * Math.PI / 180;
    this._currentSpeed = config.speedMetersSec * METER_UNITS;
    window.addEventListener('keydown', this._keyDown.bind(this));
    window.addEventListener('keyup', this._keyUp.bind(this));
    window.addEventListener('wheel', this._scroll.bind(this));
  }

  control() {
    const timeFactor = this._calculateTimeFactor();

    if (this._keyboard['KeyW'])
      this._controlledObject.translateZ(-this._currentSpeed * timeFactor);
    if (this._keyboard['KeyS'])
      this._controlledObject.translateZ(this._currentSpeed * timeFactor);
    if (this._keyboard['KeyA'])
      this._controlledObject.translateX(-this._currentSpeed * timeFactor);
    if (this._keyboard['KeyD'])
      this._controlledObject.translateX(this._currentSpeed * timeFactor);
    if (this._keyboard['KeyR'])
      this._controlledObject.translateY(this._currentSpeed * timeFactor);
    if (this._keyboard['KeyF'])
      this._controlledObject.translateY(-this._currentSpeed * timeFactor);
    if (this._keyboard['KeyQ'])
      this._controlledObject.rotateZ(this._turnRad * timeFactor);
    if (this._keyboard['KeyE'])
      this._controlledObject.rotateZ(-this._turnRad * timeFactor);
    if (this._keyboard['ArrowLeft'])
      this._controlledObject.rotateY(this._turnRad * timeFactor);
    if (this._keyboard['ArrowRight'])
      this._controlledObject.rotateY(-this._turnRad * timeFactor);
    if (this._keyboard['ArrowUp'])
      this._controlledObject.rotateX(-this._turnRad * timeFactor);
    if (this._keyboard['ArrowDown'])
      this._controlledObject.rotateX(this._turnRad * timeFactor);
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
    const acceleration = this._config.accelerationStepMeters * METER_UNITS;
    if (e.deltaY > 0)
      this._currentSpeed = Math.max(0, this._currentSpeed - acceleration);
    else if (e.deltaY < 0)
      this._currentSpeed += acceleration;
  }
}
