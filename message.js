'use strict';

var message = {

	init: function(){
		message.onMessage();
		message.tab.onRemoved();
	},

	tab: {
		list: [],
		// Проверить готова ли вкладка контента к сообщению
		check: function(tab_id, callback){
			if(message.tab.list.indexOf(tab_id) == -1){
				callback(false);
			} else {
				callback(true);
			}
		},
		// Чтобы знать какие вкладки контента готовы получить соощение
		onRemoved: function(){
			if(location.href.indexOf('_generated_background_page') > -1){
				chrome.tabs.onRemoved.addListener(function(tab_id){
					var index = message.tab.list.indexOf(tab_id);
					if(index > -1){
						message.tab.list.splice(index, 1);
					}
				});
			}
		}
	},

	// Прием сообщений для Content, Popup и Background
	onMessage: function(){
		var startFunction = function(method, data, callback){
			var old;

			if(method.indexOf('.') > -1){
				var method_arr = method.split('.');
				method_arr.forEach(function(item, i){
					if(old){
						if(method_arr.length-1 == i){
							method = item;
						} else {
							old = old[item];
						}
					} else {
						old = window[item];
					}
				});
			} else {
				old = window;
			}

			if(data){
				old[method](data, function(response){
					callback(response);
				});
			} else {
				old[method](function(response){
					callback(response);
				});
			}
		}

		if(location.href.indexOf('chrome-extension://') > -1){
			if(location.href.indexOf('_generated_background_page') > -1){
				chrome.runtime.onMessage.addListener(function(data, sender, callback){
					if(data.obj_name == 'contentActive'){
						if(message.tab.list.indexOf(sender.tab.id) == -1){
							message.tab.list.push(sender.tab.id);
						}
						callback(true);
					} else {
						startFunction(data.obj_name, data.data, function(response){
							callback(response);
						});
					}
					return true;
				});
			}
		} else {
			chrome.extension.onRequest.addListener(function(data, sender, callback){
				startFunction(data.obj_name, data.data, function(response){
					callback(response);
				});
				return true;
			});
			
			setTimeout(function(){
				message.send('contentActive');
			}, 1000);
		}
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
			var next = function(tab_id){
				message.send('message.tab.check', tab_id, function(open){
					if(open){
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
				});
			}

			if(tab_id == 'current'){
				chrome.tabs.getSelected(null, function(tab){
					next(tab.id);
				});
			} else {
				next(tab_id);
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

window.onload = message.init();
