# Angular

## **1) What is Angular?**

- a TypeScript-based,
- open-source web application framework
- developed and maintained by Google.
- used to build dynamic, scalable, and complex single-page applications (SPAs) using a component-based

## **2) What is NPM?**

- NPM (Node Package Manager) is the default package manager for Node.js.
- It’s used to install, manage, and share JavaScript libraries and tools.
- In Angular, NPM is used to install Angular packages, third-party libraries, and manage project dependencies through `package.json`.

## **3) What is Angular CLI?**

- Angular CLI (Command Line Interface) is a tool that helps developers create, build, test, and maintain Angular applications.
- It provides commands to generate components, services, modules, run development servers, build production bundles, and run tests with best practices baked in.

## **4) Explain the Architecture of Angular**

- Angular follows a **component-based architecture**.
- The core building blocks are:
  - Modules (NgModules): organize the application into cohesive blocks.
  - Components: control views and handle UI logic.
  - Templates: HTML with Angular syntax.
  - Services: contain reusable business logic.
  - Dependency Injection (DI): provides services to components efficiently.
  - Router: handles navigation between views.
  - Change Detection: keeps the view in sync with the data.

## **5) What is a Single-Page Application (SPA)?**

- صفحة HTML واحدة بتتغير Dynamically لكل ال updates اللى بتحصل فى ال Routing بدون تحميل الصفحة مرة تانية
- الميزة الاساسية السرعة فى التصفح

## **6) How does Angular implement Single-Page Applications?**

- باستخدام ال Router Module

## **7) What is Angular Ivy?**

- Angular Ivy is Angular’s rendering and compilation engine introduced in Angular 9.
- It improves build size, compilation speed, debugging, and enables better tree-shaking.
- With Ivy, each component is compiled independently, which improves performance and flexibility.

## **8) What is AOT (Ahead-of-Time Compilation)?**

- AOT is a compilation process where Angular templates and TypeScript code are compiled into JavaScript during the build time instead of runtime.

AOT Pros:

- Faster application startup
- Smaller bundle size
- Better security (no template compilation in the browser)
- Early detection of template errors

## **9) What is JIT (Just-in-Time Compilation)?**

- **Concept**
  - Normally, TypeScript code in Angular is **transpiled to JavaScript**, but templates (`.html`) and decorators (`@Component`) need to be turned into executable JS.
  - **JIT compilation** does this **in the browser**, when the app is running.
  - The compiler reads your Angular templates and metadata, then generates the JavaScript needed to render components **on the fly**.
- **How it works**
  1. You run the Angular app in development mode.
  2. Angular’s **compiler runs in the browser**.
  3. Components, templates, and modules are **compiled into JS** dynamically.
  4. The app starts running immediately after compilation.
- **Pros**
  - Faster build process during development (no need for a separate AOT step).
  - Easier debugging because the compiled JS is closer to the original TypeScript.
  - Useful for rapid prototyping.
- **Cons**
  - Slower app startup, because compilation happens in the browser.
  - Larger bundle size (compiler included in the final JS).
  - Not ideal for production apps (AOT is preferred for performance).
- **Example**

```ts
// in main.ts file (JIT mode)
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

- `platformBrowserDynamic()` triggers **JIT compilation**.
- For AOT, you’d use `platformBrowser()` instead and precompile templates during build.

## **10) What is Vite?**

- اداة Vite هو <b>**build tool و dev server حديث**</b>، اتعمل علشان يحل مشاكل البطء في الأدوات القديمة زي Webpack.

> Vite is a modern build tool that provides extremely fast development servers using native ES modules.

> Angular historically relied on Webpack, but modern Angular versions use Vite for development to improve startup time and HMR, while still using Angular’s own build system for production builds.

النتيجة:

- اصبح ال Startup شبه فوري
- اصبح Hot Module Replacement (HMR) سريع جدًا
- تجربة تطوير أخف وأذكى

Angular 17+:

- **Dev server**: Vite
- **Production build**: still Angular own build system (not Vite pure)

رابعًا: الفرق الجوهري بين Vite والحاجات القديمة

**Webpack (القديم):**

- بيعمل bundle لكل حاجة من أول ثانية
- Startup تقيل
- Config معقد
- Powerful بس overkill

**Vite (الحديث):**

- No bundling in dev
- On-demand loading
- Minimal config
- Extremely fast feedback loop

تشبيه بسيط:

Webpack = تطبخ كل الأكل قبل ما الضيوف يوصلوا

Vite = تطبخ اللي اتطلب بس، وقت ما اتطلب

## **11) What is Tree Shaking?**

- مصطلح Tree Shaking هو **process بيشيل الكود غير المستخدم (dead code)** من الـ final bundle أثناء الـ build.

> Tree Shaking is a build optimization technique that removes unused code from the final bundle using static analysis of ES modules.

> Angular supports tree shaking since early versions, but it became highly effective starting from Angular 9 with Ivy, and it’s best optimized in Angular 17 and above.

## **12) How Does Angular Works?**

**Angular يبدأ من:**

1. `main.ts`
2. Bootstrapping
3. Root component
4. Change detection
5. Rendering

إيه هو `main.ts`؟

`main.ts` هو **entry point** للتطبيق.

فيه Angular بيبدأ يشتغل:

```tsx
bootstrapApplication(AppComponent);
```

أو قديمًا:

```tsx
platformBrowserDynamic().bootstrapModule(AppModule);
```

الفرق بين **Bootstrap Module** و **Bootstrap Component**

**Bootstrap Module (قديم):**

```tsx
bootstrapModule(AppModule);
```

- AppModule بيحدد component البداية

```tsx
bootstrap: [AppComponent];
```

**Bootstrap Component (حديث):**

```tsx
bootstrapApplication(AppComponent);
```

- No Module
- Component هو نقطة البداية

الخلاصة:

> Modern Angular bootstraps components, not modules.

ازاي Angular بيرندر التطبيق؟

باختصار ذكي:

- ينشئ ال Angular component tree
- يعمل dependency injection
- يربط template بالـ data
- يشغل change detection
- يحدث الـ DOM

## **13) What is DI?**

- هو نمط او اسلوب يستخدم فى البرمجة يسمح بعمل Services/Functions/Logic اقدر استخدمه فى اماكن تانية بدون تكرار للكود
- وبيتم تطبيق ال Concept فى ال Angular من خلال Services اللي بيتم انشاءها ب Injector + Provider
- ايضا Angular يتيح خاصية Hierarchical DI واللى بتسمح بعمل Provide علي مستويا مختلفة داخل ال Application

## **14) What is Singleton?**

ال Singleton هو **design pattern** معناه:

> يكون عندك instance واحدة بس من object في التطبيق كله.

في ال Angular:

- الـ services غالبًا **Singletons**
- نفس الـ instance بتتشارك بين كل components

مثال:

```tsx
@Injectable({providedIn:'root' })
exportclassAuthService {}
```

ده معناه:

- ال Angular هيعمل instance واحدة
- متاحة في كل التطبيق

## **15) Angular Lazy loading?**

- لا يتم تحميل العناصر الا عند الحاجة اليها سواء Modules او Components

**قديم (NgModules):**

```tsx
{
path:'users',
loadChildren:() =>
import('./users/users.module').then(m => m.UsersModule)
}
```

**حديث (Standalone Components):**

```tsx
{
path:'users',
loadComponent:() =>
import('./users/users.component').then(c => c.UsersComponent)
}
```

## **16) Angular LifeCycle?**

**Lifecycle Hooks Overview**

Angular components and directives go through **lifecycle stages** from creation → rendering → destruction. Hooks allow you to **tap into these stages**.

| Hook                      | When it runs                                          | Typical use case                              |
| ------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| **ngOnChanges**           | Before ngOnInit, whenever @Input() changes            | Respond to input changes                      |
| **ngOnInit**              | Once, after first ngOnChanges                         | Initialization logic                          |
| **ngDoCheck**             | Every change detection cycle                          | Custom change detection logic                 |
| **ngAfterContentInit**    | After content projected via ng-content is initialized | Access projected content                      |
| **ngAfterContentChecked** | After every check of projected content                | React to projected content changes            |
| **ngAfterViewInit**       | After component’s view & child views are initialized  | Access @ViewChild/@ViewChildren safely        |
| **ngAfterViewChecked**    | After every check of component’s view & child views   | Respond to changes in view children           |
| **ngOnDestroy**           | Before component is destroyed                         | Cleanup (unsubscribe, remove event listeners) |

---

**Key Senior-level Points**

1. **ngOnChanges** runs **before ngOnInit** if there are inputs.
2. **ngDoCheck** is **heavy**, only use if needed for custom detection.
3. **ngAfterContentInit / ngAfterContentChecked** → only for projected content.
4. **ngAfterViewInit / ngAfterViewChecked** → only for template view children (@ViewChild).
5. **ngOnDestroy** → always clean subscriptions to prevent memory leaks.
6. Hooks execution order:

- **On changes** + **DoCheck** happen **every CD cycle**
- **AfterContentChecked** + **AfterViewChecked** happen **every CD cycle** too

---

**Quick Visual Flow**

```
Component Creation
│
├─ ngOnChanges
├─ ngOnInit
├─ ngDoCheck
├─ ngAfterContentInit
├─ ngAfterContentChecked
├─ ngAfterViewInit
└─ ngAfterViewChecked
Component Updates
│
├─ ngOnChanges (if @Input changes)
├─ ngDoCheck
├─ ngAfterContentChecked
└─ ngAfterViewChecked
Component Destruction
└─ ngOnDestroy

