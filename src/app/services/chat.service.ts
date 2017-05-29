import {Injectable} from '@angular/core';
import {$WebSocket} from 'angular2-websocket/angular2-websocket';
import {ChatMessage} from '../models/chatmessage';

@Injectable()
export class ChatService {
  private ws = new $WebSocket('ws://' + location.hostname + ':8080/');
  chatMessages: ChatMessage[] = [];

  sendMessage(message: string) {
    this.ws.send(message).subscribe(
      (msg) => {
        console.log('next', msg.data);
      },
      (msg) => {
        console.log('error', msg);
        alert('There was an error with the websockets connection: ' + msg);
      },
      () => {
        console.log('complete');
      }
    );
  }

  getDataStream() {
    // FIXME Handle ws disconnect and reconnect (sending works but not receiving)
    return this.ws.getDataStream()
      .map(a => {
        const data = JSON.parse(a.data) as ChatMessage;
        console.log('new event from ws');
        console.log(data);
        this.chatMessages.push(data);
      });
  }
}
