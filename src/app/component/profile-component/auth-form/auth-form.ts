import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth-service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-auth-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth-form.html',
  styleUrl: './auth-form.scss',
})
export class AuthForm {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    fullName: new FormControl(''),
    group: new FormControl(''),
  });

  errorMessage = signal('');
  isRegisterMode = signal(false);

  onLogin() {
    const returnUrl = this.route.snapshot.queryParams['next'];
    this.errorMessage.set('');
    if (this.loginForm.valid) {
      this.authService
        .login({
          username: this.loginForm.value.username || '',
          password: this.loginForm.value.password || '',
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParams['next'];
            if (returnUrl) {
              window.location.href = returnUrl;
            } else {
              window.location.reload();
            }
          },
          error: () => {
            this.errorMessage.set('Неверные данные');
          },
        });
    }
  }

  onRegister() {
    this.errorMessage.set('');
    if (this.loginForm.valid) {
      this.authService
        .register({
          username: this.loginForm.value.username || '',
          password: this.loginForm.value.password || '',
          fullName: this.loginForm.value.fullName || '',
          group: this.loginForm.value.group || '',
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParams['next'];
            if (returnUrl) {
              window.location.href = returnUrl;
            } else {
              window.location.reload();
            }
          },
          error: (error: HttpErrorResponse) => {
            this.errorMessage.set(error.error?.message || 'Ошибка сервера');
          },
        });
    }
  }

  warningMessage = signal('Отправить письмо');

  onForgotPassword() {
    if (this.loginForm.value.username) {
      this.authService.forgotPassword(this.loginForm.value.username).subscribe({
        next: () => {
          this.warningMessage.set('Письмо отправлено');
        },
        error: (error: HttpErrorResponse) => {
          if (error.status == 404) {
            this.warningMessage.set('Пользователя не существует');
          } else if (error.status == 429) {
            const timeMatch = error.error.message.match(/\d{2}:\d{2}/);
            if (timeMatch) {
              const [minutes, seconds] = timeMatch[0].split(':').map(Number);
              const totalSeconds = minutes * 60 + seconds;
              this.startCountdown(totalSeconds + 1);
            }
          }
        },
      });
    }
  }

  private timerId?: ReturnType<typeof setInterval>;
  isResetDisabled = signal(false);

  startCountdown(seconds: number) {
    this.isResetDisabled.set(true);

    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      seconds--;

      if (seconds <= 0) {
        this.warningMessage.set('Отправить письмо');
        this.isResetDisabled.set(false);
        clearInterval(this.timerId);
        return;
      }

      const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');

      this.warningMessage.set(`Повторите через: ${m}:${s}`);
    }, 1000);
  }
}
