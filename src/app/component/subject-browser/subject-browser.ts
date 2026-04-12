import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  BasicSubject,
  GradingTypeTranslation,
  SubjectService,
} from '../../service/subject-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BrowserSubjectComponent } from './browser-subject-component/browser-subject-component';
import { catchError, debounceTime, map, of, scan, switchMap, tap } from 'rxjs';

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
  currentPage = signal(0);

  isShowFilters = signal(false);

  constructor() {
    effect(() => {
      this.searchQuery();
      this.selectedType();
      untracked(() => {
        this.currentPage.set(0);
        this.hasMore.set(true);
      });
    });
  }

  private params$ = toObservable(
    computed(() => ({
      query: this.searchQuery(),
      gradingType: this.selectedType(),
      page: this.currentPage(),
    })),
  );

  loadMore() {
    this.currentPage.update((page) => page + 1);
  }

  loading = signal(false);
  hasMore = signal(true);

  subjectList = toSignal(
    this.params$.pipe(
      debounceTime(300),
      tap(() => this.loading.set(true)),
      switchMap((p) =>
        this.subjectService.getPublicSubjects(p.query, p.gradingType, p.page).pipe(
          map((newData: BasicSubject[]) => {
            if (newData.length < 12) this.hasMore.set(false);
            return { newData, page: p.page };
          }),
          catchError(() => of({ newData: [] as BasicSubject[], page: p.page })),
          tap(() => this.loading.set(false)),
        ),
      ),
      scan((acc, { newData, page }) => {
        return page === 0 ? newData : [...acc, ...newData];
      }, [] as BasicSubject[]),
    ),
    { initialValue: [] },
  );
}
