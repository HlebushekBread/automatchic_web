import { Component, inject, input } from '@angular/core';
import { BasicSubject, GradingTypeTranslation } from '../../../service/subject-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-browser-subject-component',
  imports: [RouterLink],
  templateUrl: './browser-subject-component.html',
  styleUrl: './browser-subject-component.scss',
})
export class BrowserSubjectComponent {
  private router = inject(Router);

  readonly gradingTypeTranslation = GradingTypeTranslation;

  subject = input.required<BasicSubject>();
}
