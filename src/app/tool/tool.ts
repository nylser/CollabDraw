import * as paper from 'paper';

abstract class Tool extends paper.Tool {
  abstract readonly name: string;
}

class HasStrokeWidth {
  get strokeWidth(): number {
    return this._strokeWidth ?? (this._strokeWidth = 5);
  }

  set strokeWidth(value: number) {
    this._strokeWidth = value;
  }

  private _strokeWidth: number | undefined;
}

class HasColor {
  private _color: paper.Color | undefined

  constructor() {
    this._color = new paper.Color('#000');
  }

  getColor(): paper.Color {
    return this._color ?? (this._color = new paper.Color('#000'));
  }

  setColor(value: paper.Color | string) {
    if (typeof(value) === "string") {
      this._color = new paper.Color(value);
    } else {
      this._color = value;
    }
  }
}

export {HasColor, HasStrokeWidth, Tool}
