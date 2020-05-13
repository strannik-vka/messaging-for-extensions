# messaging-for-extensions
Обмен сообщениями для расширения между background, popup, content

***function*** - функция, которую надо запустить<br>
***data*** - (не обязательно) данные для отправки, это может быть строка или объект<br>
***callback*** - (не обязательно) функция обратного вызова<br>
***tab_id*** - id вкладки если передаем в content, иначе не нужно
```js
message.send('function', data, callback, tab_id); // отправка со всеми параметрами
message.send('function', callback, tab_id); // отправка без данных
message.send('function', tab_id); // отправка без данных и обратного вызова 
message.send('function'); // просто вызов функции находящаяся
```
## пример
Допустим в manifest "content_scripts" подключен ct.js с содержимым:
```js
var content_test = {
  function_test: function(obj, callback){
    console.log('Пришли данные в content:');
    console.log(obj);
    if(callback) callback();
  }
}
```
Допустим в manifest "background" подключен bg.js с содержимым:
```js
var bg_test = {
  function_test: function(obj, callback){
    console.log('Пришли данные в background:');
    console.log(obj);
    if(callback) callback();
  }
}
```
В "content_scripts" и "background" подключаем message.js, в нашем примере будет так:
```js
"background": {
  "scripts": [
    "bg.js",
    "message.js"
  ]
},
"content_scripts":[{
  "matches": ["<all_urls>"],
  "js": [
    "ct.js",
    "message.js"
  ]
}]
```
Из "background" отправляем в "content"
```js
message.send('content_test.function_test', 'Привет content!', function(response){
  console.log('content вернул результат:');
  console.log(response);
}, tab_id);
```
Из "content" отправляем в "background"
```js
message.send('bg_test.function_test', 'Привет background!', function(response){
  console.log('background вернул результат:');
  console.log(response);
});
```
С "popup" всё аналогично!
