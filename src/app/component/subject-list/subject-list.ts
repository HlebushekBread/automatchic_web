import { Component, computed, inject, signal } from '@angular/core';
import {
  GradingTypeTranslation,
  PublicityTranslation,
  SubjectService,
} from '../../service/subject-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserSubjectComponent } from '../subject-list/user-subject-component/user-subject-component';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [FormsModule, UserSubjectComponent],
  templateUrl: './subject-list.html',
  styleUrl: './subject-list.scss',
})
export class SubjectList {
  private subjectService = inject(SubjectService);
  private router = inject(Router);

  subjectList = toSignal(this.subjectService.getUserSubjects(), { initialValue: [] });

  gradingTypeTranslation = GradingTypeTranslation;
  gradingTypes = Object.keys(this.gradingTypeTranslation);

  publicityTranslation = PublicityTranslation;
  publicities = Object.keys(this.publicityTranslation);

  searchQuery = signal('');
  selectedType = signal('all');
  selectedPublicity = signal('all');

  isShowFilters = signal(false);
  isCreateModalOpen = signal(false);
  newSubjectTitle = signal('');

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
    const publicity = this.selectedPublicity();
    const subjects = this.subjectList();

    if (!query && type === 'all' && publicity === 'all') return subjects;

    return subjects.filter((subject) => {
      const matchesType = type === 'all' || subject.gradingType === type;
      const matchesPublicity = publicity === 'all' || subject.publicity === publicity;

      if (!matchesType || !matchesPublicity) return false;
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

  onCreate(name: string) {
    this.subjectService
      .saveSubject({
        id: 0,
        name: name || 'Название',
        teacher: '',
        description: '',
        gradingType: 'GRADE',
        gradingMax: 0,
        grading5: 0,
        grading4: 0,
        grading3: 0,
        gradingMin: 0,
        targetGrade: 0,
        publicity: 'PUBLIC',
      })
      .subscribe({
        next: (response) => {
          this.isCreateModalOpen.set(false);
          this.router.navigate(['/subjects/view', response.id]);
        },
      });
  }
}
