import {Injectable} from '@angular/core';
import {io} from "socket.io-client";
import {BehaviorSubject, Subject} from "rxjs";
import {Path} from "../items/path";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  URL = "http://192.168.178.35:3000"
  socket = io(this.URL, {autoConnect: false});

  userSubject = new BehaviorSubject([]);
  pointerUpdates = new Subject();
  pathUpdates: Subject<{pathJSON: string, uuid: string, type: string}> = new Subject()

  constructor() {
    this.socket.onAny((event, ...args) => {
    })
    this.socket.on("users", (users) =>  {
      this.userSubject.next(users);
    })
    this.socket.on("path", (path) => {
      this.pathUpdates.next(path);
    })
    this.socket.on("pointer", (pointer) => {
      this.pointerUpdates.next(pointer);
    })
  }

  public connectWithUserName(username: string) {
    this.socket.auth = {username};
    this.socket.connect();
  }

  public setUserName(username: string) {
    this.socket.emit("username_change", {username})
  }

  public emitPosition(pointer: paper.Point) {
    //this.socket.emit("pointer", {x: pointer.x, y: pointer.y})
  }

  public emitPath(path: Path, type: string) {
    this.socket.emit("path", {pathJSON: path.exportJSON(), uuid: path.uuid, type})
  }



}
