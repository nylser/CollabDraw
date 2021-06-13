import {HasColor, HasStrokeWidth, PublishPath, Tool} from "./tool";
import * as paper from 'paper';
import {applyMixins} from "../types/utils";
import {buildPath} from "../items/path";

class Brush extends Tool {
  currentPath: paper.Path | undefined;
  readonly name: string = 'Brush';

  constructor() {
    super();
    this._type = "update";
  }

  onMouseDown = (event: any) => {
    this.currentPath = buildPath();
    this.currentPath.strokeColor = this.getColor();
    this.currentPath.strokeWidth = this.strokeWidth;
    this.currentPath.strokeJoin = 'round';
    this.currentPath.strokeCap = 'round';
    this.currentPath.add(event.point);
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
      if (this.currentPath.segments.length > 3) {
        this.currentPath.simplify(2.5);
      }
      this.handlePath(this.currentPath);
    }
  }
}

interface Brush extends HasColor, HasStrokeWidth, PublishPath {
}

applyMixins(Brush, [HasColor, HasStrokeWidth, PublishPath]);

export {Brush}
