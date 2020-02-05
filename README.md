# messaging-for-extensions
Обмен сообщениями для расширения между background, popup, content

***class_name*** - название переменной содержащая функцию<br>
***function_name*** - название функции в переменной, которую надо запустить<br>
***data*** - (не обязательно) данные для отправки, это может быть строка или объект<br>
***callback*** - (не обязательно) функция обратного вызова<br>
***tab_id*** - id вкладки если передаем в content, иначе не нужно
```js
message.send(class_name, function_name, data, callback, tab_id); // отправка со всеми параметрами
message.send(class_name, function_name, callback, tab_id); // отправка без данных
message.send(class_name, function_name, tab_id); // отправка без данных и обратного вызова 
message.send(class_name, function_name); // просто вызов функции находящаяся в background или popup
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
message.send('content_test', 'function_test', 'Привет content!', function(response){
  consile.log('content вернул результат:');
  console.log(obj);
}, tab_id);
```
Из "content" отправляем в "background"
```js
message.send('bg_test', 'function_test', 'Привет background!', function(response){
  consile.log('background вернул результат:');
  console.log(obj);
});
```
С "popup" всё аналогично!
