# SP.X
SP.X tiny framework

Собственно, это небольшой фреймворк для наших проектов.

Демки можно посмотреть [здесь](https://rawgit.com/sborkaproject/SP.X/master/demos/).

---

### Создание основного контроллера:

```javascript
var App = new SP.X('App', true, true);
```

SP.X принимает следующие аргументы:

name — название контроллера

debug — флаг режима отладки (вывод данных в консоль)

skipExportToGlobal — флаг отмены записи ссылки на контроллер в глобальный контекст (window)


### Создав основной контроллер, мы можем объявлять сущности:

```javascript
App.define('modules.TestModule', function(){
	return {}
});
```
 — в данном случае мы создаем сущность, доступную по пути App.modules.TestModule, являющуюся простым объектом.


### Для создания сущностей, зависимых от существования других сущностей, можно писать так:

```javascript
App.define('modules.TestModule', ['modules.OtherModule'], function(OtherModule){
	// Тут OtherModule уже доступен для испольования
});
```
 — в этом случае функция для создания App.modules.TestModule будет запущена только после того, как буден создан App.modules.OtherModule.

Количество зависимостей не ограничено:

```javascript
App.define('modules.TestModule', ['modules.A', 'modules.B', 'modules.C'], function(A, B, C){
	// Тут A, B и C уже доступны для испольования
});
```


### Для того, чтобы "поймать" момент создания некоторой сущности, существует такой механизм:

```javascript
App.resolve('modules.TestModule', function(TestModule){
	// Эта функция будет запущена в момент появления TestModule
	// или сразу, если TestModule уже существует
});
```

Если необходимо "ловить" сразу несколько зависимостей, то можно передавать их массивом:

```javascript
App.resolve(['modules.A', 'modules.B', 'modules.C'], function(A, B, C){
	// Эта функция будет запущена в момент появления A, B и C
	// или сразу, если A, B и C уже существуют
});
```


### Для отладки, в случае, если не понятно, какие сущности не были созданы из-за отсутствующих зависимостей, можно вызывать такой метод:

```javascript
App.debugDefines();
```

Который вернет объект с полями emptyDefines и emptyResolves, каждое из которых является массивом с путми отсутсвующих зависимостей.


### В фреймворк также встроен событийный механизм и несколько автоматически создаваемых событий:

```javascript
App.on(App.events.DOM_READY, function(){
	// Этот метод будет запущен в момент загрузки структуры документа
});

App.on(App.events.WINDOW_LOADED, function(){
	// Этот метод будет запущен в момент window.load
});

App.on(App.events.DEFINED, function(){
	// Этот метод будет запущен в момент определения некоторой сущности
});

App.on(App.events.RESOLVED, function(){
	// Этот метод будет запущен в момент вызова обработчика для App.resolve
});
```

### Для регистрации нового события можно пользоваться такой конструкцией:

```javascript
App.events.register('testEvent'); // Создаст App.events.TEST_EVENT

App.events.register('testEvent', true); // Создаст App.events.TEST_EVENT и методы App.events.onTestEvent / App.events.offTestEvent
```

Для регистрации множества событий можно передавать массив:

```javascript
App.events.register(['testEvent1', 'testEvent2', 'testEvent3']);
```


### Для вызова события используется метод dispatch:

```javascript
App.dispatch(App.events.SOME_EVENT, { someEventData: true });
```

В фреймворк интегрированы вспомогательные методы (описание которых я напишу позже):

```javascript
// Запустит define в момент возникновения App.events.SOME_EVENT
App.defineOn(App.events.SOME_EVENT, 'modules.SomeModule', function(){
	return {}
});

// Проверка существования сущности, определенной с помощью App.define / App.defineOn
App.isDefined('modules.SomeModule');

// Методы для вывода в консоль
App.log('Сообщение');
App.mark('Поехали!');
App.error('Ошибка!');
App.warn('Осторожнее с этим!');

// Включение отладочного режима
App.debug(true);

// Выключение и включение событий по их типу:
App.disableEvents(App.events.SOME_EVENT);
App.enableEvents(App.events.SOME_EVENT);

App.disableEvents([App.events.SOME_EVENT, App.events.SOME_OTHER_EVENT]);
App.enableEvents([App.events.SOME_EVENT, App.events.SOME_OTHER_EVENT]);
```

### Фреймворк состоит из четырех структурных сущностей: Utils, LogEngine, EventsEngine и DefineResolveEngine.

SP.X.Utils — это набор вспомогательных методов (описание добавлю позже).

SP.X.LogEngine — это "движок" для логгирования. Для добавления методов log, mark, error и warn для произвольного объекта, можно использовать метод create:

```javascript
SP.X.LogEngine.create( myObject );
```

Аналогичным образом работают движки для define/resolve и событий:

```javascript
SP.X.DefineResolveEngine.create( myObject );
SP.X.EventsEngine.create( myObject );
```

Соответственно, они добавят свой функционал для любого объекта.


### Существует также метод SP.X.extend, который схож с define, но создан для объявления глобальных сущностей и не зависит от существования или количества созданных контроллеров:

```javascript
SP.X.extend('modules.DelayedSRCHelper', ['utils', 'DOMUtils'], function( utils, DOMUtils ){
	//
}
```

 — в таком случае у каждого контроллера будет существовать modules.DelayedSRCHelper.

 С помощью SP.X.extend я добавил несколько расширений для фреймворка (папка extensions), описание которых я подготовлю по мере их тестирования и отладки.

 Thanks, Михаил Чистяков / Hauts.