```

## **17) What is Zone.js? What is Zoneless Mode?**

1. **Zone.js في Angular**

- الAngular أصلاً اعتمدت على `zone.js` من أول يوم علشان **تعرف إمتى تعمل Change Detection**.

**اللي بيحصل مع zone.js:**

- بيراقب كل الـ async tasks (promises, setTimeout, events, HTTP)
- أول ما أي حاجة async تخلص → Angular يشغّل الـ change detection تلقائيًا
- الـ developer مش محتاج يعمل `detectChanges()` يدويًا معظم الوقت

**مميزات:**

- كل التغييرات بتظهر فورًا في UI
- تجربة development سهلة

**عيوب:**

- performance overhead خصوصًا في التطبيقات الكبيرة
- بعض async tasks ممكن يعملوا multiple triggers → unnecessary CD
- debugging أحيانًا صعب بسبب interception

---

2. **Zoneless Angular (Angular 16+)**

- ال Angular دلوقتي بدأ يدعم **Zoneless mode**، خصوصًا مع Signals:

**الفكرة:**

- ال Angular **مش بيعتمد على zone.js** لمراقبة كل async
- لازم الـ developer يكون مسؤول عن **تحديث الـ UI** (change detection) يدويًا
- الـ Signals بتقوم بـ fine-grained reactivity → تغييرات state محددة بس اللي بت trigger CD

**مميزات Zoneless:**

- تنتج performance أعلى → أقل overhead
- predictable change detection
- granular control → تقدر تختار إيه يتغير وإيه لأ
- مفيد لتطبيقات ضخمة أو high-performance UIs

**عيوب:**

- لازم تفهم CD triggers كويس
- لازم تستخدم Signals أو `markForCheck()` / `detectChanges()` يدويًا
- ممكن تحس بثقل في البداية لو عايز تدير كل شيء يدوي

---

3. الفرق الجوهري (Senior-level understanding)

| Aspect                      | Zone.js                      | Zoneless Angular                   |
| --------------------------- | ---------------------------- | ---------------------------------- |
| Change detection triggering | Automatic for any async task | Manual or fine-grained via Signals |
| Performance                 | Some overhead                | Minimal overhead                   |
| Developer control           | Low                          | High                               |
| Complexity                  | Easy to start                | More explicit, need discipline     |
| Best for                    | Small to medium apps         | Large/high-performance apps        |

**جملة Interview ذهبية:**

> Zone.js automates change detection but adds overhead; Zoneless Angular gives fine-grained control and better performance, especially with Signals.

## **18) Zone.js vs Zoneless Angular?**

**A) Zone.js**

- Default mechanism
- Monkey-patches async tasks (Promises, setTimeout, HTTP)
- Triggers **automatic CD** after each async event

**B) Zoneless**

- No monkey-patching
- Angular relies on **manual triggers**: `ApplicationRef.tick()` or `NgZone.run()`
- Used for high-performance apps or frameworks integration

---

**Manual Change Detection**

Sometimes you need **manual triggering**:

```tsx
import { ChangeDetectorRef } from '@angular/core';

constructor(private cd: ChangeDetectorRef) {}

update() {
  this.data.value = 42;
  this.cd.detectChanges(); // manually triggers CD
}

```

- `detectChanges()` → updates current component + children
- `markForCheck()` → marks OnPush component for next CD cycle

---

**CD Flow Diagram (Simplified)**

```
Event occurs (click, timer, HTTP) → Angular Zone
         │
         v
Trigger Change Detection
         │
Component Tree Traversal
         ├─ Default: check all components recursively
         └─ OnPush: check only components with Input change / events / Observables emit
         │
Update DOM if necessary

