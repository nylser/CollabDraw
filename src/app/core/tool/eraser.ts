import {HasStrokeWidth, Tool} from "./tool";
import * as paper from 'paper';
import {applyMixins} from "../types/utils";

class Eraser extends Tool {
  hitList: paper.Item[] = [];
  readonly name: string = 'Eraser';


  onMouseDrag = (event: paper.MouseEvent) => {
    const hit = paper.project.activeLayer.hitTest(event.point, {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: this.strokeWidth
    });
    if (hit) {
      hit.item.selected = true;
      this.hitList.push(hit.item);
    }
  };

  onMouseUp = (event: paper.MouseEvent) => {
    this.hitList.forEach(value => value.remove());
    this.hitList = [];
  }
}

interface Eraser extends HasStrokeWidth {
}

applyMixins(Eraser, [HasStrokeWidth]);

export {Eraser}
