import {Injectable} from '@angular/core';
import {io} from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  URL = "http://localhost:3000"
  socket = io(this.URL, {autoConnect: false});

  constructor() {
    this.socket.onAny((event, ...args) => {
      console.log(event, args);
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
    this.socket.emit("pointer", {pointer})
  }


}