```

---

**Senior-level Tips**

1. Use **OnPush** wherever possible → improves performance
2. Avoid **mutating objects** with OnPush → always return new object
3. Use `trackBy` in \*ngFor → reduces unnecessary DOM updates
4. Use `async` pipe → automatically triggers CD for Observables
5. Understand **manual CD triggers** for Zoneless / advanced cases

## **19) Change Detection In Angular?**

**مفهوم Change Detection**

- ال Change Detection في Angular هو **الميكانيزم اللي بيخلي UI يتحدث تلقائيًا عندما تتغير البيانات في Component أو Template**.
- ال Angular **يراقب state** و **updates the DOM** تلقائيًا.
- يعمل هذا بشكل **reactive** باستخدام **Zone.js** أو **Zoneless strategy** (Angular 16+).

---

**كيف يعمل Angular CD (High-level)**

1. كل Component مرتبط بـ **change detector**.
2. عند حدوث حدث (click, async response, timer… أي event داخل Angular zone):
   - Angular يبدأ **check لجميع components tree**.
3. Component's template يتم **re-evaluated** إذا تغير أي property.
4. Default behavior = **check all components recursively** (default strategy).

> بمعنى آخر: Angular يراجع كل component لتحديد إذا كان يجب تحديث DOM.

---

## **20) Change Detection Strategies**

**A) Default (CheckAlways)**

- كل component يتم فحصه في كل CD cycle.
- مناسب للتطبيقات الصغيرة أو البيانات الديناميكية.
- **مثال:**

```tsx
@Component({
  selector: 'app-default',
  template: `{{ counter }}`,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DefaultComponent {
  counter = 0;
}
```

- كل event أو async update → component + children يتم فحصهم.

---

**B) OnPush**

- Component **يتفعل فقط إذا**:
  1. تغيرت **Input() reference** (immutable data)
  2. حدث **event داخل component** (click, keyup…)
  3. Observable/Subject **emits new value**
- يقلل من عدد الفحوصات → improves performance.

```tsx
@Component({
  selector: 'app-onpush',
  template: `{{ data.name }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnPushComponent {
  @Input() data!: { name: string };
}
```

**Key point:**

- OnPush يعتمد على **immutable data** (تغيير reference، وليس mutation).

## **21) ViewEncapsulation?**

**ViewEncapsulation** in Angular controls **how styles defined in a component affect the DOM** — specifically, whether they stay local to the component or leak outside. It’s Angular’s way of handling **CSS scoping**.

---

**1. The Types of ViewEncapsulation**

Angular provides three options via the `encapsulation` property in `@Component`:

---

**a) Emulated (default)**

- Angular **scopes styles to the component** using **attribute selectors** behind the scenes.
- Works in all browsers.
- Component styles **do not leak outside**, and global styles **do not affect it unless explicitly targeted**.

```tsx
@Component({
  selector: 'app-my-comp',
  template: `<p>Hello</p>`,
  styleUrls: ['./my-comp.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MyComp {}
```

**How it works internally:**

Angular adds attributes to the HTML elements and CSS selectors:

```html
<p _ngcontent-c0>Hello</p>
```

```css
p[_ngcontent-c0] {
  color: red;
}
```

---

**b) None**

- Styles are **global**, not scoped.
- Component styles **leak outside** to the rest of the app.
- Useful for **global CSS rules**, but dangerous if not careful.

```tsx
encapsulation: ViewEncapsulation.None;
```

**Effect:**

```css
p {
  color: red;
} /* affects all <p> tags globally */
```

---

**c) ShadowDom**

- Uses **native browser Shadow DOM**.
- Styles are fully **encapsulated by the browser**, truly isolated.
- Only works in browsers supporting Shadow DOM.
- Component’s template is rendered in a shadow root.

```tsx
encapsulation: ViewEncapsulation.ShadowDom;
```

**Effect:**

```html
<app-my-comp>
  #shadow-root
  <p>Hello</p>
</app-my-comp>
```

- Styles cannot leak outside the shadow root, and global styles do **not affect** it.

---

**2. Quick Comparison Table**

| Encapsulation | Styles Scope               | Notes                             |
| ------------- | -------------------------- | --------------------------------- |
| **Emulated**  | Component only (simulated) | Default, works in all browsers    |
| **None**      | Global                     | Styles leak; use carefully        |
| **ShadowDom** | True shadow DOM            | Full isolation, browser dependent |

---

**3. When to Use Each**

- **Emulated** → default, safe, most common.
- **None** → when you want **global CSS effects** from a component.
- **ShadowDom** → when creating **isolated components or libraries** with no style conflicts.

---

Angular essentially gives you a **CSS scoping strategy** with these options.

## **22) How to create Shadow DOM in Angular?**

Just tell Angular to use it.

```ts
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-shadow-demo',
  template: `
    <h2>Shadow DOM Component</h2>
    <button>Click me</button>
  `,
  styles: [
    `
      h2 {
        color: purple;
      }
      button {
        background: black;
        color: white;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ShadowDemoComponent {}
```

That’s it.
Angular will create a **real shadow root** under `<app-shadow-demo>`.

In the DOM you’ll see:

```html
<app-shadow-demo>
  #shadow-root (open)
  <h2>Shadow DOM Component</h2>
  <button>Click me</button>
</app-shadow-demo>
```

No `_ngcontent` attributes. No pretending. Just browser law.

---

### Important consequences (this is where people get burned)

1. **Global styles do NOT apply**

```css
button {
  font-size: 20px;
} /* WILL NOT work */
```

2. **CSS frameworks don’t auto-work**
   Bootstrap, Tailwind, Material styles?
   You must:

- Import styles **inside the component**, or
- Use CSS variables (`:host { --primary: red; }`)

3. **:host and :host-context actually matter**

```css
:host {
  display: block;
  border: 2px solid red;
}
```

4. **Projected content is still projected**
   `<ng-content>` works — but projected nodes keep _their_ styles, not yours.

---

### When Shadow DOM is the right choice

Use it when:

- You are building **design-system components**
- You want **hard isolation**
- You don’t want global CSS to ever touch your component
- You plan to expose components as **Web Components**

Avoid it when:

- You rely heavily on global styles
- You expect Bootstrap/Tailwind to “just work”
- You need easy theming via global CSS

---

### Angular vs native Shadow DOM (truth check)

Angular does **not** polyfill Shadow DOM.
If the browser doesn’t support it, you don’t get it.
Modern browsers do, so this is mostly academic now.

---

## **23) Router Data**

تمام، خلينا نشرح موضوع إرسال البيانات (`Data`) عبر الـ **Routes** في Angular واستخدامها داخل الـ **Components** بطريقة مرتبة وبأمثلة عملية.

---

### 1️⃣ تعريف البيانات في الـ Routes

في Angular، عند تعريف الـ **Routes** في ملف الـ `app-routing.module.ts`، يمكنك تمرير بيانات ثابتة لكل route باستخدام الخاصية `data`.

مثال:

```tsx
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Welcome Home', role: 'user' }, // بيانات ثابتة
  },
  {
    path: 'about',
    component: AboutComponent,
    data: { title: 'About Us', role: 'admin' },
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

هنا لكل Route عنده `data` خاص به، مثل `title` و `role`.

---

### 2️⃣ قراءة البيانات داخل الـ Component

هناك طريقتين أساسيتين للحصول على البيانات:

### الطريقة الأولى: عبر `ActivatedRoute` و `snapshot`

مناسب للبيانات الثابتة اللي مش هتتغير أثناء وجود الـ Component.

```tsx
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <h1>{{ title }}</h1>
    <p>Role: {{ role }}</p>
  `,
})
export class HomeComponent implements OnInit {
  title!: string;
  role!: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // بيانات ثابتة
    this.title = this.route.snapshot.data['title'];
    this.role = this.route.snapshot.data['role'];
  }
}
```

---

### الطريقة الثانية: عبر `ActivatedRoute.data` observable

مناسب لو البيانات ممكن تتغير أثناء تواجد الـ Component (مثلاً لو عندك Child Routes أو lazy loading):

```tsx
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about',
  template: `
    <h1>{{ title }}</h1>
    <p>Role: {{ role }}</p>
  `,
})
export class AboutComponent implements OnInit {
  title!: string;
  role!: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.title = data['title'];
      this.role = data['role'];
    });
  }
}
```

> ميزة الطريقة الثانية هي أنها Reactive، أي لو حصل تحديث في البيانات من الـ route، الـ Component هيرجع يشتغل على البيانات الجديدة.

---

### 3️⃣ استخدام البيانات في الـ Template

بعد ما تجيب البيانات في الـ Component، تستخدمها طبيعي في الـ template عبر interpolation:

```html
<h2>{{ title }}</h2>
<p>User Role: {{ role }}</p>
```

---

### 🔹 ملاحظات مهمة

1. البيانات في `data` **ثابتة** بمعنى أنها محددة وقت تعريف الـ Route، مش runtime dynamic data.
2. لو عايز تبعت بيانات **متغيرة** وقت التنقل، تستخدم **queryParams** أو **route params**.
3. `data` مفيدة لتمرير خصائص مثل:
   - Titles
   - Roles أو permissions
   - Flags لتغيير الواجهة (مثلاً `showHeader: true`)

## **24)Query Params vs Route Params (difference + how to use)**

**Route params** are part of the URL _structure_. They define _what_ resource you’re looking at.

Example:
`/users/42`

Here, `42` is a route param.

```ts
{ path: 'users/:id', component: UserComponent }
```

Access:

```ts
this.route.paramMap.subscribe((p) => {
  const id = p.get('id');
});
```

Key properties:

- Mandatory for that route
- Changing them **recreates the component**
- Good for identity: IDs, slugs, primary keys

---

**Query params** are _metadata about the view_, not the resource itself.

Example:
`/users/42?tab=orders&page=2`

Access:

```ts
this.route.queryParamMap.subscribe((q) => {
  const page = q.get('page');
});
```

Key properties:

- Optional
- Changing them **does NOT destroy the component**
- Good for filters, pagination, sorting, UI state

Rule of thumb that actually holds:

- “Who is this?” → route param
- “How should I see it?” → query param

---

You are using **ActivatedRoute**, not `Router` and not `RouterModule`.

Now let’s dissect it properly so it sticks.

---

### What object is `this.route`?

`this.route` is an instance of **ActivatedRoute** injected into your component.

```ts
constructor(private route: ActivatedRoute) {}
```

So when you write:

```ts
this.route.paramMap.subscribe(...)
this.route.queryParamMap.subscribe(...)
```

you are talking to **the currently activated route**, not the router engine itself.

---

### What `ActivatedRoute` actually represents

Think of **ActivatedRoute** as:

> “What route am I on _right now_, and what data does it carry?”

It exposes:

- `paramMap` → route params (`/users/:id`)
- `queryParamMap` → query params (`?page=2`)
- `data` → resolver data
- `url` → current URL segments
- `parent`, `firstChild` → route tree navigation

It is **contextual** and **instance-based**.

Each routed component gets its own ActivatedRoute instance.

---

### What `Router` is (and why it’s different)

`Router` is the **navigation controller**.

You use it to:

```ts
this.router.navigate(['/users', 42], {
  queryParams: { page: 2 },
});
```

It:

- Triggers navigation
- Manages route reuse
- Emits navigation events
- Knows the entire route tree

But it does **not** expose `paramMap` for your component directly.

---

### Where `RouterModule` fits in

`RouterModule` is **neither** of the above at runtime.

It is:

- An Angular **NgModule**
- A configuration wrapper

```ts
RouterModule.forRoot(routes);
RouterModule.forChild(routes);
```

Its job:

- Register routes
- Provide Router + ActivatedRoute providers
- Set up directives (`router-outlet`, `routerLink`)

Once the app is running, you never “use” RouterModule directly.

---

### Mental model that won’t betray you

- **RouterModule** → configuration & setup (compile time)
- **Router** → navigation & control (application level)
- **ActivatedRoute** → current route state (component level)

So your code:

```ts
this.route.paramMap.subscribe(...)
```

= **ActivatedRoute**, 100%.

---

### Subtle but important detail (where seniors get caught)

`paramMap` belongs to the **current route only**.

If the param is defined on a parent route, you must do:

```ts
this.route.parent?.paramMap.subscribe(...)
```

This trips people up constantly during refactors.

---

Bottom line:

- You read params from **ActivatedRoute**
- You navigate with **Router**
- You configure everything with **RouterModule**

Angular is strict here, and that strictness is doing you a favor.

## **25) HostBinding & HostListener?**

In Angular, **HostBinding** and **HostListener** are how a directive or component talks directly to **its own host element**—the DOM element the directive/component is attached to.

Think of the host element as:

> “The tag Angular created or enhanced for me.”

---

## HostBinding

**HostBinding = bind data from your class to the host element**

It lets you set **properties, attributes, classes, or styles** on the host element without touching the template.

### What it actually does

It creates a binding between:

- a class property
  and
- something on the host DOM element

### Common use cases

- Toggle a CSS class
- Set inline styles
- Set ARIA attributes
- Reflect component state on the host

### Example: bind a CSS class

```ts
@Directive({
  selector: '[appActive]',
})
export class ActiveDirective {
  @HostBinding('class.active')
  isActive = true;
}
```

```html
<div appActive></div>
```

Result in the DOM:

```html
<div class="active"></div>
```

No template. No `ngClass`. No hacks.

---

### Example: bind styles

```ts
@HostBinding('style.backgroundColor')
bg = 'orange';
```

Equivalent to:

```html
<div style="background-color: orange"></div>
```

---

### Example: bind attributes (important for accessibility)

```ts
@HostBinding('attr.aria-disabled')
ariaDisabled = 'true';
```

---

## HostListener

**HostListener = listen to events fired by the host element**

Instead of adding event bindings in the template (`(click)="..."`), you listen from the class itself.

### What it actually does

It subscribes to DOM events **on the host element**.

### Example: listen to click

```ts
@HostListener('click')
onClick() {
  console.log('Host element clicked');
}
```

```html
<button appActive>Click me</button>
```

Angular wires the event to the button automatically.

---

### Example: listen to keyboard events

```ts
@HostListener('keydown.enter')
onEnter() {
  console.log('Enter pressed');
}
```

---

### Example: listen to global events

Yes, you can listen beyond the host:

```ts
@HostListener('window:scroll')
onScroll() {
  console.log('Window scrolled');
}
```

Other valid targets:

- `document:click`
- `window:resize`

Use sparingly. Global listeners are power tools.

---

## HostBinding + HostListener together (real-world pattern)

```ts
@Directive({
  selector: '[appHover]',
})
export class HoverDirective {
  @HostBinding('class.hovered')
  isHovered = false;

