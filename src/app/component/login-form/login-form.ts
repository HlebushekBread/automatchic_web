import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth-service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  private authService = inject(AuthService);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Данные формы:', this.loginForm.value);

      this.authService
        .login({
          username: this.loginForm.value.username || '',
          password: this.loginForm.value.password || '',
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            window.location.reload();
          },
          error: () => {},
        });
    }
  }

  logout() {
    console.log('Выход...');

    this.authService.logout();
    window.location.reload();
  }

  isAuth = signal(this.authService.isAuthenticated());
  text = signal(this.authService.getTokenAuthorities());
}
