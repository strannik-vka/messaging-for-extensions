'use strict';

var message = {

	// Прием сообщений для Content, Popup и Background
	onMessage: function(){
		var backMessage;
		if(window.location.href.indexOf('chrome-extension://') > -1){
			chrome.runtime.onMessage.addListener(function(data, sender, callback){
				var obj = data.data ? data.data : false;
				window[data.obj_name][data.method].call(1, obj, function(response){
					callback(response);
				});
				return true;
			});
		} else {
			chrome.extension.onRequest.addListener(function(data, sender, callback){
				var obj = data.data ? data.data : false;
				window[data.obj_name][data.method].call(1, obj, function(response){
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
	send: function(obj_name, method, data, callback, tab_id){
		if(typeof data === 'function'){
			tab_id = callback;
			callback = data;
			data = false;
		}
		
		var send_data = {obj_name: obj_name, method: method, data: data, tab_id: tab_id, callback: callback};
		
		if(tab_id){
			if(message.contentActiveStatus){
				chrome.tabs.sendRequest(tab_id, send_data, function(backMessage){
					if(callback){
						callback(backMessage);
					}
				});
			} else {
				setTimeout(function(){
					message.send(obj_name, method, data, callback, tab_id);
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