  @HostListener('mouseenter')
  onEnter() {
    this.isHovered = true;
  }

  @HostListener('mouseleave')
  onLeave() {
    this.isHovered = false;
  }
}
```

Result:

- Mouse enters → class added
- Mouse leaves → class removed

Clean. Predictable. Testable.

---

## How this differs from template bindings

| Template                  | HostBinding / HostListener |
| ------------------------- | -------------------------- |
| Works in HTML             | Works in TS                |
| Tightly coupled to markup | Encapsulated logic         |
| Repeated in every usage   | Reusable behavior          |
| Great for components      | Perfect for directives     |

If behavior belongs to the **element itself**, it belongs here.

---

## Important truth people get wrong

> “HostBinding styles should apply to inner elements.”

❌ Wrong.

**HostBinding affects ONLY the host element**, not children.

If you write:

```ts
@HostBinding('style.padding')
padding = '20px';
```

That padding applies to:

```html
<app-card>
  <!-- THIS -->
  <div>inside</div>
</app-card>
```

Not the inner `<div>`.

If your style works in `styles.css` but not inside the component—this is **ViewEncapsulation**, not HostBinding. Different beast.

---

## @HostBinding vs host metadata (old style)

This:

```ts
@HostBinding('class.active') isActive = true;
```

Is equivalent to:

```ts
@Component({
  host: {
    '[class.active]': 'isActive'
  }
})
```

The decorator version is clearer, type-safe, and modern. Prefer it.

---

## When NOT to use them

- For complex layouts → use templates
- For child element styling → use CSS or ViewEncapsulation
- For business logic → services

These tools are for **DOM behavior**, not application logic.

---

## Mental model (keep this)

- **HostBinding**: “Reflect my state on my element”
- **HostListener**: “React to what my element does”

Angular gives you the scalpel. Use it precisely, not like a hammer.

## **26) Projection?**

Projection in Angular—officially **Content Projection**—is Angular’s way of letting a component **receive markup from its parent and decide where (and whether) to render it**. Think of it as controlled teleportation for HTML.

At the center of this is `<ng-content>`.

Start simple.
You write a component like this:

```html
<!-- card.component.html -->
<div class="card">
  <ng-content></ng-content>
