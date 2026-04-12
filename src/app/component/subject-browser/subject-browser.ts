import { Component, computed, inject, signal } from '@angular/core';
import { GradingTypeTranslation, SubjectService } from '../../service/subject-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BrowserSubjectComponent } from './browser-subject-component/browser-subject-component';

@Component({
  selector: 'app-subject-browser',
  imports: [FormsModule, BrowserSubjectComponent],
  templateUrl: './subject-browser.html',
  styleUrl: './subject-browser.scss',
})
export class SubjectBrowser {
  private subjectService = inject(SubjectService);

  gradingTypeTranslation = GradingTypeTranslation;
  gradingTypes = Object.keys(this.gradingTypeTranslation);

  searchQuery = signal('');
  selectedType = signal('all');

  isShowFilters = signal(false);

  subjectList = toSignal(this.subjectService.getPublicSubjects(), { initialValue: [] });

  getAbbreviation(text: string): string {
    if (!text) return '';
    return text
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  normalize = (text: string) => text.toLowerCase().replace(/[.\s-]/g, '');

  filteredSubjects = computed(() => {
    const query = this.normalize(this.searchQuery());
    const type = this.selectedType();
    const subjects = this.subjectList();

    if (!query && type === 'all') return subjects;

    return subjects.filter((subject) => {
      const matchesType = type === 'all' || subject.gradingType === type;

      if (!matchesType) return false;
      if (!query) return true;

      const searchTarget = [
        subject.name,
        this.getAbbreviation(subject.name),
        subject.teacher,
        this.getAbbreviation(subject.teacher),
        subject.user.fullName,
        subject.user.username,
        subject.user.group,
      ]
        .map(this.normalize)
        .join('|');

      return searchTarget.includes(query);
    });
  });
}
