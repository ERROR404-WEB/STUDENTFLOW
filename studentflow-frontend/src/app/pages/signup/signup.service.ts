import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private http = inject(HttpClient);
  private url = environment.baseUrl;

  constructor() { }

  agentSignup(postData: { name: string, email: string, password: string }) {
    return this.http.post(`${this.url}/api/auth/agent-signup`, postData);
  }

}
