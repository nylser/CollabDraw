import * as paper from 'paper';
import {v4} from "uuid";

export class Path extends paper.Path {
  private readonly _uuid: string = v4();
  /*
  constructor(uuid?: string) {
    super();
    if (uuid)
      this._uuid = uuid;
  }*/

  get uuid() {
    return this._uuid
  }
}