</div>
```

Then you use it like this:

```html
<app-card>
  <h2>Title</h2>
  <p>Description</p>
</app-card>
```

Angular takes everything inside `<app-card>` and injects it **exactly where `<ng-content>` sits**. The component owns the layout; the parent owns the content. Clean separation, no magic strings, no hacks.

Now the important rule people miss:
**Projected content belongs to the parent’s context, not the child’s.**
Bindings, variables, and directives inside the projected HTML are evaluated in the parent component. Angular is polite like that—it doesn’t steal scope.

---

### Multiple slots (selective projection)

You can project different pieces into different places using selectors.

```ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-practice',
  template: `
    <div class="card m-3 p-3 text-primary">
      <span class="DX1">
        <ng-content></ng-content>
      </span>

      <span class="DX2">
        <!-- this is a new feature for angular 18 -->
        <!-- FallBack will be replaced if no .input-icon found  -->
        <ng-content select=".input-icon"> FallBack As .input-icon not found</ng-content>
      </span>

      <span class="DX3">
        <ng-content select=".ico"></ng-content>
      </span>

      <span class="DX4">
        <!-- to select with ngProjectAs without adding new classess to the child content -->
        <ng-content select="iconX4"></ng-content>
      </span>
    </div>
  `,
  imports: [],
})
export class PracticeComponent {}
```

Usage:

```ts
import { Component } from '@angular/core';
import { PracticeComponent } from './component';

@Component({
  selector: 'app-projection',
  imports: [PracticeComponent],
  template: `
    <!-- practice -->
    <app-practice>
      <span>ButtonX1</span>
      <!-- <span class="input-icon">FBX2</span> -->
      <span class="ico">X3</span>
      <span ngProjectAs="iconX4">X4</span>
      <pre ngProjectAs="vcx1" #pre>PRE CONTENT</pre>
    </app-practice>
  `,
})
export class ProjectionXXXXXXXXXComponent {}
```

Angular matches elements by CSS selector and drops them into the right slot. Anything that doesn’t match a selector falls into the **default `<ng-content>`**.

Order matters. First match wins. Angular doesn’t backtrack.

---

### `ngProjectAs` (the escape hatch)

Sometimes the element you’re projecting doesn’t naturally match the selector. Angular gives you a disguise:

```html
<span ngProjectAs="[panel-title]">Fake Title</span>
```

Angular treats that element **as if** it matched the selector. No DOM change, just selector cosplay.

---

### What projection is NOT

It is **not**:

- Two-way binding between parent and child
- A way to pass data (use `@Input`)
- Dynamic insertion logic (use `*ngIf`, `*ngFor`, or `ViewContainerRef`)

Projection is about **structure**, not behavior.

---

### Lifecycle and limitations (important stuff)

- Projected content is rendered **before `ngAfterContentInit`**
- You access it via `@ContentChild` / `@ContentChildren`, not `@ViewChild`
- You cannot project content **created later by the child**
- You cannot loop `<ng-content>` (Angular forbids it for sanity reasons)

Angular decides projection **once**, during creation. No re-shuffling later.

---

### When to use it (and when not to)

Use content projection when:

- Building layout components (cards, modals, tabs)
- Creating reusable UI shells
- You want flexibility without exploding inputs

Do not use it when:

- The child needs to control the data
- You need dynamic templates per item (use `ngTemplateOutlet`)
- You’re tempted to abuse it for logic (that way lies suffering)

---

Short version:
**Inputs pass data. Projection passes structure.**
Angular lets parents speak, children decide where the words land.

Once you see it that way, `<ng-content>` stops being mysterious and starts being sharp.

## **27) Interceptor ?**

**ال Http Interceptor** هو **service بين Angular HttpClient والـ backend**، بيمرر كل request و response قبل ما يوصل Component أو Service.

الموضوع أشبه بالـ **middleware** في Express أو pipeline في أي framework.

**وظيفته الأساسية:**

- تعديل request قبل الإرسال
- معالجة response قبل ما يوصل للمستلم
- التعامل مع errors بشكل مركزي

---

### 2) Syntax

```tsx
@Injectable()
exportclassAuthInterceptorimplementsHttpInterceptor {
intercept(req:HttpRequest<any>,next:HttpHandler):Observable<HttpEvent<any>> {

// edit request
const authReq = req.clone({
setHeaders: {
Authorization:`Bearer ${localStorage.getItem('token')}`
      }
    });

// pass modified request
return next.handle(authReq).pipe(
tap({
next:(event) => {
// handle response
        },
error:(err) => {
if (err.status ===401) {
// redirect or logout
          }
        }
      })
    );
  }
}

