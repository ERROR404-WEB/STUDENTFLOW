import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient);
  private url = environment.baseUrl;

  constructor() { }

  login(postData: { email: string, password: string }) {
    return this.http.post(`${this.url}/api/auth/login`, postData);
  }
}
