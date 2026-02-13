## 1) What is a Directive in Angular?

ال Directive هي **class بتضيف سلوك (behavior)** لعنصر موجود في الـ DOM، من غير ما تكون مسؤولة عن view كاملة.

> A directive in Angular is a class that adds behavior to DOM elements.
> 
> 
> Angular provides three types of directives: components, structural directives that change the DOM structure, and attribute directives that change the appearance or behavior of an element.
> 
> A component is essentially a directive with a template.
> 

بمعنى بسيط:

- Component = *what to render*
- Directive = *how an element behaves*

Directive بتشتغل على:

- عنصر HTML
- أو Component
- وبتغيّر شكله أو سلوكه أو وجوده

## 2) What is a Directive Types?

ال Angular عنده **3 أنواع أساسية**:

---

**1) Component Directives**

وده نوع خاص من directives — وكل Component هو Directive لكن العكس مش صحيح.

الفرق الأساسي:

- عنده template
- بيرندر UI

مثال:

```tsx
@Component({
selector:'app-user',
template:`<p>User works!</p>`
})
exportclassUserComponent {}
```

---

**2) Structural Directives**

بتتحكم في **بنية الـ DOM نفسها** (تضيف / تشيل عناصر).

بتستخدم الرمز `*` (syntactic sugar).

أمثلة:

- `ngIf`
- `ngFor`
- `ngSwitch`

مثال:

```html
<div *ngIf="isLoggedIn">Welcome</div>
```

تحت الغطاء:

```html
<ng-template [ngIf]="isLoggedIn">
<div>Welcome</div>
</ng-template>
```

نقطة interview:

> Structural directives modify the DOM structure.
> 

---

**3) Attribute Directives**

بتغيّر **شكل أو سلوك عنصر موجود** بدون ما تشيله من الـ DOM.

أمثلة:

- `ngClass`
- `ngStyle`
- custom directives

مثال:

```html
<pappHighlight>Text</p>
```

Directive:

```tsx
@Directive({
selector:'[appHighlight]'
})
exportclassHighlightDirective {
constructor(privateel:ElementRef) {
this.el.nativeElement.style.background ='yellow';
  }
}
```

## 3) Compare Between Directive and Components?

**Component:**

- Directive + Template
- مسؤول عن UI
- بيعمل render
- ليه lifecycle كامل
- يستخدم كـ HTML element

**Directive:**

- مفيش template
- بيضيف behavior
- بيشتغل على عنصر موجود
- مش مسؤول عن layout

جملة Interview ذهبية:

> A component is a directive with a template.
> 

---

رابعًا: إمتى أستخدم Component وإمتى Directive؟

- لو عايز ترندر UI جديد → **Component**
- لو عايز تضيف سلوك لعنصر موجود → **Directive**
- لو بتكرر نفس logic على عناصر مختلفة → **Directive**
- لو عندك layout مستقل → **Component**