```

---

### 3) use it as Provider

```tsx
providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }];
```

**نقطة مهمة:**

- `multi: true` → يسمح بوجود أكتر من interceptor بنفس الوقت
- Angular يشغّلهم بالترتيب اللي اتسجّلوا فيه

---

### 4) Use Cases عملية

1. **Authorization**

- إضافة JWT token لكل request
- مثال: API calls في أي تطبيق auth-based

1. **Logging / Analytics**

- تسجيل كل request/response
- متابعة performance

1. **Error handling مركزي**

- intercept 401/403 → redirect
- intercept 500 → show error modal

1. **Request modification / caching**

- إضافة headers
- تغيير query params
- cache responses بشكل مركزي

---

### 5) ترتيب التنفيذ (Execution Order)

لو عندك Interceptors متعددة:

- Request: Interceptors بتنفذ **top-down**
- Response: Interceptors بتنفذ **bottom-up** (reverse order)

> دا مهم جدًا لو عندك Interceptor للـ auth + interceptor للـ logging + interceptor للـ error handling

---

### 6) الفرق بين Interceptor و Service عادي

| Feature            | Interceptor         | Service (HttpClient)      |
| ------------------ | ------------------- | ------------------------- |
| Access to request  | Yes (before send)   | No                        |
| Access to response | Yes (before return) | No                        |
| Centralized logic  | Yes                 | No (spread in components) |
| Reusability        | High                | Low                       |

---

### 7) نصائح Senior

- ال Interceptors **مش مكان لتنفيذ UI logic**
- استخدم `multi: true` بدل override واحد
- حاول تكون stateless → لا تعتمد على internal state متغيرة
- مع RxJS operators → `catchError`, `tap`, `finalize` مفيد جدًا

---

### جملة Interview جاهزة:

> Http Interceptors in Angular are middleware for all HttpClient requests and responses. They allow centralized handling of authorization, logging, error handling, and request modification, and multiple interceptors can be chained in a controlled order.

## **28) what is viewchild?**

### 1) what is `@ViewChild`؟

ال `@ViewChild` هو **decorator** في Angular بيخليك توصل لأي **DOM element أو Component instance** موجود داخل template **من داخل نفس component**.

باختصار:

> لو عايز تتحكم في عنصر أو component من TypeScript بدل الـ template مباشرة، تستخدم @ViewChild.

---

### 2) Syntax

```tsx
@Component({
selector:'app-demo',
template: `
    <input #myInput type="text">
    <child-component #childRef></child-component>
  `
})
exportclassDemoComponentimplementsAfterViewInit {

// الوصول لعناصر DOM
@ViewChild('myInput') inputRef!:ElementRef;

// الوصول لـ child component
@ViewChild('childRef') child!:ChildComponent;

ngAfterViewInit() {
// تعديل DOM مباشرة
this.inputRef.nativeElement.focus();

// استدعاء method في child
this.child.sayHello();
  }
}

```

---

### 3) Important notes

1. **يشتغل بعد view initialization**

- لازم تستخدمه غالبًا في `ngAfterViewInit`
- قبلها القيمة ممكن تكون `undefined`

1. **ElementRef vs ComponentRef**

- `ElementRef` → للوصول للـ DOM element
- Component instance → للوصول للـ methods + properties

1. **Static option**

```tsx
@ViewChild('myInput', {static:true }) inputRef!:ElementRef;

```

- `static: true` → لو العنصر موجود قبل الـ change detection (مثال: \*ngIf false initially)
- `static: false` → default، للوصول بعد init

---

### 4) Common use cases

1. **Focus on input fields**

```tsx
this.inputRef.nativeElement.focus();
```

1. **Access child component methods**

```tsx
this.child.resetForm();
```

1. **Manipulate DOM for third-party libraries**

```tsx
someChartLibrary.init(this.canvas.nativeElement);
```

1. **Listen to DOM events imperatively**

```tsx
this.button.nativeElement.addEventListener('click', ...);

```

> نصيحة Senior: حاول تقلل direct DOM manipulation، واحتفظ بـ Angular way إلا لو محتاج third-party lib.

---

### 5) الفرق بين `@ViewChild` و `@ContentChild`

| Feature        | @ViewChild                     | @ContentChild                  |
| -------------- | ------------------------------ | ------------------------------ |
| Source         | template داخل component        | projected content (ng-content) |
| Access         | DOM element or child component | projected child component      |
| Lifecycle hook | ngAfterViewInit                | ngAfterContentInit             |

---

### جملة Interview جاهزة

> @ViewChild allows you to access a DOM element or child component from the template directly within the parent component class. It’s useful for focusing inputs, calling child methods, or integrating third-party libraries.

---

هنعمل **mental model diagram** ذهني (ممكن ترسمه على ورقة أو في مخيلتك) يوضّح الفرق بين `@ViewChild`, `@ContentChild`, `@ViewChildren`, `@ContentChildren` والـ hierarchy بتاعهم:

---

### **1️⃣ Hierarchy conceptually**

```
Parent Component Template
│
├─ Direct child elements/components (defined in parent template)
│   ├─<child-component #childRef></child-component>
│   └─<input #inputRef>
│
└─<ng-content> projected content
      └─<projected-child #projRef></projected-child>

```

---

### **2️⃣ Decorators mapping**

| Decorator            | Target                             | Scope/Source                       | Lifecycle Hook     | Returns                         |
| -------------------- | ---------------------------------- | ---------------------------------- | ------------------ | ------------------------------- |
| **@ViewChild**       | Single DOM element / component     | Direct child in parent template    | ngAfterViewInit    | ElementRef / Component instance |
| **@ViewChildren**    | Multiple DOM elements / components | Direct children in parent template | ngAfterViewInit    | QueryList<ElementRef/Component> |
| **@ContentChild**    | Single projected child             | Inside `<ng-content>`              | ngAfterContentInit | Component instance              |
| **@ContentChildren** | Multiple projected children        | Inside `<ng-content>`              | ngAfterContentInit | QueryList<Component>            |

---

### **3️⃣ Visual mental model**

```
ParentComponent
│
├─ Viewchildren(template direct)
│   ├─ inputRef (ElementRef)          <--@ViewChild
│   └─ childRef (ChildComponent)      <--@ViewChild /@ViewChildren
│
└─ Projectedcontent(ng-content)
    ├─ projRef (ProjectedChild)      <--@ContentChild
    └─ projRefs (multiple)           <--@ContentChildren

```

---

### **4️⃣ Key takeaways for interview**

1. `ViewChild` → عناصر داخل الـ template نفسه
2. `ContentChild` → عناصر واردة عبر `<ng-content>`
3. `ViewChildren` / `ContentChildren` → نفس الفكرة بس لمجموعة عناصر
4. لازم تستخدم **ngAfterViewInit** و **ngAfterContentInit** للوصول الآمن للقيم
5. ElementRef → direct DOM
6. Component → instance مع methods و properties

---

لو عايز، أقدر أعمل لك **مثال Angular عملي كامل** يضم:

- @ViewChild
- @ViewChildren
- @ContentChild
- @ContentChildren
- - lifecycle hooks + manipulation

ده هيخلي الفهم عملي جدًا وممكن تستخدمه في مقابلة. تحب أعمله لك؟

ياللا

تمام، هنعمللك **مثال Angular عملي كامل** يضم كل decorators اللي اتكلمنا عنها، مع lifecycle hooks واستخدامهم بشكل واضح، بحيث تقدر تشرحهم كأنك فاهم العمق في المقابلة.

---

### **app.component.ts (Parent Component)**

```tsx
import {Component,ViewChild,ViewChildren,ContentChild,ContentChildren,AfterViewInit,AfterContentInit,QueryList,ElementRef }from'@angular/core';
import {ChildComponent }from'./child.component';
import {ProjectedComponent }from'./projected.component';

