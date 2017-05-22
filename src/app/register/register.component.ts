import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model: any = {};

  constructor(private _authService: AuthService, private _router: Router) { }

  ngOnInit() {
  }

  register() {
    console.log(this.model.username + ' - ' + this.model.password);
    this._authService.register(this.model.username, this.model.password)
      .subscribe(res => {
        console.log(res);
        if (res.status === 'success') {
          this._router.navigate(['login']);
        } else {
          alert('ERROR! Message: ' + res.error_message);
        }
      });
  }

}
