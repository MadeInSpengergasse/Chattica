import {Component, OnInit} from '@angular/core';
import {AuthService} from './services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Chattica';

  constructor(private _authService: AuthService, private _router: Router) {
  }

  ngOnInit(): void {
    this.getSession();
  }

  getSession() {
    this._authService.getSession()
      .subscribe(res => {
        console.log('getSession()');
        console.log(res);
        if (res.status === 'success') {
          this._authService.isLoggedIn = true;
          this._authService.user = res.data;
        }
      });
  }

  logout() {
    this._authService.logout()
      .subscribe(res => {
        if (res.status === 'success') {
          this._router.navigate(['']);
        } else {
          alert('ERRROR! Message: ' + res.error_message);
        }
      });
  }
}
