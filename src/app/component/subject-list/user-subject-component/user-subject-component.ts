import { Component, computed, input } from '@angular/core';
import {
  GradeInfo,
  GradingTypeTranslation,
  PublicityTranslation,
  Subject,
} from '../../../service/subject-service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskTypeTranslation } from '../../../service/task-service';

@Component({
  selector: 'app-user-subject-component',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './user-subject-component.html',
  styleUrl: './user-subject-component.scss',
})
export class UserSubjectComponent {
  protected readonly Math = Math;

  readonly gradingTypeTranslation = GradingTypeTranslation;
  readonly taskTypeTranslation = TaskTypeTranslation;
  readonly publicityTranslation = PublicityTranslation;

  readonly gradeInfo = GradeInfo;

  subject = input.required<Subject>();

  upcomingTasks = computed(() => {
    const now = new Date();

    return this.subject()
      .tasks.filter((task) => new Date(task.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);
  });

  getCurrentScore(): number {
    return this.subject().tasks.reduce(
      (sum, task) => sum + (Number(task.receivedGrade) || 0) * (Number(task.gradeWeight) || 1),
      0,
    );
  }

  getMissingScore(): number {
    const score = this.getCurrentScore();
    const subject = this.subject();

    if (subject.targetGrade == 4) return subject.gradingMax - score;
    if (subject.targetGrade == 3) return subject.grading5 - score;
    if (subject.targetGrade == 2) return subject.grading4 - score;
    if (subject.targetGrade == 1) return subject.grading3 - score;
    if (subject.targetGrade == 0) return subject.gradingMin - score;
    return 0;
  }

  getCurrentGrade(): number {
    const score = this.getCurrentScore();
    const subject = this.subject();

    if (score >= subject.gradingMax) return 6;
    if (score >= subject.grading5) return 5;
    if (score >= subject.grading4) return 4;
    if (score >= subject.grading3) return 3;
    if (score >= subject.gradingMin) return 2;
    if (score >= 0) return 1;
    return 0;
  }
}
