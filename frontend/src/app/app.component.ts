import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import * as paper from 'paper';
import {Brush} from "./core/tool/brush";
import {Eraser} from "./core/tool/eraser";
import {SocketService} from "./core/services/socket.service";
import {Pointer} from "./core/items/pointer";
import {Tool} from "./core/tool/tool";

type ToolString = 'brush' | 'eraser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myCanvas')
  myCanvas!: ElementRef<HTMLCanvasElement>;
  title = 'collabdraw';
  uuidToPath: Map<string, paper.Path> = new Map();
  lastDrawn: paper.Item[] = [];
  strokeWidth = 5;
  color: string = "#000";
  activeTool: ToolString = 'brush';

  brushTool!: Brush;
  eraserTool!: Eraser;
  activeATool!: Tool;

  pointer: Pointer | undefined;
  otherPointers: Map<string, Pointer> = new Map();

  uuidToItemMap: Map<string, paper.Item> = new Map();

  pointerLayer!: paper.Layer;
  defaultLayer!: paper.Layer;
  names = ["Jürgen", "Korbi", "Sebastian", "Julian", "Adrian"]

  constructor(private zone: NgZone,
              private socket: SocketService) {
    socket.connectWithUserName(this.names[Math.floor(Math.random() * this.names.length)]);
    socket.pointerUpdates.subscribe((update: any) => {
      let pointer = this.otherPointers.get(update.userID);
      if (!pointer) {
        this.pointerLayer.activate();
        pointer = new Pointer(update.userName, false);
        this.defaultLayer.activate();
        this.otherPointers.set(update.userID, pointer);
      }
      this.otherPointers.get(update.userID)?.handlePoint(new paper.Point(update.pointer.x, update.pointer.y))
    })
  }


  updateColor(event: any) {
    this.color = event.target.value;
    this.brushTool.setColor(this.color);
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
    document.addEventListener('wheel', this.eventListener, {passive: false})
  }

  changeActiveTool(event: ToolString) {
    switch (event) {
      case "brush":
        this.brushTool.activate();
        this.activeATool = this.brushTool;
        break
      case "eraser":
        this.eraserTool.activate();
        this.activeATool = this.brushTool;
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
    this.defaultLayer = defaultLayer;
    this.pointerLayer = pointerLayer
    pointerLayer.activate();
    // this.pointer = new Pointer("test");
    defaultLayer.activate()
    let path = new paper.Path();
    let isDragging;
    this.brushTool = new Brush();
    this.brushTool.setHandler((path, type) => {
      this.handlePathUpdate(path, type);
    })
    this.eraserTool = new Eraser();
    this.eraserTool.setHandler((path: paper.Path, type: string) => {
      this.handlePathUpdate(path, type)
    })


    const getContext = () => {
      return this;
    }
    let dragTool = new paper.Tool();
    dragTool.onMouseDown = function (event: any) {
      isDragging = event.event.altKey;
    }

    dragTool.onMouseDrag = function (event: paper.ToolEvent) {
      let offset = event.downPoint.subtract(event.point);
      paper.view.center = paper.view.center.add(offset);
    }


    paper.view.onMouseMove = function (event: paper.MouseEvent & { event: MouseEvent }) {
      getContext().socket.emitPosition(event.point);
      getContext().pointer?.handlePoint(event.point);
    }

    this.socket.pathUpdates.subscribe(({pathJSON, uuid, type}) => {
      const item = this.uuidToItemMap.get(uuid);
      if (type === "update") {
        if (item) {
          item.importJSON(pathJSON);
        } else {
          let path = new paper.Path().importJSON(pathJSON);
          this.uuidToItemMap.set(uuid, path);
        }
      } else if (type === "delete") {
        console.log("deleting");
        if (!item) {
          console.log("cant find ", uuid);
        }
        item?.remove();
        this.uuidToItemMap.delete(uuid);
      }
    });
  }

  handlePathUpdate(path: paper.Path, type: string) {
    let uuid = path.data.uuid;
    if (!uuid) {
      return;
    }
    if (type === "update") {
      this.uuidToItemMap.set(path.data.uuid, path);
    } else if (type === "delete") {
      this.uuidToItemMap.delete(uuid);
    }
    this.socket.emitPath(path, type);
  }

  clearPaper() {

    paper.project.activeLayer.getItems({class: paper.Path}).forEach(value => {

      value.remove();
      this.handlePathUpdate(value as paper.Path, "delete")
    })
  }

  undo() {
    this.lastDrawn.pop()?.remove();
  }
}
