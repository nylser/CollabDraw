import {AfterViewInit, Component, ElementRef, OnInit, ViewChild,} from '@angular/core';
import * as paper from 'paper';
import {v4 as uuidv4} from 'uuid';

class MyPath extends paper.Path {
  readonly uuid: string;

  constructor() {
    super();
    this.uuid = uuidv4();
  }

  exportJSON(options?: object): string {
    const res = JSON.parse(super.exportJSON(options));
    return JSON.stringify({uuid: this.uuid, ...res});
  }

}

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

  ngOnInit(): void {
    console.log(this.myCanvas);
  }

  ngAfterViewInit(): void {
    paper.setup(this.myCanvas.nativeElement);
    var tool = new paper.Tool();
    var path: paper.Path;

    const insertIntoMap = (path: paper.Path) => {
      const uuid = uuidv4();
      this.uuidToPath.set(uuid, path);
    }

    const x = localStorage.getItem("project");
    if (x)
      paper.project.importJSON(x);

    const publish = () => {
      const proj = paper.project.exportJSON();
      localStorage.setItem("project", proj);
    }
    // Define a mousedown and mousedrag handler
    tool.onMouseDown = function (event: any) {
      path = new MyPath();
      insertIntoMap(path);
      path.strokeColor = new paper.Color('black');
      path.strokeWidth = 5;
      path.strokeJoin = 'round';
      path.strokeCap = 'round';
      path.add(event.point);
    };

    tool.onMouseDrag = function (event: {
      point: paper.Segment | paper.Point | number[];
    }) {
      path.add(event.point);
    };
    tool.onMouseUp = function (event: any) {
      path.simplify(10);
      publish();
    }
  }

  clearPaper() {
    paper.project.clear();
  }
}
