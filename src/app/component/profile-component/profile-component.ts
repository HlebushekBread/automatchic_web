import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { AuthForm } from './auth-form/auth-form';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user-service';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile-component',
  imports: [AuthForm, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);

  readonly isAuthenticated = signal(this.authService.isAuthenticated());
  readonly tokenUsername = signal(this.authService.getTokenUsername());
  readonly tokenFullName = signal(this.authService.getTokenFullName());
  readonly tokenGroup = signal(this.authService.getTokenGroup());

  isEnabled = signal(false);
  warningMessage = signal('');
  timeLeft = '';

  userForm!: FormGroup;
  savedUser = signal<{ fullName: string; group: string }>({
    fullName: '',
    group: '',
  });

  ngOnInit() {
    this.userForm.disable();
    this.userForm.patchValue({
      fullName: this.tokenFullName(),
      group: this.tokenGroup(),
    });
    this.savedUser.set(this.userForm.getRawValue());
    if (this.authService.isAuthenticated()) {
      this.userService.checkEnabledSelf().subscribe({
        next: (response) => {
          this.isEnabled.set(response);
        },
      });
    }
  }

  constructor() {
    this.userForm = this.formBuilder.group({
      fullName: [null],
      group: [null],
    });
  }

  onResend() {
    this.authService.resendConfirm().subscribe({
      next: () => {
        this.warningMessage.set('Письмо отправлено');
      },
      error: (error: HttpErrorResponse) => {
        if (error.status == 409) {
          this.warningMessage.set('Уже подтвержден');
          window.location.reload();
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

  private timerId?: ReturnType<typeof setInterval>;
  isResendDisabled = signal(false);

  startCountdown(seconds: number) {
    this.isResendDisabled.set(true);

    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      seconds--;

      if (seconds <= 0) {
        this.warningMessage.set('');
        this.isResendDisabled.set(false);
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

  isEdit = signal(false);

  onEdit() {
    this.isEdit.set(true);
    this.userForm.enable();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    this.isEdit.set(false);
    this.userForm.disable();

    this.userService.saveUser(formValue).subscribe({
      next: (response) => {
        this.savedUser.set(formValue);
        this.userForm.patchValue(formValue);
        this.authService.doLoginUser(response);
      },
    });
  }

  onCancel() {
    this.isEdit.set(false);
    this.userForm.patchValue(this.savedUser());
    this.userForm.disable();
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

  isDeleteModalOpen = signal(false);

  onDelete() {
    this.isEdit.set(false);
    this.userForm.disable();
    this.userService.deleteSelf().subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.logout();
      },
      error: () => {},
    });
  }
}
