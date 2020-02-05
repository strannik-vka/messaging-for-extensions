# messaging-for-extensions
Обмен сообщениями для расширения между background, popup, content

***class_name*** - название переменной содержащая функцию<br>
***function_name*** - название функции в переменной, которую надо запустить<br>
***data*** - данные для отправки, это может быть строка или объект<br>
***callback*** - функция обратного вызова<br>
***tab_id*** - id вкладки, нужен для передачи в content
```js
message.send(class_name, function_name, data, callback, tab_id);
```
## пример
Допустим в "content_scripts" подключен content.js с содержимым:
```js
var content_test = {
  function_test: function(obj, callback){
    console.log('Пришли данные в content:');
    console.log(obj);
    if(callback) callback();
  }
}
```
Допустим в "background" подключен bg.js с содержимым:
```js
var bg_test = {
  function_test: function(obj, callback){
    console.log('Пришли данные в background:');
    console.log(obj);
    if(callback) callback();
  }
}
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
