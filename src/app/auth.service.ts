import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";
import {Status} from "./status";

@Injectable()
export class AuthService {
  isLoggedIn = false;

  constructor(private _http: Http) {

  }

  login(username: string, password: string): Observable<Status> {
    this.isLoggedIn = true;
    console.log("sending post request");
    return this._http.post("/api/login", {username: username, password: password}).map(res => res.json());
  }

  logout() {
    this.isLoggedIn = false;
  }
}
