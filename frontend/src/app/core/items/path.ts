import * as paper from 'paper';
import {v4} from "uuid";

export class Path extends paper.Path {
  private _uuid: string = v4();

  exportJSON(options?: object): string {
    return JSON.stringify({uuid: this._uuid, path: super.exportJSON(options)});
  }

  importJSON(json: string): paper.Item {
    const superior = JSON.parse(json);
    this._uuid = superior.uuid
    super.importJSON(superior.path);
    return this;
  }

  get uuid() {
    return this._uuid
  }

}
