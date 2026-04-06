import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { AuthForm } from './auth-form/auth-form';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user-service';

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
  timeLeft = signal('');

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
    this.userService.checkEnabledSelf().subscribe({
      next: (response) => {
        this.isEnabled.set(response);
      },
    });
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
        this.timeLeft.set('Письмо отправлено');
      },
      error: () => {
        this.timeLeft.set('Подождите 3 минуты');
      },
    });
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
