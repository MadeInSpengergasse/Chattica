import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {User} from '../models/user';
import {Status} from '../models/status';

@Injectable()
export class AuthService {
  private loggedIn = false;
  user: User;

  constructor(private _http: Http) {

  }

  login(username: string, password: string): Observable<Status<null>> {
    console.log('sending post request');
    return this._http.post('/api/login', {username: username, password: password})
      .map(res => <Status<null>>res.json())
      .map((res) => {
        if (res.status === 'success') {
          this.loggedIn = true;
          this.user = res.data;
        }
        return res;
      });
  }

  logout(): Observable<Status<null>> {
    this.loggedIn = false;
    this.user = null;
    return this._http.post('/api/logout', {}).map(res => res.json());
  }

  register(username: string, password: string): Observable<Status<null>> {
    console.log('AuthService: register');
    return this._http.post('/api/register', {username: username, password: password})
      .map(res => <Status<null>>res.json())
      .map((res) => {
        return res;
      });
  }

  getSession(): Observable<Status<null>> {
    return this._http.get('/api/session', null)
      .map(res => <Status<User>>res.json())
      .map((res) => {
        console.log('getSession()');
        if (res.status === 'success') {
          this.loggedIn = true;
          this.user = res.data;
        }
        return res;
      });
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }
}
