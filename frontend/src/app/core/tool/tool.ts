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
    return this._color ?? (this._color = new paper.Color('#007bee'));
  }

  setColor(value: paper.Color | string) {
    if (typeof (value) === "string") {
      this._color = new paper.Color(value);
    } else {
      this._color = value;
    }
  }
}

class PublishPath {
  private _handler?: (path: paper.Path, type: string) => void;
  protected _type?: string | undefined;

  setHandler(handler: (path: paper.Path, type: string) => void) {
    this._handler = handler;
  }

  protected handlePath(path: paper.Path): void {
    if (!this._type) {
      throw new Error("Invalid update type!");
    }
    this._handler?.call(this, path, this._type);
  }

}

export {HasColor, HasStrokeWidth, PublishPath, Tool}
