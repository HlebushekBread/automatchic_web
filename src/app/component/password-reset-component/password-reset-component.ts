import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-reset-component',
  imports: [FormsModule],
  templateUrl: './password-reset-component.html',
  styleUrl: './password-reset-component.scss',
})
export class PasswordResetComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  token = signal('');
  newPassword = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.token.set(token);
    } else {
      console.error('Токен отсутствует в URL');
      this.router.navigate(['/profile']);
    }
  }

  errorMessage = signal('');

  onReset(password: string) {
    if (password.length >= 6) {
      this.authService.resetPassword({ token: this.token(), password: password }).subscribe({
        next: () => {
          this.errorMessage.set('');
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.errorMessage.set(error.error.message);
        },
      });
    }
  }
}
