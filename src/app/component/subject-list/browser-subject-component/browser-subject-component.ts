import { Component, inject, input } from '@angular/core';
import { GradingTypeTranslation, Subject } from '../../../service/subject-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browser-subject-component',
  imports: [],
  templateUrl: './browser-subject-component.html',
  styleUrl: './browser-subject-component.scss',
})
export class BrowserSubjectComponent {
  private router = inject(Router);

  readonly gradingTypeTranslation = GradingTypeTranslation;

  subject = input.required<Subject>();
}
