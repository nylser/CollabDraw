import {
    AfterViewInit,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import * as paper from 'paper';
import { Brush } from './core/tool/brush';
import { Eraser } from './core/tool/eraser';
import { SocketService } from './core/services/socket.service';
import { Pointer } from './core/items/pointer';
import { Tool } from './core/tool/tool';
import { Move } from './core/tool/move';

type ToolString = 'brush' | 'eraser' | 'move';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('myCanvas')
    myCanvas!: ElementRef<HTMLCanvasElement>;
    title = 'collabdraw';
    lastDrawn: paper.Item[] = [];
    strokeWidth = 5;
    color: string = '#000';
    activeTool: ToolString = 'brush';

    brushTool!: Brush;
    eraserTool!: Eraser;
    moveTool!: Move;
    activeATool!: Tool;

    pointer: Pointer | undefined;
    otherPointers: Map<string, Pointer> = new Map();
    viewPorts: Map<string, paper.Path> = new Map();

    uuidToItemMap: Map<string, paper.Item> = new Map();

    pointerLayer!: paper.Layer;
    defaultLayer!: paper.Layer;
    names = ['Jürgen', 'Korbi', 'Sebastian', 'Julian', 'Adrian'];

    constructor(private zone: NgZone, private socket: SocketService) {}

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
                const point = paper.view.getEventPoint(
                    event as unknown as paper.Event
                );
                const c = paper.view.center,
                    p = point,
                    d = p.subtract(c); // distance in project coords
                paper.view.center = c.add(d.multiply((factor - 1) / factor));
            }
            event.preventDefault();
            this.socket.emitPosition(null, paper.view);
        }
    }

    eventListener = this.onScroll.bind(this);
    follow: boolean = false;

    ngOnInit(): void {
        this.socket.connectWithUserName(
            this.names[Math.floor(Math.random() * this.names.length)]
        );
        this.socket.pointerUpdates.subscribe((update: any) => {
            if (update.pointer.x && update.pointer.y) {
                let pointer = this.otherPointers.get(update.userID);
                if (!pointer) {
                    this.pointerLayer.activate();
                    pointer = new Pointer(update.userName, false);
                    this.defaultLayer.activate();
                    this.otherPointers.set(update.userID, pointer);
                }
                this.otherPointers
                    .get(update.userID)
                    ?.handlePoint(
                        new paper.Point(update.pointer.x, update.pointer.y)
                    );
            }
            const { x, y, width, height } = update.pointer.viewport;
            const viewport = new paper.Rectangle(x, y, width, height);
            let path = this.viewPorts.get(update.userID);
            if (!path) {
                this.pointerLayer.activate();
                path = new paper.Path.Rectangle(viewport);
                path.strokeColor = new paper.Color('orange');
                this.defaultLayer.activate();
                this.viewPorts.set(update.userID, path);
            }
            path.bounds = viewport;
            if (this.follow) {
                paper.view.center = viewport.center;
                paper.view.zoom = update.pointer.zoom;
                this.socket.emitPosition(null, paper.view);
            }
        });
        document.addEventListener('wheel', this.eventListener, {
            passive: false,
        });
    }

    changeActiveTool(event: ToolString) {
        switch (event) {
            case 'brush':
                this.brushTool.activate();
                this.activeATool = this.brushTool;
                break;
            case 'eraser':
                this.eraserTool.activate();
                this.activeATool = this.brushTool;
                break;
            case 'move':
                this.moveTool.activate();
                this.activeATool = this.moveTool;
                break;
        }
    }

    ngOnDestroy(): void {
        document.removeEventListener('wheel', this.eventListener);
    }

    ngAfterViewInit(): void {
        paper.setup(this.myCanvas.nativeElement);
        let defaultLayer = new paper.Layer();
        let pointerLayer = new paper.Layer();
        this.defaultLayer = defaultLayer;
        this.pointerLayer = pointerLayer;
        pointerLayer.activate();
        // this.pointer = new Pointer("test");
        defaultLayer.activate();
        let path = new paper.Path();
        let isDragging;
        this.brushTool = new Brush();
        this.brushTool.setHandler((path, type) => {
            this.handlePathUpdate(path, type);
        });
        this.eraserTool = new Eraser();
        this.eraserTool.setHandler((path: paper.Path, type: string) => {
            this.handlePathUpdate(path, type);
        });

        const getContext = () => {
            return this;
        };
        let dragTool = new paper.Tool();
        dragTool.onMouseDown = function (event: any) {
            isDragging = event.event.altKey;
        };

        dragTool.onMouseDrag = function (event: paper.ToolEvent) {
            let offset = event.downPoint.subtract(event.point);
            paper.view.center = paper.view.center.add(offset);
            getContext().socket.emitPosition(event.point, paper.view);
        };

        dragTool.activate();

        this.moveTool = new Move();
        this.moveTool.setHandler((path: paper.Path, type: string) => {
            this.handlePathUpdate(path, type);
        });

        paper.view.onMouseMove = function (
            event: paper.MouseEvent & { event: MouseEvent }
        ) {
            getContext().socket.emitPosition(event.point, paper.view);
            getContext().pointer?.handlePoint(event.point);
        };

        paper.view.onFrame = function () {
            for (let pointer of getContext().otherPointers.values()) {
                const target = pointer.getTargetPosition();
                if (!target) {
                    continue;
                }
                let vector = target.subtract(pointer.getPosition()).divide(10);
                pointer.setPosition(pointer.getPosition().add(vector));
            }
        };

        this.socket.pathUpdates.subscribe(({ pathJSON, uuid, type }) => {
            const item = this.uuidToItemMap.get(uuid);
            if (type === 'update') {
                if (item) {
                    item.importJSON(pathJSON);
                } else {
                    let path = new paper.Path().importJSON(pathJSON);
                    this.uuidToItemMap.set(uuid, path);
                }
            } else if (type === 'delete') {
                console.log('deleting');
                if (!item) {
                    console.log('cant find ', uuid);
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
        if (type === 'update') {
            this.uuidToItemMap.set(path.data.uuid, path);
        } else if (type === 'delete') {
            this.uuidToItemMap.delete(uuid);
        }
        this.socket.emitPath(path, type);
    }

    clearPaper() {
        paper.project.activeLayer
            .getItems({ class: paper.Path })
            .forEach((value) => {
                value.remove();
                this.handlePathUpdate(value as paper.Path, 'delete');
            });
    }

    undo() {
        let x = this.lastDrawn.pop();
        if (x) {
            x.remove();
            this.handlePathUpdate(x as paper.Path, 'delete');
        }
    }
}
