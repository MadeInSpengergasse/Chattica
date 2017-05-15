import {Injectable} from "@angular/core";
import {$WebSocket} from "angular2-websocket/angular2-websocket";

@Injectable()
export class ChatService {
  ws = new $WebSocket("ws://127.0.0.1:8080/");

  sendMessage(message: string) {
    this.ws.send(message).subscribe(
      (msg) => {
        console.log("next", msg.data);
      },
      (msg) => {
        console.log("error", msg);
      },
      () => {
        console.log("complete");
      }
    );
  }

  getDataStream() {
    return this.ws.getDataStream();
  }
}
