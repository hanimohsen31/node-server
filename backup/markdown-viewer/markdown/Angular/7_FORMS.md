## Template Driven Forms

TS in Component

```tsx
values = [
    {id : 1 , value : "Hani"},
    {id : 2 , value : "Amara"},
    {id : 3 , value : "Monica"},
    {id : 4 , value : "Ahmed"},
  ]

  log(x: any) {
    console.log(x)
  }
  submit(x: any) {
    console.log(x.value)
  }
```

 [#frm2="ngForm"] + [(ngSubmit)="submit(frm2)"] + [ngModelGroup] + [multi Inputs]

```html
<form class="formEx4 mt-3 card flex-wrap flex-row p-3"
    #frm2="ngForm" (ngSubmit)="submit(frm2)">
  <div class="alert alert-success w-100">
    [#frm2="ngForm"] + [(ngSubmit)="submit(frm2)"] + [ngModelGroup]
  </div>

  <div ngModelGroup="student" #student="ngModelGroup" class="w-100">
    <!-- sName -->
    <label class="text-uppercase mt-3" for="sName">sName</label>
    <input class="form-control col-6 mt-3"
      required ngModel #sName="ngModel" name="sName" type="text"/>
    <!-- age -->
    <label class="text-uppercase mt-3" for="age">age</label>
    <input class="form-control col-6 mt-3"
      required ngModel min="20" #age="ngModel" name="age" type="number"/>
  </div>

  <div ngModelGroup="courses" #courses="ngModelGroup" class="w-100">
    <!-- courses -->
    <label class="text-uppercase mt-3" for="courses">courses</label>
    <input class="form-control col-6 mt-3"
      required ngModel #courses="ngModel" name="courses" type="text"/>
  </div>

  <div ngModelGroup="work" #work="ngModelGroup" class="w-100">
    <!-- job -->
    <label class="text-uppercase mt-3" for="job">job</label>
    <input class="form-control col-6 mt-3"
      required ngModel minlength="5" #job="ngModel" name="job" type="text"
      (change)="log(job)"
    />
    <!-- company -->
    <label class="text-uppercase mt-3" for="company">company</label>
    <input class="form-control col-6 mt-3"
      required ngModel #company="ngModel" name="company" type="text"/>
  </div>

  <!-- checkbox -->
  <div class="checkbox mt-3 w-100">
    <input ngModel #isActive="ngModel" name="isActive"
      class="form-check-input me-2" type="checkbox" >
    <label class="text-uppercase" for="checkbox">IS Active</label>
    <span>Value: {{isActive.value}}</span>
  </div>

  <!-- dropdown -->
  <div class="list mt-3 w-100">
    <select ngModel #list="ngModel" name="list"
      class="form-select" aria-label="Default select example">
      <!-- <option *ngFor="let elm of values" [ngValue]="elm">{{elm.value}}</option> -->
      <option *ngFor="let elm of values" [value]="elm.id">{{elm.value}}</option>
    </select>
    <span>Value: {{list.value | json}}</span>
  </div>

  <!-- radio -->
  <div class="radio mt-3 w-100">
    <div class="form-check" *ngFor="let elm of values">
      <input ngModel #radio="ngModel" [value]="elm.id" [id]="elm.id"
        name="radio"class="form-check-input" type="radio" >
      <label class="form-check-label" for="elm.id">{{elm.value}}</label>
    </div>
  </div>

  <!-- alert -->
  <div class="alert alert-danger col-6 mt-3 w-100">
    <span>Please Fill All Fields</span>
    <span *ngIf="!sName.valid && sName.touched">Student Name Required</span>
    <span *ngIf="!age.valid && age.touched">age Should be > 20</span>
    <span *ngIf="!job.valid && job.touched">
      Job Chars Should be > {{job?.['errors']?.['minlength']?.['requiredLength']}}
    </span>
  </div>
  <!-- button -->
  <!-- <button class="submit btn btn-primary mt-3"
    type="submit" [disabled]="!frm2.valid" >Submit</button> -->
  <button class="submit btn btn-primary mt-3" type="submit">Submit</button>
</form>
```

Example to disable if input is empty

```json
<div class="input-holder col-3">
  <label class="main-label">{{ "NationalID" | translate }}</label>
  <input
    class="main-input form-control"
    name="nationalID"
    type="text"
    [(ngModel)]="searchData.appUserSearch.nationalID"
    placeholder="{{ 'NationalID' | translate }}"
    ngModel #nationalID="ngModel"
  />
</div>

<button
  class="btn btn-success button button-green"
  (keyup.enter)="search()"
  (click)="search()"
  [disabled]="!nationalID.value && !requestId.value && !email.value && !phoneNumber.value"
>
  {{ "search" | translate }}
</button>
```

## Reactive Forms

TS in Component

```tsx
values = [
    { id: 1, value: 'Hani' },
    { id: 2, value: 'Amara' },
    { id: 3, value: 'Monica' },
    { id: 4, value: 'Ahmed' },
  ];

  constructor() {}
  ngOnInit(): void {}
  // --------------------------------- Form ---------------------------------
  formx = new FormGroup({
    student: new FormGroup({
      sName: new FormControl(
        '',
        [Validators.required, CustomValidators.CannotContainSpace],
        // async validators out of array
        CustomValidators.ShouldBeUniqe
      ),
      age: new FormControl('', [Validators.required, Validators.min(20)]),
    }),
    courses: new FormGroup({
      courses: new FormControl(),
    }),
    work: new FormGroup({
      job: new FormControl('', [Validators.required, Validators.minLength(3)]),
      company: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    }),
    checkbox: new FormControl('', Validators.required),
    list: new FormControl(''),
    emails: new FormArray([]),
    radio: new FormControl('', Validators.required),
  });

  get formxAlerts() {
    let alerts = {
      sName:
        this.formx.get('student.sName')?.touched &&
        this.formx.get('student.sName')?.invalid,
      sNameSpace:
        this.formx.get('student.sName')?.touched &&
        this.formx.get('student.sName')?.errors?.['CannotContainSpace'],
      sNameUniqe:
        this.formx.get('student.sName')?.touched &&
        this.formx.get('student.sName')?.errors?.['ShouldBeUniqe'],
      sNamePending: this.formx.get('student.sName')?.pending,
      age:
        this.formx.get('student.age')?.touched &&
        this.formx.get('student.age')?.invalid,
      ageMin: this.formx.get('student.age')?.errors?.['min']?.['min'],
    };
    return alerts;
  }
  // --------------------------------- FormArray ---------------------------------
  get emailGetter() {
    return (this.formx.get('emails') as FormArray).controls;
  }

  addEmail() {
    const emails = this.formx.get('emails') as FormArray;
    emails.push(new FormControl(''));
  }

  removeEmail(index: number) {
    const emails = this.formx.get('emails') as FormArray;
    emails.removeAt(index);
  }
  // ----------------------------------- submit -----------------------------------
  submit() {
    // console.log(this.formx.get('student.sName')?.errors);
    // console.log(this.formxAlerts);
    console.log(this.formx);
    console.log("invalid?: ",this.formx.invalid);
  }
```

# HTML in Component

```html
<form class="formEx4 my-3 card flex-wrap flex-row p-3"
  [formGroup]="formx" (ngSubmit)="submit()">

  <div class="w-100" formGroupName="student">
    <!-- sName -->
    <label class="text-uppercase mt-3" for="sName">sName</label>
    <input class="form-control col-6 mt-3" formControlName="sName" type="text"/>
    <!-- age -->
    <label class="text-uppercase mt-3" for="age">age</label>
    <input class="form-control col-6 mt-3" formControlName="age" type="number"/>
  </div>

  <div class="w-100" formGroupName="courses">
    <!-- courses -->
    <label class="text-uppercase mt-3" for="courses">courses</label>
    <input class="form-control col-6 mt-3" formControlName="courses" type="text"/>
  </div>

  <div class="w-100" formGroupName="work">
    <!-- job -->
    <label class="text-uppercase mt-3" for="job">job</label>
    <input class="form-control col-6 mt-3" formControlName="job" type="text"/>
    <!-- company -->
    <label class="text-uppercase mt-3" for="company">company</label>
    <input class="form-control col-6 mt-3" formControlName="company" type="text"/>
  </div>

  <!-- checkbox -->
  <div class="checkbox mt-3 w-100">
    <input class="form-check-input me-2" formControlName="checkbox" type="checkbox" >
    <label class="text-uppercase" for="checkbox">IS Active</label>
  </div>

  <!-- dropdown -->
  <div class="list mt-3 w-100">
    <label class="text-uppercase" for="checkbox">Select Input</label>
    <select class="form-select" formControlName="checkbox">
      <!-- <option *ngFor="let elm of values"
        [ngValue]="elm">{{elm.value}}</option> -->
      <option *ngFor="let elm of values" [value]="elm.id">{{elm.value}}</option>
    </select>
  </div>

  <!-- radio -->
  <div class="radio mt-3 w-100 card p-2">
    <div class="form-check" *ngFor="let elm of values">
      <input class="form-check-input" formControlName="radio"
        type="radio" [value]="elm.id" [id]="elm.id" >
      <label class="form-check-label" for="elm.id">{{elm.value}}</label>
    </div>
  </div>

  <!-- FormArray -->
    <div class="w-100" formArrayName="emails">
      <div class="formArray row mt-3"
        *ngFor="let elm of emailGetter; let i = index;">
        <input class="form-control col-8" [formControlName]="i"/>
        <button class="btn btn-danger col-3"
          type="button" (click)="removeEmail(i)">Remove</button>
      </div>
    </div>
    <button class="btn btn-primary col-12 mt-3"
      type="button" (click)="addEmail()">Add Email</button>

  <!-- alert -->
  <div class="alert alert-danger col-6 mt-3 w-100"
    *ngIf="formx.touched && formx.invalid" >
    <span>Please Fill All Fields</span>
    <span *ngIf="formxAlerts?.sName">Student Name Required</span>
    <span *ngIf="formxAlerts?.sNameSpace">Name Has Space</span>
    <span *ngIf="formxAlerts?.sNameUniqe">Name Not Uniqe</span>
    <span *ngIf="formxAlerts?.sNamePending">Checking ....</span>
    <span *ngIf="formxAlerts?.age">age Should be Valid</span>
    <span *ngIf="formxAlerts?.ageMin">
      age Should be > {{formxAlerts.ageMin}}
    </span>
  </div>
  <!-- button -->
  <button class="submit btn btn-primary mt-3" type="submit">Submit</button>
</form>
```

# custom.validators.ts

```tsx
import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static CannotContainSpace(control: AbstractControl): ValidationErrors | null {
    if ((control.value as string).indexOf(' ') >= 0) {
      return {
        CannotContainSpace: true,
        requiredLength: 10,
        actualLength: control.value.length,
      };
    } else {
      return null;
    }
  }

  static ShouldBeUniqe(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (control.value === 'mosh') resolve({ ShouldBeUniqe: true });
        else resolve(null);
      }, 500);
    });
  }
}
```

خلّينا نفك **Reactive Forms methods** في Angular بهدوء وبمنطق، من غير حشو ولا تعقيد مصطنع. دي من الحاجات اللي بتفرق فعلًا بين شغل “يمشي” وشغل **نضيف وقابل للتوسع**.

---

## الصورة الكبيرة الأول

Reactive Forms مبنية على 3 كائنات أساسية:

- `FormControl`
- `FormGroup`
- `FormArray`

كل واحد منهم وارث من `AbstractControl`، وده السبب إن **معظم الـ methods مشتركة بينهم**.

---

## أهم الـ methods (اللي بتستخدمها فعليًا في الشغل)

### 1. `setValue()`

يغيّر القيمة **لازم كل الحقول تكون موجودة**.

```tsx
this.form.setValue({
  name: 'Hani',
  age: 30
});

```

لو نسيت field → Angular هيزعق (Error).

يُستخدم لما تحب strict correctness.

---

### 2. `patchValue()`

يغيّر **جزء** من الفورم.

```tsx
this.form.patchValue({
  name: 'Hani'
});

```

أكتر استخدامًا في الواقع.

لو عندك API response جزئي → ده اختيارك.

---

### 3. `reset()`

يرجع الفورم لحالة البداية.

```tsx
this.form.reset();

```

أو بقيم جديدة:

```tsx
this.form.reset({
  name: '',
  age: null
});

```

مهم: reset كمان بيرجع `pristine` و `untouched`.

---

### 4. `get()`

تجيب control معين (حتى لو nested).

```tsx
this.form.get('name');
this.form.get('address.street');

```

لو رجعت `null` → يا إما الاسم غلط يا إما الفورم لسه متبنيش.

---

### 5. `disable()` / `enable()`

تعطيل أو تفعيل control.

```tsx
this.form.get('name')?.disable();
this.form.get('name')?.enable();

```

ملاحظة مهمة:

- الـ disabled fields **مش بتدخل في `form.value`**
- لكنها بتدخل في `getRawValue()`

---

### 6. `markAsTouched()` / `markAsUntouched()`

تتحكم في عرض الـ validation errors.

```tsx
this.form.markAllAsTouched();

```

دي تستخدمها قبل submit علشان تظهر الأخطاء.

---

### 7. `updateValueAndValidity()`

تعيد حساب الـ validation يدويًا.

```tsx
this.form.get('age')?.updateValueAndValidity();

```

تحتاجها لما:

- تغيّر validators runtime
- تعتمد validation على field تاني

---

### 8. `setValidators()` / `addValidators()` / `clearValidators()`

```tsx
control.setValidators([Validators.required]);
control.addValidators(Validators.minLength(5));
control.clearValidators();
control.updateValueAndValidity();

```

⚠️ تنبيه مهم:

بعد أي تغيير validators → لازم `updateValueAndValidity()`

---

### 9. `hasError()` / `getError()`

```tsx
this.form.get('email')?.hasError('required');

```

مفيدة في الـ template أو logic معقد شوية.

---

### 10. `valueChanges` و `statusChanges`

دي مش methods لكن Observables مهمة جدًا.

```tsx
this.form.valueChanges.subscribe(value => {
  console.log(value);
});

```

استخدامات ذكية:

- auto-save
- dynamic validation
- enable/disable fields

⚠️ مهم:

ما تنساش unsubscribe أو `takeUntil`.

---

## Methods خاصة بـ FormArray

### `push()`

```tsx
this.items.push(new FormControl(''));

```

### `removeAt(index)`

```tsx
this.items.removeAt(0);

```

### `clear()`

يمسح كل العناصر.

---

## Properties لازم تبقى في دماغك

مش methods بس مهمة جدًا:

- `value`
- `valid / invalid`
- `touched / untouched`
- `dirty / pristine`
- `errors`

---

## أخطاء شائعة (خلّيك قاسي مع نفسك هنا)

- استخدام `setValue` بدل `patchValue` → crashes
- نسيان `updateValueAndValidity`
- الاشتراك في `valueChanges` من غير unsubscribe
- التعامل مع `disabled` fields على إنهم جزء من `form.value`

---

## الخلاصة العقلانية

Reactive Forms مش “API للحفظ”

دي **state machine** مصغرة لإدارة input معقد، validation، وسيناريوهات ديناميكية.

اللي يتقن methods دي، Angular بالنسبة له بيبقى أداة مش عبء.

المرحلة اللي بعدها المنطق الطبيعي:

- Dynamic Forms
- Cross-field validation
- Custom Validators
- Typed Reactive Forms (Angular 14+)

وده تطور منطقي، مش رفاهية.