import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild,} from '@angular/core';
import * as paper from 'paper';
import {v4 as uuidv4} from 'uuid';
import {Brush} from "./core/tool/brush";
import {Eraser} from "./core/tool/eraser";

type Tool = 'brush' | 'eraser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('myCanvas')
  myCanvas!: ElementRef<HTMLCanvasElement>;
  title = 'collabdraw';
  uuidToPath: Map<string, paper.Path> = new Map();
  lastDrawn: paper.Item[] = [];
  strokeWidth = 5;
  color: string = "#000";
  activeTool: Tool = 'brush';

  brushTool!: paper.Tool;
  eraserTool!: paper.Tool;

  pointer: paper.PointText | undefined;

  constructor(private zone: NgZone) {
  }


  onScroll(event: WheelEvent) {
    if (event.target == this.myCanvas.nativeElement) {
      const delta = event.deltaY;
      // const x = paper.view.zoom;var delta = opt.e.deltaY;
      let zoom = paper.view.zoom;
      let factor = 0.999 ** delta;
      zoom *= factor;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;

      if (zoom !== paper.view.zoom) {
        paper.view.zoom = zoom;
        const point = paper.view.getEventPoint(event as unknown as paper.Event)
        const c = paper.view.center,
          p = point,
          d = p.subtract(c); // distance in project coords
        paper.view.center = c.add(d.multiply((factor - 1) / factor));
      }
      event.preventDefault();
    }

  }

  eventListener = this.onScroll.bind(this);

  ngOnInit(): void {
    console.log(this.myCanvas);
    document.addEventListener('wheel', this.eventListener, {passive: false})
  }

  changeActiveTool(event: Tool) {
    switch (event) {
      case "brush":
        this.brushTool.activate();
        break
      case "eraser":
        this.eraserTool.activate();
        break
    }

  }

  ngOnDestroy(): void {
    document.removeEventListener('wheel', this.eventListener)
  }

  ngAfterViewInit(): void {
    paper.setup(this.myCanvas.nativeElement);
    let defaultLayer = new paper.Layer();
    let pointerLayer = new paper.Layer();
    pointerLayer.activate();
    let pointerRect = new paper.Path.Rectangle(new paper.Rectangle(50, 25, 50, 25), new paper.Size(5, 5));
    pointerRect.strokeColor = new paper.Color("black");
    pointerRect.strokeWidth = 1
    let pointer = new paper.PointText(new paper.Point(50, 50));
    let pointerGroup = new paper.Group([pointer, pointerRect])
    this.pointer = pointer
    pointer.content = "nylser";
    pointerGroup.visible = false;
    pointer.fillColor = new paper.Color('black');
    pointerRect.bounds.width = pointer.bounds.width + 5;
    pointerRect.bounds.height = pointer.bounds.height + 5;
    pointer.bounds.center = pointerRect.bounds.center;
    defaultLayer.activate()
    this.brushTool = new Brush();
    this.eraserTool = new Eraser();
    let path: paper.Path;

    const insertIntoMap = (path: paper.Path) => {
      const uuid = uuidv4();
      this.uuidToPath.set(uuid, path);
    }

    const getStrokeWidth = () => {
      return this.strokeWidth;
    }

    const getContext = () => {
      return this;
    }


    const x = localStorage.getItem("project");
    if (x)
      defaultLayer.importJSON(x);

    const publish = () => {
      const proj = defaultLayer.exportJSON();
      localStorage.setItem("project", proj);
    }
    const addLastDrawn = this.zone.run(() => (item: paper.Item) => {
      this.lastDrawn.push(item);
    });

    paper.view.onMouseMove = function (event: paper.MouseEvent & { event: MouseEvent }) {
      let point = event.point;
      point = point.subtract(new paper.Point(0, 20));
      pointerGroup.bounds.center = point;
      if (!pointerGroup.visible) {
        pointerGroup.visible = true
      }
    }
  }

  clearPaper() {
    paper.project.activeLayer.removeChildren();
  }

  undo() {
    this.lastDrawn.pop()?.remove();
  }
}
