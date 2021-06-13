import * as paper from 'paper';
import {v4} from "uuid";

export function buildPath(): paper.Path {
  const p = new paper.Path();
  p.data.uuid = v4();
  return p;
}
