## 1) What is a Decorator?

ال Decorator هو **function خاصة في TypeScript** بتضيف **metadata** على class أو property أو method.

ال Angular بيستخدم الـ metadata دي علشان يفهم:

- ده Component ولا Service؟
- ده Input ولا Output؟
- إزاي يعمل Dependency Injection؟
- إزاي يربط class بالـ template؟

Decorator **مش logic**

Decorator = وصف للكود

مثال بسيط:

```tsx
@Component({
selector:'app-user',
template:`<p>User</p>`
})
exportclassUserComponent {}
```

ال Angular يقرأ الـ metadata ويفهم:

> ده component، له selector، وله template
> 

## 2) What is a Decorator Types?

خلّينا نقسمهم تقسيم interview واضح:

---

### 1) Class Decorators

بتتحط فوق class.

أهمهم:

- `@Component`
- `@Directive`
- `@Pipe`
- `@Injectable`
- `@NgModule`

مثال:

```tsx
@Injectable()
exportclassUserService {}
```

---

### 2) Property Decorators

بتتحط فوق properties.

أشهرهم:

- `@Input()`
- `@Output()`
- `@ViewChild()`
- `@ContentChild()`
- `@HostBinding()`

مثال:

```tsx
@Input() userId!:number;
```

---

### 3) Method Decorators

بتتحط فوق methods.

أهمهم:

- `@HostListener()`

مثال:

```tsx
@HostListener('click')
onClick() {}
```

---

### 4) Parameter Decorators

بتتحط على constructor parameters.

أشهرهم:

- `@Inject()`
- `@Optional()`
- `@Self()`
- `@SkipSelf()`
- `@Host()`

مثال:

```tsx
constructor(@Optional()privatelogger:LoggerService) {}
```

## 3) What is a **Annotation and Metadata**?

خلّينا نضبط المصطلح الأول علشان مايحصلش خلط في interview 👇

في Angular / TypeScript:

- **Annotation** = مصطلح عام (concept)
- **Metadata** = البيانات نفسها
- **Decorator** = الأداة اللي بتضيف الـ metadata

يعني الثلاثة مرتبطين، لكن مش نفس الحاجة.

---

### يعني إيه Metadata؟

**ال Metadata** معناها:

> بيانات بتوصف الكود، مش الكود نفسه.
> 

مثال حياتي:

- الصورة = الكود
- تاريخ التصوير + الكاميرا = metadata

في Angular:

```tsx
@Component({
selector:'app-user',
template:`<p>User</p>`
})
exportclassUserComponent {}
```

الـ metadata هنا:

- selector
- template

ال Angular بيقرأها علشان يعرف **يتعامل مع الكلاس إزاي**.

---

### يعني إيه Annotation؟

**ال Annotation** هو مصطلح مفاهيمي قديم (جاي من Java أساسًا)

معناه:

> إضافة معلومات توضيحية على الكود من غير ما تغيّر تنفيذه المباشر.
> 

في Angular:

- لما حد يقول *annotation*
- هو غالبًا يقصد **decorator + metadata**

يعني:

> Annotation = idea
> 
> 
> Decorator = implementation
> 
> Metadata = data
> 

---

### يعني إيه Decorator (الخلاصة العملية)؟

ال Decorator هو **function** بتتنفذ وقت الـ build / runtime

وتضيف metadata للكلاس أو للـ property.

ال Angular بيعتمد على decorators علشان:

- يعمل DI
- يربط template
- يحدد lifecycle
- يفهم العلاقات بين الكلاسات

---

### مثال يلمّ التلاتة مع بعض

```tsx
@Injectable({providedIn:'root' })
exportclassAuthService {}
```

- `@Injectable` → Decorator
- `{ providedIn: 'root' }` → Metadata
- الفكرة كلها → Annotation

---

### ليه Angular محتاج Metadata أصلاً؟

من غير metadata:

- ال Angular مش هيعرف ده component ولا service
- مش هيعرف يحقن dependencies
- مش هيعرف يربط HTML بالـ class

ال Metadata = خريطة التعليمات بتاعة Angular.

---

### إجابة Interview قصيرة جدًا:

> Metadata is additional information that describes how Angular should process a class.
> 
> 
> An annotation is a general concept of attaching metadata to code, and in Angular this is implemented using decorators.
>