@Component({
selector:'app-root',
template: `
    <h1>Parent Component</h1>

    <!-- View children -->
    <input #inputRef type="text" placeholder="Type here">
    <child-component #childRef></child-component>

    <!-- Multiple view children -->
    <child-component *ngFor="let c of [1,2]" #viewChildrenRefs></child-component>

    <!-- Projected content -->
    <ng-content></ng-content>
  `
})
exportclassAppComponentimplementsAfterViewInit,AfterContentInit {

// Single view child
@ViewChild('inputRef') inputEl!:ElementRef;
@ViewChild('childRef') child!:ChildComponent;

// Multiple view children
@ViewChildren('viewChildrenRefs') childrenList!:QueryList<ChildComponent>;

// Single projected child
@ContentChild(ProjectedComponent) projectedChild!:ProjectedComponent;

// Multiple projected children
@ContentChildren(ProjectedComponent) projectedChildren!:QueryList<ProjectedComponent>;

ngAfterViewInit() {
console.log('ngAfterViewInit');

// DOM manipulation via ElementRef
this.inputEl.nativeElement.focus();

// Call child method
this.child.sayHello();

// Iterate multiple view children
this.childrenList.forEach((c, i) => c.sayHello(`ViewChild #${i + 1}`));
  }

ngAfterContentInit() {
console.log('ngAfterContentInit');

// Call method in projected content
if (this.projectedChild)this.projectedChild.sayHello('ContentChild');

// Iterate multiple projected children
this.projectedChildren.forEach((c, i) => c.sayHello(`ContentChildren #${i + 1}`));
  }
}
```

---

### **child.component.ts**

```tsx
import {Component }from'@angular/core';

@Component({
selector:'child-component',
template:`<p>Child Component</p>`
})
exportclassChildComponent {
sayHello(prefix:string ='') {
console.log(`${prefix} says hello from ChildComponent`);
  }
}
```

---

### **projected.component.ts**

```tsx
import {Component }from'@angular/core';

@Component({
selector:'projected-component',
template:`<p>Projected Component</p>`
})
exportclassProjectedComponent {
sayHello(prefix:string ='') {
console.log(`${prefix} says hello from ProjectedComponent`);
  }
}
```

---

### **استخدام مع ng-content (مثال في app.module.html)**

```html
<app-root>
  <!-- Projected content -->
  <projected-component></projected-component>
  <projected-component></projected-component>
</app-root>
```

---

### ✅ **شرح سريع للـ flow**

1. **ViewChild** → بيشوف العناصر الموجودة داخل template مباشرة (`inputRef` و `childRef`)
2. **ViewChildren** → مجموعة من عناصر view (looped components)
3. **ContentChild** → أول عنصر projected داخل `<ng-content>`
4. **ContentChildren** → كل العناصر projected داخل `<ng-content>`
5. **ngAfterViewInit** → متاح كل view children، تقدر تتفاعل مع DOM و Components
6. **ngAfterContentInit** → متاح projected content، تقدر تتفاعل مع Components جوا `<ng-content>`

---

لو عايز أقدر أرسملك **diagram flow** يوضح lifecycle ووقت ظهور كل ViewChild / ContentChild مع ترتيب الـ hooks، ده حيخلي الصورة واضحة جدًا في مقابلة Senior.

تحب أعمله لك؟

## **29) what is SSR?**

تمام، خلينا نفك الموضوع ده خطوة خطوة وبتفصيل، لأن فيه خلط شائع بين المصطلحات دي في عالم الـ **web rendering** وخصوصًا في الـ frameworks الحديثة زي Angular وReact وNext.js وغيرها.

---

### 1️⃣ SSR – **Server-Side Rendering**

ال **SSR** معناها إن محتوى الصفحة بيتولد على السيرفر قبل ما يتبعت للمتصفح. بمعنى آخر، السيرفر بيعمل render للـ HTML ويدي المتصفح صفحة كاملة جاهزة.

**مثال توضيحي:**

- عندك صفحة Blog.
- السيرفر يولد HTML لكل بوست مع العنوان والمحتوى قبل ما الصفحة تتحمل عند المستخدم.
- المتصفح يستقبل صفحة جاهزة للعرض، فيظهر المحتوى أسرع من الـ client-side rendering (اللي بيولد الـ HTML بعد تحميل JavaScript).

**مميزات SSR:**

- تحسين SEO لأن محركات البحث تشوف المحتوى مباشرة.
- تحميل أولي أسرع (First Paint أسرع) خصوصًا على صفحات ثقيلة.

**عيوبه:**

- كل طلب Page Request بيحتاج render جديد على السيرفر → ممكن يزيد الضغط على السيرفر.

---

### 2️⃣ Server-Side + Hybrid Rendering

ال **Hybrid Rendering** معناها إنك بتدمج بين **SSR** و**Client-Side Rendering (CSR)**.

يعني السيرفر يولد صفحة HTML جاهزة، لكن بعد كده الـ JavaScript على المتصفح بياخد التحكم ويخلي الصفحة ديناميكية.

**مثال:**

- صفحة منتج e-commerce. السيرفر يولد HTML للمنتجات عشان SEO، لكن بعد التحميل المستخدم يقدر يفلتر المنتجات بشكل ديناميكي باستخدام JavaScript.

---

### 3️⃣ Hydration

ال **Hydration** هي العملية اللي بتحصل بعد ما صفحة الـ SSR اتبعت للمتصفح.

- السيرفر بيدي المتصفح HTML جاهز.
- بعد كده الـ JavaScript على الصفحة “بيشوف” الـ HTML ويضيف له **interactivity**: مثلا الأزرار، الـ forms، الأحداث الديناميكية.

**مثال سريع:**

```html
<button id="like-btn">Like</button>
<script>
  document.getElementById('like-btn').addEventListener('click', () => {
    alert('Liked!');
  });
