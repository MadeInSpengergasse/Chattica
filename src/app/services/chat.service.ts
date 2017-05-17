import {Injectable} from '@angular/core';
import {$WebSocket} from 'angular2-websocket/angular2-websocket';

@Injectable()
export class ChatService {
  ws = new $WebSocket('ws://' + location.hostname + ':8080/');

  sendMessage(message: string) {
    this.ws.send(message).subscribe(
      (msg) => {
        console.log('next', msg.data);
      },
      (msg) => {
        console.log('error', msg);
        alert("There was an error with the websockets connection: " + msg);
      },
      () => {
        console.log('complete');
      }
    );
  }

  getDataStream() {
    //FIXME Handle ws disconnect and reconnect (sending works but not receiving)
    return this.ws.getDataStream();
  }
}
