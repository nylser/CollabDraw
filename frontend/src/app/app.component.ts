import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import * as paper from 'paper';
import {v4 as uuidv4} from 'uuid';
import {Brush} from "./core/tool/brush";
import {Eraser} from "./core/tool/eraser";
import {SocketService} from "./core/services/socket.service";
import {Pointer} from "./core/items/pointer";
import {Path} from "./core/items/path";

type Tool = 'brush' | 'eraser';

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
  activeTool: Tool = 'brush';

  brushTool!: Brush;
  eraserTool!: Eraser;

  pointer: Pointer | undefined;
  otherPointers: Map<string, Pointer> = new Map();

  itemMap: Map<string, paper.Item> = new Map();

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
    this.defaultLayer = defaultLayer;
    this.pointerLayer = pointerLayer
    pointerLayer.activate();
    // this.pointer = new Pointer("test");
    defaultLayer.activate()
    this.brushTool = new Brush();
    this.brushTool.setHandler((path, type) => {
      this.handlePathUpdate(path, type);
    })
    this.eraserTool = new Eraser();
    this.eraserTool.setHandler((path: Path, type: string) => {
      this.handlePathUpdate(path, type)
    })

    const insertIntoMap = (path: paper.Path) => {
      const uuid = uuidv4();
      this.uuidToPath.set(uuid, path);
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
      getContext().socket.emitPosition(event.point);
      getContext().pointer?.handlePoint(event.point);
    }

    this.socket.pathUpdates.subscribe(({pathJSON, uuid, type}) => {
      //console.log(uuid);
      const item = this.itemMap.get(uuid);
      if (type === "update") {
        if (item) {
          item.importJSON(pathJSON);
        } else {
          console.log(pathJSON);
          let path = new paper.Path().importJSON(pathJSON)
          this.itemMap.set(uuid, path);
          //path.strokeWidth = 5;
          //path.strokeColor = new paper.Color("black");
          console.log(path);
        }
      } else if (type === "delete") {
        console.log("deleting");
        if (!item) {
          console.log("cant find ", uuid);
        }
        item?.remove();
        this.itemMap.delete(uuid);
      }
    });
  }

  handlePathUpdate(path: Path, type: string) {
    console.log(path, type)
    if (type === "update") {
      this.itemMap.set(path.uuid, path);
    } else if (type === "delete") {
      this.itemMap.delete(path.uuid);
    }
    this.socket.emitPath(path, type);
  }

  clearPaper() {
    paper.project.activeLayer.removeChildren();
  }

  undo() {
    this.lastDrawn.pop()?.remove();
  }
}
