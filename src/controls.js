export class Controls {
  _keyboard = {};
  _previousTimeStamp = 0;
  _controlledObject = null;
  _speedMetersPerSecond = 1000;
  _turnDegreesPerSecond = 45;
  _acceleration = 10;

  get controlledObject() { return this._controlledObject; }
  set controlledObject(value) { this._controlledObject = value; }

  constructor() {
    window.addEventListener('keydown', this._keyDown.bind(this));
    window.addEventListener('keyup', this._keyUp.bind(this));
    window.addEventListener('wheel', this._scroll.bind(this));
  }

  control() {
    let timeFactor = this._calculateTimeFactor();

    if (this._keyboard[87]) { // W key			
      this.controlledObject.translateZ(-this._speedMetersPerSecond * timeFactor);
    }
    if (this._keyboard[83]) { // S key			
      this.controlledObject.translateZ(this._speedMetersPerSecond * timeFactor);
    }
    if (this._keyboard[65]) { // A key			
      this.controlledObject.translateX(-this._speedMetersPerSecond * timeFactor);
    }
    if (this._keyboard[68]) { // D key			
      this.controlledObject.translateX(this._speedMetersPerSecond * timeFactor);
    }
    if (this._keyboard[82]) { // R key			
      this.controlledObject.translateY(this._speedMetersPerSecond * timeFactor);
    }
    if (this._keyboard[70]) { // F key			
      this.controlledObject.translateY(-this._speedMetersPerSecond * timeFactor);
    }
    if (this._keyboard[81]) { // Q key			
      this.controlledObject.rotateZ(this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    }
    if (this._keyboard[69]) { // E key			
      this.controlledObject.rotateZ(-this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    }
    if (this._keyboard[37]) { // left arrow key			
      this.controlledObject.rotateY(this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    }
    if (this._keyboard[39]) { // right arrow key			
      this.controlledObject.rotateY(-this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    }
    if (this._keyboard[38]) { // up arrow key			
      this.controlledObject.rotateX(-this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    }
    if (this._keyboard[40]) { // down arrow key			
      this.controlledObject.rotateX(this._turnDegreesPerSecond * Math.PI / 360 * timeFactor);
    }
  }

  _calculateTimeFactor() {
    let now = + new Date();
    let diff = now - this._previousTimeStamp;
    this._previousTimeStamp = now;
    return diff / 1000;
  }

  _keyDown(event) {
    this._keyboard[event.keyCode] = true;
  }

  _keyUp(event) {
    this._keyboard[event.keyCode] = false;
  }

  _scroll(e) {
    if (e.deltaY > 0 && this._speedMetersPerSecond - this._acceleration >= 0) {
      this._speedMetersPerSecond -= this._acceleration;
    } else if (e.deltaY < 0) {
      this._speedMetersPerSecond += this._acceleration;
    }
  }
}