import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { LoginService } from './login.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, DividerModule, InputTextModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {


  email: string = '';
  password: string = '';

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  onLogin() {

    const postData = {
      email: this.email,
      password: this.password
    }

    this.loginService.login(postData).subscribe({
      next: (res: any) => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          this.router.navigate(['application-form']);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onSignup() {
    this.router.navigate(['agent-signup']);
  }

}
