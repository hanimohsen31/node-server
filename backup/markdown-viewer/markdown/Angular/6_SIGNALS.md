تمام – هنا هشرح **Signals في Angular 20** بشكل عملي، زي ما تتكلم في Interview أو Architecture discussion، مع أمثلة استخدام وحالات فعلية، مش مجرد تعريفات مكررة.

---

## Signals: فكرة سريعة كلام Interview قوي

**Signal** هو **primitive reactivity** داخل Angular يبني state يمكن للـ framework تتتبعها تلقائيًا لما تتغير. لما signal يتغيّر، Angular بتعرف إيه parts لازم تتحدّث في الـ UI بدون حاجة لـ zone.js أو subscriptions يدوية.

كأنك بتقول:

> دي متغيّر reactive بيخلي النظام يتابع كل اللي بيعتمد عليه و يعمل تحديثات بكفاءة.
> 

---

## كيف تتعامل مع Signals

### 1) إنشاء Signal Writable

```tsx
const count =signal(0);

```

- قراءة القيمة: `count()`
- تحديث القيمة: `count.set(5)`
- تحديث بالاعتماد على القديم: `count.update(v => v + 1)`
    
    دي طريقة سليمة لتغيّر state وتخلي Angular تعرف أن كل اللي بيعتمد على الـ count يتغيّر كمان.
    

---

## Computed Signals: Derived State

Computed signal بتحوّل أكثر من signal لواحد مشتق.

```tsx
const double =computed(() =>count() *2);

```

دي مش writable – Angular بتحسبها بس وتعمل **memoization** (cached) لغاية ما أي dependent signal يتغيّر. الحلو هنا إنه lazy: مش بتحسب إلّا لما تُقْرأ.

**مثال واقعي:**

عندك بيانات + filter input → computed signal تولّد قائمة filtered بدون rerender كامل.

> مفيد في lists، search UI، pagination.
> 

---

## Effects: Side Effects على تغيّر البيانات

`effect()` بتشغّل دالة أول مرة وتتابع أي signal اتقرأ جواها – وأي تغيّر فيهم بيخليها تتنفّذ تاني. دا مناسب للحاجات اللي **مش templates ولا pure logic** زي:

- logging
- localStorage sync
- third‑party behavior (chart, canvas)
- DOM mutations خارج Angular templates

مثال:

```tsx
effect(() => {
console.log(`count is now ${count()}`);
});

```

لكن مهم تلاحظ: لو استخدمت effect في propagation of state أو في computed state، ده غالبًا غلط وحيعمل cycle أو rerender غير مرغوب فيه. استخدم **computed** أو **linkedSignal** بدل ذلك لما يكون الهدف مشتق state، مش side effect.

---

## Methods البتستخدمها مع Signals

دي أهم الأدوات العملية:

**1) signal(value, options?)**

تنشئ writable signal ممكن تحدد فيها equality function لو محتاج تقارن values عميق بدل compare بسيط.

**2) set() و update()**

- `.set(val)` يغيّر القيمة مباشرة
- `.update(fn)` يسمح ببناء قيمة جديدة بالاعتماد على القديمة

**3) computed(() => …)**

من signals بتعمل derived signals تلقائي.

**4) effect(() => …)**

Side effects متتبعة dependencies من داخل function.

**5) linkedSignal / resource / toSignal (Angular 20)**

Angular 20 ثبت بعض features زي:

– `toSignal` لتحويل Observables/Promises لـ signals

– `linkedSignal` لإنشاء state مشتق و writable مع بعض

– `resource` API للـ async derived حقيقي

دي ميزات أحدث لتعبر عن حالات أكثر تعقيدًا.

---

## سيناريوهات استخدام حقيقية

### 1) Local component state

لو عندك counter أو UI toggle وعايز تغييرات فورية بدون subscriptions RxJS → signal أسهل وأنظف.

### 2) Derived UI data

مثل:

```tsx
const filteredItems =computed(() =>
items().filter(i => i.name.includes(searchTerm()))
);

```

بدل ngOnChanges أو بوضع subscriptions في component.

### 3) Third‑party syncronization

لو عايز تتابع تغيّر signal وتعمل DOM manip أو تزامنه مع مكتبة خارجية → effect.

### 4) RxJS Interop

لو لسه مستخدم RxJS في جزء من app، تقدر تحول Observable ل signal بـ `toSignal()` وتستفيد من النظام الجديد.

---

## إمتى **مش** تستخدم Signals

دي نقطة Senior لازم تكون واضح فيها:

- لو عندك **complex async streams** بـ cancelation logic → RxJS غالبًا أفضل.
- لو بتعمل propagation of state من effect ل signal → غالبًا architectural smell; استخدم computed أو linkedSignal بدل effect.
- لو بتحتاج patterns متقدمة زي windowing / buffering / throttling → RxJS أدواتها أقوى.

---

## المقارنة الذهنية

| Feature | Signals | RxJS |
| --- | --- | --- |
| Reactive state | ممتاز | ممكن |
| Async streams | limited | ممتاز |
| Cancellation / operators | basic | قوي |
| Change detection | hand‑tracked | through Observables/async pipe |
| Boilerplate | قليل | كبير أحيانًا |

---

## خلاصة Interview‑Ready

**Angular Signals** هي ميكانيزم **fine‑grained reactivity** يمكّنك من بناء state تتتبعه Angular بكفاءة. تقدر:

- تقرأ وتغيّر قيمة signal بسهولة،
- تربط derived state بـ **computed**,
- تعمل side effects بصورة منظمة مع **effect**،
- وتدمج مع Observables بفضل `toSignal()` أو APIs أعلى زي `resource()` و `linkedSignal()`.

ده بيعطيك أداء أعلى وتحكم أفضل في تحديثات الـ UI بالمقارنة مع الاعتماد الكامل على zone.js أو RxJS في كل مكان.

---

لو تحب، أقدر أديك **مثال عملي كامل component** يستخدم state + computed + effect + resource في Angular 20 لشرح الكل مع بعض. بتحتاجه؟