</script>
```

- السيرفر يولد الزر HTML.
- بعد تحميل JS، الزر يقدر يستجيب للأحداث → ده hydration.

---

### 4️⃣ Incremental Hydration

ال **Incremental Hydration** هو تحسين للـ Hydration التقليدي.

بدل ما نعمل **hydrate لكل الصفحة مرة واحدة**، بنعمل **hydrate لكل component أو جزء من الصفحة لما يكون محتاج يتفاعل فقط**.

**الفكرة:**

- الصفحة كلها اتعملت SSR → ظهر HTML جاهز.
- مكونات معينة بس، زي أزرار أو widgets ديناميكية، هي اللي اتعمل لها hydration تدريجي.

**مميزاته:**

- يقلل استهلاك الذاكرة على المتصفح.
- يسرع وقت تحميل الصفحة بشكل كبير.
- مفيد جدًا للـ صفحات الكبيرة أو apps المعقدة.

---

### 🧩 الصورة الكاملة:

1. **SSR:** HTML جاهز من السيرفر.
2. **Hydration:** تحويل HTML جاهز إلى صفحة تفاعلية على المتصفح.
3. **Incremental Hydration:** نعمل تفاعل تدريجي على مكونات الصفحة بدل hydration كامل للصفحة.
4. **Hybrid Rendering:** مزيج بين SSR + CSR بحيث نستفيد من سرعة السيرفر ومرونة المتصفح.

---

لو تحب، أقدر أرسملك **رسم توضيحي للفرق بينهم** يوضح flow البيانات بين السيرفر والمتصفح، هيسهّل فهمهم جدًا.

تحب أرسمه لك؟

## **30) what is Bundles?**

في Angular، لما نتكلم عن **bundles**، إحنا بنتكلم عن **ملفات جاهزة للإرسال للـ browser** بعد ما المشروع يتجمع (build). الفكرة الأساسية ورا الـ bundles هي **تجميع كل الكود والمكتبات اللي محتاجها التطبيق في ملفات أقل ممكنة** لتسريع تحميل الصفحة وتحسين الأداء.

### إزاي الموضوع بيشتغل؟

لما بتعمل build لمشروع Angular، بيحصل الآتي:

1. Angular CLI بياخد كل الملفات:
   - TypeScript (.ts)
   - HTML templates
   - CSS / SCSS
   - Dependencies من npm
2. بعدين **Webpack (أو الأدوات الداخلية في Angular)** بيحول كل ده لـ JavaScript عادي (browser-friendly).
3. وبعدين بيقسم الكود في ملفات اسمها **bundles**.

### أنواع الـ Bundles الأساسية:

1. **Main bundle**:
   - ده فيه كل الكود الأساسي للتطبيق (الكومبوننتس، الخدمات…).
   - عادة بيكون اسم الملف `main.js`.
2. **Polyfills bundle**:
   - ده فيه أكواد بتخلي التطبيق يشتغل على متصفحات قديمة أو غير داعمة لبعض المميزات الحديثة.
   - عادة `polyfills.js`.
3. **Vendor bundle**:
   - ده فيه كل المكتبات اللي ركبتها من npm، زي Angular نفسه، RxJS، أو أي مكتبات خارجية.
   - عادة `vendor.js`.
4. **Runtime bundle**:
   - ده فيه أكواد تشغيلية صغيرة Angular محتاجها عشان يبدأ التطبيق.
   - عادة `runtime.js`.
5. **Lazy-loaded bundles**:
   - لو عندك modules مش محتاجها مباشرة عند فتح التطبيق، Angular ممكن يعمل لهم **lazy load**.
   - كل Module منهم بيبقى ملف bundle لوحده، وده يقلل حجم التحميل الأولي.

---

### ليه Bundles مهمة؟

- بتقلل عدد الملفات اللي الـ browser بيحملها (تحسين الأداء).
- بتسهل caching، لأن الكود الأساسي ممكن ما يتغيرش ويبقى مخزن عند المستخدم.
- بتدعم **lazy loading** عشان التطبيق يبدأ أسرع.

## **31) Deep Linking & Refresh (why Angular sometimes “breaks”)?**

**Deep link** means you can paste _any_ app URL directly into the browser and it works.

Angular uses the **HTML5 History API**:

- Navigation is client-side
- The server doesn’t know about `/users/42`

Problem:

- You refresh `/users/42`
- Server says: “I don’t have a file called `/users/42`”
- 💥 404

Solution:

- Server must redirect _all_ routes to `index.html`

Examples:

- Nginx: `try_files $uri /index.html`
- Apache: `.htaccess rewrite`
- Firebase: `"rewrites": [{ "source": "**", "destination": "/index.html" }]`

Important clarification:

- This is **not** an Angular issue
- This is **routing vs server configuration**
- Angular assumes the server cooperates

---

## **32) Route Reuse Strategy (when Angular destroys components… or shouldn’t)?**

By default:

- Navigate away → component destroyed
- Navigate back → component rebuilt

This is safe, predictable, and often wasteful.

**RouteReuseStrategy** lets you:

- Cache a component instance
- Reattach it later
- Preserve scroll, form state, API results

Typical use cases:

- Tab-like navigation
- Back-and-forth between list/details
- Heavy components with expensive initialization

Core idea:
Angular asks four questions:

- Should I detach this route?
- Where do I store it?
- Should I reattach it?
- How do I retrieve it?

Custom strategy = override these decisions.

Reality check:

- Powerful
- Easy to misuse
- Memory leaks if you’re sloppy
- Don’t use it unless you _measured_ a problem

---

## **33) XSS & Angular Sanitization (what Angular protects you from)?**

**XSS** = attacker injects malicious JS into your app.

Example attack vector:

```html
<img src="x" onerror="stealCookies()" />
```

Angular’s default stance:

- “I don’t trust strings”

So Angular:

- Escapes HTML
- Blocks script URLs
- Sanitizes styles
- Strips dangerous attributes

Example:

```html
<div [innerHTML]="htmlFromApi"></div>
```

Angular will sanitize it automatically.

Important:

- This protection works **only** in Angular templates
- It does **not** protect backend APIs
- It does **not** protect you if you deliberately bypass it

---

## **34) Bypassing Sanitization (aka “I know what I’m doing”… usually famous last words)**

Angular gives you:

```ts
DomSanitizer;
```

Example:

```ts
this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
```

This means:

- Angular stops protecting you
- You are now responsible for security
- Angular assumes the content is 100% safe

Legitimate use cases:

- Trusted CMS content
- SVG rendering
- Known-safe iframe sources

Red flags:

- User-generated content
- Anything from a form
- Anything from an external API you don’t fully control

Professional rule:
If you bypass sanitization, you should be able to _prove_ the source is safe. “It worked in testing” is not proof.

---

## **35) Angular Optimization (what actually matters in real apps)?**

Let’s cut through the noise.

**Change Detection**

- Use `ChangeDetectionStrategy.OnPush`
- Treat inputs as immutable
- This alone can cut CPU usage dramatically

**Lazy Loading**

- Load features only when needed
- Smaller bundles = faster startup
- Non-negotiable for medium+ apps

**TrackBy**

```html
*ngFor="let item of items; trackBy: trackId"
```

Without it:

- DOM gets destroyed and rebuilt
- Performance tanks silently

**Async Pipe**

- Handles subscriptions
- Auto-unsubscribes
- Reduces memory leaks
  Manual `subscribe()` in components is usually a smell.

**Avoid Heavy Logic in Templates**
Bad:

```html
{{ calculateSomething(expensive()) }}
```

Templates run _a lot_.

**Build Optimizations**

- AOT (default now)
- Production build
- Tree-shaking
- Differential loading

**Measure First**

- Chrome DevTools
- Angular DevTools
- Performance tab

Optimizing without measurement is just superstition with better marketing.
