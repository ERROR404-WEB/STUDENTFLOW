import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {

  private http = inject(HttpClient);
  private url = environment.baseUrl;

  constructor() { }

  getUsers() {
    return this.http.get(`${this.url}/api/users`);
  }

  getUserById(id: string) {
    return this.http.get(`${this.url}/api/users/${id}`);
  }

  createUser(userData: any) {
    return this.http.post(`${this.url}/api/users`, userData);
  }

  updateUser(id: string, userData: any) {
    return this.http.patch(`${this.url}/api/users/${id}`, userData);
  }

  toggleUserStatus(id: string, isActive: boolean) {
    return this.http.patch(`${this.url}/api/users/${id}/status`, { isActive });
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.url}/api/users/${id}`);
  }
}
