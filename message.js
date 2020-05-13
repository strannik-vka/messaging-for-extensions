'use strict';

var message = {

	// Прием сообщений для Content, Popup и Background
	onMessage: function(){
		var startFunction = function(method, data, callback){
			var old;

			if(method.indexOf('.') > -1){
				var method_arr = method.split('.');
				$.each(method_arr, function(i, item){
					if(old){
						old = old[item];
					} else {
						old = window[item];
					}
				});
			} else {
				old = method;
			}
			
			if(data){
				old.call(1, data, function(response){
					callback(response);
				});
			} else {
				old.call(1, function(response){
					callback(response);
				});
			}
		}

		if(window.location.href.indexOf('chrome-extension://') > -1){
			chrome.runtime.onMessage.addListener(function(data, sender, callback){
				startFunction(data.obj_name, data.data, function(response){
					callback(response);
				});
				return true;
			});
		} else {
			chrome.extension.onRequest.addListener(function(data, sender, callback){
				startFunction(data.obj_name, data.data, function(response){
					callback(response);
				});
				return true;
			});
			
			setTimeout(function(){
				message.send('message', 'contentActive');
			}, 1000);
		}
	},
	
	contentActiveStatus: false,
	contentActive: function(){
		message.contentActiveStatus = true;
	},
	
	// Отправить сообщения в Content, Popup и Background
	send: function(obj_name, data, callback, tab_id){
		if(typeof data === 'function'){
			tab_id = callback;
			callback = data;
			data = false;
		}
		
		if(typeof callback !== 'function' && callback){
			tab_id = callback;
			callback = false;
		}
		
		var send_data = {obj_name: obj_name, data: data, tab_id: tab_id, callback: callback};
		
		if(tab_id){
			if(message.contentActiveStatus){
				chrome.tabs.sendRequest(tab_id, send_data, function(backMessage){
					if(callback){
						callback(backMessage);
					}
				});
			} else {
				setTimeout(function(){
					message.send(obj_name, data, callback, tab_id);
				}, 0);
			}
		} else {
			chrome.runtime.sendMessage(send_data, function(backMessage){
				if(callback){
					callback(backMessage);
				}
			});
		}
	}
	
}

window.onload = message.onMessage();
