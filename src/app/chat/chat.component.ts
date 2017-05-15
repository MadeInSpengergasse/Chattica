import {Component, OnInit} from "@angular/core";
import {ChatService} from "../services/chat.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  chatMessage: string;

  constructor(private _chatService: ChatService) {
  }

  ngOnInit() {
    this._chatService.getDataStream()
      .subscribe(a => {
        console.log("new event from ws");
        console.log(a);
      });
  }

  sendMessage() {
    console.log(this.chatMessage);
    this._chatService.sendMessage(this.chatMessage);
  }

}
