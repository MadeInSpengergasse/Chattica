import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};

  constructor(private _authService: AuthService) { }

  ngOnInit() {
  }

  login() {
    // TODO Form validation!
    console.log("should be logging in now.");
    console.log(this.model.username);
    console.log(this.model.password);
    this._authService.login(this.model.username, this.model.password)
      .subscribe(res => {
        console.log(res);

      });
  }

}
