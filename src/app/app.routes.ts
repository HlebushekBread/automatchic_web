import { Routes } from '@angular/router';
import { ProfileComponent } from './component/profile-component/profile-component';
import { SubjectList } from './component/subject-list/subject-list';
import { authGuard } from './util/auth.guard';
import { SubjectViewComponent } from './component/subject-view-component/subject-view-component';
import { SubjectPreviewComponent } from './component/subject-preview-component/subject-preview-component';
import { EmailConfirmComponent } from './component/email-confirm-component/email-confirm-component';
import { PasswordResetComponent } from './component/password-reset-component/password-reset-component';
import { HomePage } from './component/home-page/home-page';
import { SubjectBrowser } from './component/subject-browser/subject-browser';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePage,
  },
  {
    path: 'profile',
    pathMatch: 'full',
    component: ProfileComponent,
  },
  {
    path: 'subjects/browse',
    pathMatch: 'full',
    component: SubjectBrowser,
  },
  {
    path: 'subjects/view',
    pathMatch: 'full',
    component: SubjectList,
    canActivate: [authGuard],
  },
  {
    path: 'subjects/browse/:id',
    pathMatch: 'full',
    component: SubjectPreviewComponent,
  },
  {
    path: 'subjects/view/:id',
    pathMatch: 'full',
    component: SubjectViewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'confirm',
    component: EmailConfirmComponent,
  },
  {
    path: 'reset',
    component: PasswordResetComponent,
  },
];
