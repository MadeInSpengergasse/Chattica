import {Component, OnInit} from '@angular/core';
import {ChatService} from '../services/chat.service';
import {ChatMessage} from '../models/chatmessage';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  currentMessage: string;
  chatMessages: ChatMessage[] = [];

  constructor(private _chatService: ChatService) {
  }

  ngOnInit() {
    // this.chatMessages = [];
    this._chatService.getDataStream()
      .subscribe(a => {
        const data = JSON.parse(a.data) as ChatMessage;
        console.log('new event from ws');
        console.log(data);
        this.chatMessages.push(data);
      });
  }

  sendMessage() {
    if (this.currentMessage) {
      console.log(this.currentMessage);
      this._chatService.sendMessage(this.currentMessage);
    } else {
      console.log('Not sending empty message.');
    }
    this.currentMessage = '';
  }
}
