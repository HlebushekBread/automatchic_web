import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FullSubject,
  GradeInfo,
  GradingTypeTranslation,
  PublicityTranslation,
  SubjectService,
} from '../../service/subject-service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskTypeTranslation } from '../../service/task-service';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-subject-preview-component',
  imports: [DatePipe],
  templateUrl: './subject-preview-component.html',
  styleUrl: './subject-preview-component.scss',
})
export class SubjectPreviewComponent implements OnInit {
  private authService = inject(AuthService);
  private subjectService = inject(SubjectService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly isAuthenticated = this.authService.isAuthenticated();

  readonly gradingTypeTranslation = GradingTypeTranslation;
  gradingTypes = Object.keys(this.gradingTypeTranslation);

  readonly publicityTranslation = PublicityTranslation;
  publicities = Object.keys(this.publicityTranslation);

  readonly taskTypeTranslation = TaskTypeTranslation;
  taskTypes = Object.keys(this.taskTypeTranslation);

  readonly gradeInfo = GradeInfo;

  gradeFields: { grade: number; grading: number; hideForCredit: boolean }[] = [];

  errorMessage = signal('');
  subject = signal<FullSubject>({
    id: 0,
    name: '',
    teacher: '',
    description: '',
    gradingType: '',
    gradingMax: 0,
    grading5: 0,
    grading4: 0,
    grading3: 0,
    gradingMin: 0,
    targetGrade: 0,
    publicity: '',
    user: {
      username: '',
      fullName: '',
      group: '',
      role: '',
    },
    tasks: [],
    links: [],
  });

  isAuthorView = computed(
    () => this.authService.getTokenUsername() === this.subject().user.username,
  );

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          return this.subjectService.getById(true, id);
        }),
      )
      .subscribe({
        next: (subject) => {
          if (!subject) {
            this.errorMessage.set('Ошибка получения.');
            return;
          }
          this.subject.set(subject);
          this.gradeFields = [
            { grade: 4, grading: subject.gradingMax, hideForCredit: false },
            { grade: 3, grading: subject.grading5, hideForCredit: false },
            { grade: 2, grading: subject.grading4, hideForCredit: true },
            { grade: 1, grading: subject.grading3, hideForCredit: true },
            { grade: 0, grading: subject.gradingMin, hideForCredit: false },
          ];
          this.errorMessage.set('');
        },
        error: (err: HttpErrorResponse) =>
          this.errorMessage.set(err.error?.message || 'Ошибка доступа'),
      });
  }

  onCopy() {
    this.subjectService.copySubject(this.subject().id).subscribe({
      next: (response) => {
        this.router.navigate(['/subjects/view', response.id]);
      },
    });
  }

  onGoToView() {
    this.router.navigate([this.router.url.replace('browse', 'view')]);
  }

  onLogin() {
    this.router.navigate(['/profile'], {
      queryParams: { next: this.router.url },
    });
  }
}
