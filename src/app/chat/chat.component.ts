import {Component, OnDestroy, OnInit} from '@angular/core';
import {ChatService} from '../services/chat.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  currentMessage: string;
  private _subscription: Subscription;

  constructor(private _chatService: ChatService) {
    console.log('constructor');
  }

  ngOnInit() {
    console.log('ngOnInit()');
    this._subscription = this._chatService.getDataStream().subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
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

  getChatMessages() {
    return this._chatService.chatMessages;
  }
}
