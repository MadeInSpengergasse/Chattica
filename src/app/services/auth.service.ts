import {Injectable} from "@angular/core";
import {Http} from "@angular/http";

import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";
import {User} from "../models/user";
import {Status} from "../models/status";

@Injectable()
export class AuthService {
  isLoggedIn = false;
  user: User;

  constructor(private _http: Http) {

  }

  login(username: string, password: string): Observable<Status<null>> {
    this.isLoggedIn = true;
    console.log("sending post request");
    return this._http.post("/api/login", {username: username, password: password}).map(res => res.json());
  }

  logout(): Observable<Status<null>> {
    this.isLoggedIn = false;
    this.user = null;
    return this._http.post("/api/logout", {}).map(res => res.json());
  }

  getSession(): Observable<Status<User>> {
    return this._http.get("/api/session", null).map(res => res.json());
  }
}
