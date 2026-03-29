import { Routes } from '@angular/router';
import { ProfileComponent } from './component/profile-component/profile-component';
import { SubjectList } from './component/subject-list/subject-list';
import { authGuard } from './util/auth.guard';
import { SubjectViewComponent } from './component/subject-view-component/subject-view-component';
import { SubjectPreviewComponent } from './component/subject-preview-component/subject-preview-component';

export const routes: Routes = [
  {
    path: 'profile',
    pathMatch: 'full',
    component: ProfileComponent,
  },
  {
    path: 'subjects/browse',
    pathMatch: 'full',
    component: SubjectList,
    data: { mode: 'browse' },
  },
  {
    path: 'subjects/view',
    pathMatch: 'full',
    component: SubjectList,
    canActivate: [authGuard],
    data: { mode: 'view' },
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
];
