import {HasStrokeWidth, PublishPath, Tool} from "./tool";
import {applyMixins} from "../types/utils";
import * as paper from 'paper';
import {Eraser} from "./eraser";


class Move extends Tool {
  readonly name: string = 'Move'
  private isDragging = false;
  private item?: paper.Item;

  constructor() {
    super();
    this._type = 'update';
  }

  onMouseDown = (event: paper.MouseEvent) => {
    if (this.item) {
      this.item.bounds.selected = true;
      this.isDragging = true;
    }

  };

  onMouseDrag = (event: paper.MouseEvent) => {
    if (this.isDragging && this.item) {
      this.item.position = this.item.position.add(event.delta)
      this.item.selected = false;
      const i = this.item.clone({deep: true});
      i.selected = false;
      this.handlePath(i as paper.Path);
      this.item.selected = true;
    }

  }

  onMouseMove = (event: paper.MouseEvent) => {
    paper.project.activeLayer.selected = false;
    if (!this.isDragging) {
      const hit = paper.project.activeLayer.hitTest(event.point, {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 10
      });
      if (hit) {
       this.item = hit.item;
       this.item.selected = true;
      }
    }
  }

  onMouseUp = () => {
    this.isDragging = false;
    if (this.item) {
      this.item.selected = false;
      this.item.bounds.selected = false;
      const i = this.item.clone({deep: true});
      i.selected = false;
      this.handlePath(i as paper.Path);
    }
  }
}



interface Move extends PublishPath {
}

applyMixins(Move, [PublishPath]);

export {Move}
