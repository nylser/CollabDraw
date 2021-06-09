import {HasColor, HasStrokeWidth, PublishPath, Tool} from "./tool";
import * as paper from 'paper';
import {applyMixins} from "../types/utils";
import {Path} from "../items/path";

class Brush extends Tool {
  currentPath: Path | undefined;
  readonly name: string = 'Brush';

  constructor() {
    super();
    this._type = "update";
  }

  onMouseDown = (event: any) => {
    this.currentPath = new Path();
    this.currentPath.strokeColor = this.getColor();
    this.currentPath.strokeWidth = this.strokeWidth;
    this.currentPath.strokeJoin = 'round';
    this.currentPath.strokeCap = 'round';
    this.currentPath.add(event.point);
    this.handlePath(this.currentPath);
  };

  onMouseDrag = (event: paper.MouseEvent) => {
    if (this.currentPath) {
      this.currentPath.add(event.point);
      this.handlePath(this.currentPath);
    }
  };

  onMouseUp = (event: paper.MouseEvent) => {
    if (this.currentPath) {
      this.currentPath.simplify(10);
      this.handlePath(this.currentPath);
    }
  }
}

interface Brush extends HasColor, HasStrokeWidth, PublishPath {
}

applyMixins(Brush, [HasColor, HasStrokeWidth, PublishPath]);

export {Brush}
