import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  name = '';
  email = '';
  password = '';

  constructor(
    private signupService: SignupService,
    private router: Router
  ) { }

  signup() {
    const payload = {
      name: this.name,
      email: this.email,
      password: this.password,
    };

    this.signupService.agentSignup(payload).subscribe({
      next: (response: any) => {
        if (response.user) {
          this.router.navigate(['applications']);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}