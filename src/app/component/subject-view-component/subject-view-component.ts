import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import {
  FullSubject,
  GradeInfo,
  GradingTypeTranslation,
  PublicityTranslation,
  SubjectDto,
  SubjectService,
} from '../../service/subject-service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Task, TaskService, TaskTypeTranslation } from '../../service/task-service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-subject-view-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './subject-view-component.html',
  styleUrl: './subject-view-component.scss',
})
export class SubjectViewComponent implements OnInit {
  protected readonly Math = Math;

  private taskService = inject(TaskService);
  private subjectService = inject(SubjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private changeDetector = inject(ChangeDetectorRef);

  readonly gradingTypeTranslation = GradingTypeTranslation;
  gradingTypes = Object.keys(this.gradingTypeTranslation);

  readonly publicityTranslation = PublicityTranslation;
  publicities = Object.keys(this.publicityTranslation);

  readonly taskTypeTranslation = TaskTypeTranslation;
  taskTypes = Object.keys(this.taskTypeTranslation);

  readonly gradeInfo = GradeInfo;

  readonly gradeFields = [
    { control: 'gradingMax', grade: 4 },
    { control: 'grading5', grade: 3 },
    { control: 'grading4', grade: 2, hideForCredit: true },
    { control: 'grading3', grade: 1, hideForCredit: true },
    { control: 'gradingMin', grade: 0 },
  ];

  errorMessage = signal('');

  subjectForm!: FormGroup;
  tasks = signal<Task[]>([]);
  savedSubject = signal<SubjectDto>({
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
  });

  ngOnInit() {
    this.subjectForm.disable();
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          return this.subjectService.getById(false, id);
        }),
      )
      .subscribe({
        next: (subject) => {
          if (!subject) {
            this.errorMessage.set('Ошибка получения.');
            return;
          }
          this.errorMessage.set('');
          this.patchSubjectForm(subject);
          this.adjustFields();
          this.savedSubject.set(this.subjectForm.getRawValue());
          this.tasks.set(subject.tasks);
          this.taskForms.clear();
          subject.tasks.forEach((task) => {
            this.taskForms.push(this.createTaskForm(task));
          });
          this.updateCurrentScore();
        },
        error: (err: HttpErrorResponse) =>
          this.errorMessage.set(err.error?.message || 'Ошибка доступа'),
      });
  }

  constructor() {
    this.subjectForm = this.formBuilder.group(
      {
        id: [null, [Validators.required]],
        name: [null, [Validators.required]],
        teacher: [null],
        description: [null],
        gradingType: [null, [Validators.required]],
        gradingMax: [null],
        grading5: [null],
        grading4: [null],
        grading3: [null],
        gradingMin: [null],
        targetGrade: [null, [Validators.required]],
        publicity: [null, [Validators.required]],
      },
      {
        validators: [this.gradingValidator.bind(this)],
      },
    );
  }

  readonly errorMapping: Record<number, string> = {
    4: 'max_lt_5',
    3: '5_lt_4',
    2: '4_lt_3',
    1: '3_lt_min',
    0: 'min_lt_0',
  };

  private gradingValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const v = group.value;
    const checks = [
      { upper: v.gradingMax, lower: v.grading5, key: 'max_lt_5' },
      { upper: v.grading5, lower: v.grading4, key: '5_lt_4' },
      { upper: v.grading4, lower: v.grading3, key: '4_lt_3' },
      { upper: v.grading3, lower: v.gradingMin, key: '3_lt_min' },
      { upper: v.gradingMin, lower: 0, key: 'min_lt_0' },
    ];

    const errors: ValidationErrors = {};
    let hasError = false;

    for (const check of checks) {
      if (Number(check.upper) < Number(check.lower)) {
        errors[check.key] = true;
        hasError = true;
      }
    }

    return hasError ? { gradingChain: errors } : null;
  };

  private patchSubjectForm(subject: FullSubject | SubjectDto) {
    this.subjectForm.patchValue({
      id: subject.id,
      name: subject.name,
      teacher: subject.teacher,
      description: subject.description,
      gradingType: subject.gradingType,
      gradingMax: subject.gradingMax,
      grading5: subject.grading5,
      grading4: subject.grading4,
      grading3: subject.grading3,
      gradingMin: subject.gradingMin,
      targetGrade: subject.targetGrade,
      publicity: subject.publicity,
    });
  }

  //Это работает только с https
  /*
  onCopyLink() {
    const url = window.location.href;

    navigator.clipboard
      .writeText(url.replace('view', 'browse'))
      .then(() => {
        console.log('Ссылка скопирована!');
      })
      .catch((err) => {
        console.error('Ошибка копирования:', err);
      });
  }
  */

  //А эта хтонь работает и для http
  onCopyLink() {
    const url = window.location.href;
    const textToCopy = url.replace('view', 'browse');

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => console.log('Ссылка скопирована (Modern API)!'))
        .catch((err) => console.error('Ошибка копирования:', err));
    } else {
      this.unsecuredCopyToClipboard(textToCopy);
    }
  }

  private unsecuredCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('Ссылка скопирована (Fallback)!');
      } else {
        console.error('Не удалось скопировать текст');
      }
    } catch (err) {
      console.error('Ошибка в fallback-методе:', err);
    }

    document.body.removeChild(textArea);
  }
  //Снести неописуемый ужас сверху при переходе на https

  isEdit = signal(false);

  onEdit() {
    this.isEdit.set(true);
    this.subjectForm.enable();
  }

  onSubmit() {
    this.adjustFields();
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const formValue = this.subjectForm.getRawValue();
    this.isEdit.set(false);
    this.subjectForm.disable();

    this.subjectService.saveSubject(formValue).subscribe({
      next: () => {
        this.savedSubject.set(formValue);
        this.patchSubjectForm(formValue);
      },
    });
  }

  onCancel() {
    this.isEdit.set(false);
    this.patchSubjectForm(this.savedSubject());
    this.adjustFields();
    this.subjectForm.disable();
  }

  isDeleteModalOpen = signal(false);

  onDelete() {
    this.isEdit.set(false);
    this.subjectForm.disable();
    this.subjectService.deleteSubject(this.subjectForm.getRawValue().id).subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.router.navigate(['/subjects/view']);
      },
      error: () => {},
    });
  }

  switchPublicity(value: string) {
    this.subjectForm.patchValue({ publicity: value });
  }

  isGradingTypeCredit = signal(false);

  adjustFields() {
    const rawValues = this.subjectForm.getRawValue();
    const isCredit = rawValues.gradingType === 'CREDIT';

    this.isGradingTypeCredit.set(isCredit);

    const gradingMax = Math.max(0, Number(rawValues.gradingMax || 0));
    const grading5 = Math.max(0, Number(rawValues.grading5 || 0));
    const grading4 = Math.max(0, Number(rawValues.grading4 || 0));
    const grading3 = Math.max(0, Number(rawValues.grading3 || 0));
    const gradingMin = Math.max(0, Number(rawValues.gradingMin || 0));

    const updates = {
      gradingMax: gradingMax,
      grading5: grading5,
      grading4: grading4,
      grading3: grading3,
      gradingMin: gradingMin,
    };

    if (isCredit) {
      if (rawValues.targetGrade === 1 || rawValues.targetGrade === 2) {
        this.subjectForm.patchValue({ targetGrade: 3 });
      }
      updates.grading4 = updates.grading5;
      updates.grading3 = updates.grading5;
    }

    this.subjectForm.patchValue(updates);
  }

  // -------------------------------------------------------------- //

  private createTaskForm(task?: Task): FormGroup {
    const now = new Date();
    const subjectId = untracked(() => this.savedSubject()?.id);
    const group = this.formBuilder.group({
      id: [task?.id || 0, [Validators.required]],
      name: [task?.name || 'Название', [Validators.required]],
      dueDate: [task?.dueDate || now.toISOString().split('T')[0] + 'T00:00', [Validators.required]],
      receivedGrade: [task?.receivedGrade || 0, [Validators.required, Validators.min(0)]],
      maxGrade: [task?.maxGrade || 0, [Validators.required, Validators.min(0)]],
      gradeWeight: [task?.gradeWeight || 1, [Validators.required, Validators.min(0)]],
      type: [task?.type || 'HOMEWORK', [Validators.required]],
      position: [task?.position || this.taskForms.length, [Validators.required]],
      subjectId: [subjectId, [Validators.required]],
    });

    group.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      )
      .subscribe(() => {
        const index = this.taskForms.controls.indexOf(group);
        if (index !== -1 && group.valid) {
          this.onSaveTask(index);
        }
      });

    return group;
  }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.taskForms.controls, event.previousIndex, event.currentIndex);

    this.updateTasksPositions();

    const positionUpdates = this.taskForms.controls.map((control, index) => {
      const group = control as FormGroup;
      group.patchValue({ position: index }, { emitEvent: false });

      return {
        id: group.getRawValue().id,
        position: index,
      };
    });

    console.log(positionUpdates);

    this.taskService.updateTaskPositions(positionUpdates).subscribe({
      next: () => {},
      error: () => {
        moveItemInArray(this.taskForms.controls, event.currentIndex, event.previousIndex);
      },
    });
  }

  taskGroup = this.formBuilder.group({
    taskForms: this.formBuilder.array<FormGroup>([]),
  });

  get taskForms() {
    return this.taskGroup.controls.taskForms;
  }

  updateTasksPositions() {
    this.taskForms.controls.forEach((control, index) => {
      control.patchValue({ position: index }, { emitEvent: false });
    });
  }

  currentScore = signal(0);

  private updateCurrentScore() {
    const total = this.taskForms.controls.reduce((sum, control) => {
      const raw = control.getRawValue();
      return sum + (Number(raw.receivedGrade) || 0) * (Number(raw.gradeWeight) || 1);
    }, 0);
    this.currentScore.set(total);
  }

  getMaxGradeSum(): number {
    return this.taskForms.controls.reduce((sum, control) => {
      const raw = control.getRawValue();
      return sum + (Number(raw.maxGrade) || 0) * (Number(raw.gradeWeight) || 1);
    }, 0);
  }

  recalculate() {
    const maxGrade = this.getMaxGradeSum();
    this.subjectForm.patchValue({ gradingMax: maxGrade });
    const raw = this.subjectForm.getRawValue();
    if (raw.grading5 > raw.gradingMax) {
      this.subjectForm.patchValue({ grading5: maxGrade });
    }
    if (raw.grading4 > raw.gradingMax) {
      this.subjectForm.patchValue({ grading4: maxGrade });
    }
    if (raw.grading3 > raw.gradingMax) {
      this.subjectForm.patchValue({ grading3: maxGrade });
    }
    if (raw.gradingMin > raw.gradingMax) {
      this.subjectForm.patchValue({ gradingMin: maxGrade });
    }
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    this.adjustFields();
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const formValue = this.subjectForm.getRawValue();
    this.subjectService.saveSubject(formValue).subscribe({
      next: () => {
        this.savedSubject.set({
          ...this.savedSubject(),
          gradingMax: formValue.gradingMax,
          grading5: formValue.grading5,
          grading4: formValue.grading4,
          grading3: formValue.grading3,
          gradingMin: formValue.gradingMin,
        });
        this.patchSubjectForm(formValue);
      },
    });
  }

  currentGrade = computed(() => {
    const savedV = this.savedSubject();
    if (!savedV) return 0;

    const score = this.currentScore();
    if (score >= savedV.gradingMax) return 6;
    if (score >= savedV.grading5) return 5;
    if (score >= savedV.grading4) return 4;
    if (score >= savedV.grading3) return 3;
    if (score >= savedV.gradingMin) return 2;
    return 1;
  });

  missingScore = computed(() => {
    const v = this.savedSubject();
    if (!v) return 0;

    const gradings = [
      Number(v.gradingMin) || 0,
      Number(v.grading3) || 0,
      Number(v.grading4) || 0,
      Number(v.grading5) || 0,
      Number(v.gradingMax) || 0,
    ];

    const targetValue = gradings[v.targetGrade] || 0;
    return Math.max(0, targetValue - this.currentScore());
  });

  onAddTask() {
    if (this.taskForms.length >= 20) {
      console.log('Максимум 20 задач на предмет');
      return;
    }

    const newGroup = this.createTaskForm();
    newGroup.patchValue({ position: this.taskForms.length });

    console.log(newGroup.getRawValue());

    this.taskService.saveTask(newGroup.getRawValue()).subscribe({
      next: (response) => {
        newGroup.patchValue({ id: response.id });
        this.taskForms.push(newGroup);
        this.updateTasksPositions();
        this.changeDetector.markForCheck();
      },
      error: (err) => {
        console.error('Не удалось добавить задачу:', err);
      },
    });
  }

  onSaveTask(index: number) {
    const group = this.taskForms.at(index);
    if (this.taskForms.at(index).invalid) {
      this.taskForms.at(index).markAllAsTouched();
      return;
    }
    const taskData = group.getRawValue();
    console.log(taskData);
    this.taskService.saveTask(taskData).subscribe({
      next: () => {
        this.updateCurrentScore();
      },
    });
  }

  onDeleteTask(index: number) {
    const group = this.taskForms.at(index);
    const id = group.getRawValue().id;

    console.log('Удаление:', id);

    if (id) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.taskForms.removeAt(index);
          this.updateCurrentScore();
          this.updateTasksPositions();
          this.changeDetector.markForCheck();
        },
      });
    }
  }
}
