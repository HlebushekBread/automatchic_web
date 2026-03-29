import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './user-service';
import { Task } from './task-service';

export const GradingTypeTranslation: Record<string, string> = {
  CREDIT: 'Зачет',
  GRADE: 'Оценка',
  EXAM: 'Экзамен',
};

export const PublicityTranslation: Record<string, string> = {
  PRIVATE: 'Приватный',
  PUBLIC: 'Публичный',
};

export const GradeInfo: Record<
  number,
  {
    translation: string;
    compactTranslation: string;
    thresholdTranslation: string;
    color: string;
    text: string;
  }
> = {
  6: {
    translation: 'Максимум',
    compactTranslation: '+',
    thresholdTranslation: 'max',
    color: 'var(--grade-max)',
    text: 'var(--text-light)',
  },
  5: {
    translation: '5',
    compactTranslation: '5',
    thresholdTranslation: '5',
    color: 'var(--grade-5)',
    text: 'var(--text-dark)',
  },
  4: {
    translation: '4',
    compactTranslation: '4',
    thresholdTranslation: '4',
    color: 'var(--grade-4)',
    text: 'var(--text-light)',
  },
  3: {
    translation: '3',
    compactTranslation: '3',
    thresholdTranslation: '3',
    color: 'var(--grade-3)',
    text: 'var(--text-dark)',
  },
  2: {
    translation: 'Порог',
    compactTranslation: '2',
    thresholdTranslation: 'min',
    color: 'var(--grade-min)',
    text: 'var(--text-light)',
  },
  1: {
    translation: 'Меньше порога',
    compactTranslation: '-',
    thresholdTranslation: '-',
    color: 'var(--grade-less)',
    text: 'var(--text-light)',
  },
  0: {
    translation: '-',
    compactTranslation: '-',
    thresholdTranslation: '-',
    color: 'var(--grade-less)',
    text: 'var(--text-light)',
  },
};

export interface Subject {
  id: number;
  name: string;
  teacher: string;
  description: string;
  gradingType: string;
  gradingMax: number;
  grading5: number;
  grading4: number;
  grading3: number;
  gradingMin: number;
  targetGrade: number;
  publicity: string;
  user: User;
  tasks: Task[];
  links: Link[];
}

export interface SubjectDto {
  id: number;
  name: string;
  teacher: string;
  description: string;
  gradingType: string;
  gradingMax: number;
  grading5: number;
  grading4: number;
  grading3: number;
  gradingMin: number;
  targetGrade: number;
  publicity: string;
}

export interface Link {
  id: number;
  name: string;
  fullLink: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private http = inject(HttpClient);

  getById(preview: boolean, id: number): Observable<Subject> {
    if (preview) {
      return this.http.get<Subject>(`${environment.apiUrl}/subjects/preview/${id}`);
    } else {
      return this.http.get<Subject>(`${environment.apiUrl}/subjects/view/${id}`);
    }
  }

  getPublicSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${environment.apiUrl}/subjects/public`);
  }

  getUserSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${environment.apiUrl}/subjects/user`);
  }

  saveSubject(data: SubjectDto): Observable<{ id: number }> {
    return this.http.put<{ id: number }>(`${environment.apiUrl}/subjects/save`, data);
  }

  copySubject(id: number): Observable<{ id: number }> {
    return this.http.get<{ id: number }>(`${environment.apiUrl}/subjects/copy/${id}`);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/subjects/delete/${id}`);
  }
}
