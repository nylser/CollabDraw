import * as paper from 'paper';

export class Pointer {
  private _name: string;
  readonly self: boolean;
  private delegateGroup: paper.Group;
  private pointText: paper.PointText;
  private pointRect: paper.Path.Rectangle;
  private point: paper.Path;
  private targetPoint?: paper.Point;

  constructor(name: string, self: boolean = true) {
    this._name = name;
    this.self = self
    let pointerRect = new paper.Path.Rectangle(new paper.Rectangle(50, 25, 50, 25), new paper.Size(5, 5));
    pointerRect.strokeColor = new paper.Color("black");
    pointerRect.fillColor = new paper.Color("#fff");
    pointerRect.strokeWidth = 1
    let pointer = new paper.PointText(new paper.Point(50, 50));
    let pointerGroup = new paper.Group([pointerRect, pointer])
    pointerGroup.visible = false;
    pointer.fillColor = new paper.Color('black');
    this.delegateGroup = pointerGroup;
    this.pointText = pointer;
    this.pointRect = pointerRect;
    let point = new paper.Path.Circle(new paper.Point(0, 0), 5)
    point.fillColor = new paper.Color("black");
    this.point = point;
    this.handleNewName();
  }

  handlePoint(point: paper.Point) {
    this.targetPoint = point;
    // this.point.bounds.center = point;
    //point = point.subtract(new paper.Point(0, 20));
    //this.delegateGroup.bounds.center = point;
    //if (!this.delegateGroup.visible) {
    //  this.delegateGroup.visible = true
    //}
  }

  setPosition(point: paper.Point) {
    this.point.bounds.center = point;
    point = point.subtract(new paper.Point(0, 20));
    this.delegateGroup.bounds.center = point;
    if (!this.delegateGroup.visible) {
      this.delegateGroup.visible = true
    }
  }

  getPosition() {
    return this.point.bounds.center;
  }

  getTargetPosition() {
    return this.targetPoint;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this.handleNewName();
  }

  private handleNewName(): void {
    this.pointText.content = this.name;
    this.pointRect.bounds.width = this.pointText.bounds.width + 5;
    this.pointRect.bounds.height = this.pointText.bounds.height + 5;
    this.pointText.bounds.center = this.pointRect.bounds.center;
  }
}
