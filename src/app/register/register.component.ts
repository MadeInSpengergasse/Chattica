import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model: any = {};

  constructor(private _authService: AuthService) { }

  ngOnInit() {
  }

  register() {
    console.log(this.model.username + ' - ' + this.model.password);
    this._authService.register(this.model.username, this.model.password)
      .subscribe(res => {
        console.log(res);
      });
  }

}
