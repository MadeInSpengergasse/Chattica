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

  isLoggedIn(): boolean {
    return this._authService.isLoggedIn();
  }

  getSession() {
    this._authService.getSession().subscribe(res => {
      console.log(res);
    });
  }

  logout() {
    this._authService.logout()
      .subscribe(res => {
        if (res.status === 'success') {
          this._router.navigate(['']);
        } else {
          alert('ERROR! Message: ' + res.error_message);
        }
      });
  }
}
