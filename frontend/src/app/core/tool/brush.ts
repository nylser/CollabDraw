import {HasColor, HasStrokeWidth, Tool} from "./tool";
import * as paper from 'paper';
import {applyMixins} from "../types/utils";
import {Path} from "../items/path";

class Brush extends Tool {
  currentPath: Path | undefined;
  readonly name: string = 'Brush';

  onMouseDown = (event: any) => {
    this.currentPath = new Path();
    this.currentPath.strokeColor = this.getColor();
    this.currentPath.strokeWidth = this.strokeWidth;
    this.currentPath.strokeJoin = 'round';
    this.currentPath.strokeCap = 'round';
    this.currentPath.add(event.point);
  };

  onMouseDrag = (event: paper.MouseEvent) => {
    this.currentPath?.add(event.point);
  };

  onMouseUp = (event: paper.MouseEvent) => {
    this.currentPath?.simplify(10);
  }
}

interface Brush extends HasColor, HasStrokeWidth {
}

applyMixins(Brush, [HasColor, HasStrokeWidth]);

export {Brush}
