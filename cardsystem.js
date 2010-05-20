if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());	
	//card system start
	var _Card,
		_ControlPad,
		_Panel,
		transmission_errors,
		CONFIG;
		
	CONFIG={};
	CONFIG.maxID= 1;
	CONFIG.zIndex= 1;
	CONFIG.name= null;
	CONFIG.last_message_time= 1;
	CONFIG.cards={};
	//obj包装成Class
	var Class= function(obj) {
		var newClass = function() {
			this.init.apply(this, arguments);
		}
		newClass.prototype = obj;
		return newClass;
	};
	_ControlPad= {
		init:function(host,type){
			this.type= type;
			this.host= host;
			(this["buildDom_"+type])();
			(this["buildEvent_"+type])();
		},
		buildDom_text:function() {
			this.el={};
			this.el.applyB= $(document.createElement("div")); 
			this.el.pad= $(document.createElement("div"));
			var applyB= this.el.applyB;
			var pad= this.el.pad;
			applyB.addClass("apply_button");
			applyB.html("Apply");
			pad.addClass("control_pad");
			pad.html('<div class="content">\
					<div class="tab">\
					width:<input type="text" value=' + this.host._width + ' />\
					height:<input type="text" value=' + this.host._height + ' />\
					</div>\
					<div class="tab">\
					size:<input type="text" value="13" />\
					</div>\
					<div class="tab">\
					color:\
					<h3 class="button orange" ></h3>\
					<h3 class="button blue" ></h3>\
					<h3 class="button green" ></h3>\
					<h3 class="button black" ></h3>\
					</div>\
					<div class="tab">\
					<textarea class="text_field" ></textarea>\
					</div>\
			</div>');
			this.setSize();
			this.setZIndex();
			this.setPosition();
			pad.append(applyB);
			$('body').after(pad);
		},
		buildEvent_text:function() {
			var _this= this;
			var colorButtons= this.el.pad.find("h3");
			var colors= ["#F7921D","#0096CF","#699E21","#3A3A3A"];
			var color;
			$(colorButtons).each(function(i,dom){
				$(dom).click(function(e){	
					if(_this.__lastColorButton) {
						$(_this.__lastColorButton).removeClass("select");
					}
					$(dom).addClass("select");
					color= colors[i];
					_this.__lastColorButton= dom;
				});
			});
			this.el.applyB.click(function(e){
				//调整大小
				_this.host._width= parseInt(_this.el.pad.find("input")[0].value,10);
				_this.host._height= parseInt(_this.el.pad.find("input")[1].value,10);
				_this.host.setSize();
				//获取字体大小
				var fontSize= parseInt(_this.el.pad.find("input")[2].value,10);
				_this.host._fontSize= fontSize;
				_this.host.setFontSize();
				_this.host._fontColor= color;
				_this.host.setFontColor();
				_this.host._value= _this.el.pad.find("textarea")[0].value;
				_this.host.setValue();
			});
		},
		buildDom_img:function() {
			this.el={};
			this.el.applyB= $(document.createElement("div")); 
			this.el.pad= $(document.createElement("div"));
			var applyB= this.el.applyB;
			var pad= this.el.pad;
			applyB.addClass("apply_button");
			applyB.html("Apply");
			pad.addClass("control_pad");
			var _html= '<div class="content">\
					<div class="tab">\
					width:<input type="text" value=' + this.host._width + ' />\
					height:<input type="text" value=' + this.host._height + ' />\
					</div>\
					<div class="tab">\
					url:<input type="text" value="" style="width:170px" />\
					</div>\
					<div class="tab">\
						<div class="drag_outter" >&nbsp;Drag a picture here</div>\
					</div>\
			</div>';
			pad.html(_html);
			this.setSize();
			this.setZIndex();
			this.setPosition();
			//拖拽区域
			this.el.dragOutter=  $(pad.find(".drag_outter")[0]);
			this.el.dragInput= $(pad.find(".drag_input")[0]);
			pad.append(applyB);
			$('body').after(pad);			
		},
		buildEvent_img:function() {
			var _this= this;
			var dragOutter= this.el.dragOutter;
			var dragInput=  this.el.dragInput;
			this.el.applyB.click(function(e){
				//调整大小
				_this.host._width= parseInt(_this.el.pad.find("input")[0].value,10);
				_this.host._height= parseInt(_this.el.pad.find("input")[1].value,10);
				_this.host.setSize();
				_this.host._src= _this.el.pad.find("input")[2].value;
				if (_this.host._src) {
					_this.host.setImg();
				}
			});
			if(typeof FileReader != "undefined") {
				//for firefox 3.6+
				
			}
			else {
				//for chrome 2.0+
				//dragInput[0].onchange= function(e){
				//	_this.uploadFiles(this.files);
				//};
	            dragOutter[0].ondragenter= function (e) {
					dragOutter.html("&nbsp Release Your Button");
					_this.el.dragOutter.css("background","#faa51a");
					e.dataTransfer.dropEffect = 'copy';
	                e.preventDefault();
	                return false;
	            };
	            dragOutter[0].ondragover= function (e) {
	                e.preventDefault();
	                return false;
	            };
				dragOutter[0].ondrop= function(e) {
					e.preventDefault();
					dragOutter.html("&nbsp;Drag a picture here");
					_this.uploadFiles(e.dataTransfer.files);
					_this.el.dragOutter.css("background","");
				};
				dragOutter[0].ondragleave= function (e) {
					dragOutter.html("&nbsp;Drag a picture here");
					_this.el.dragOutter.css("background","");
	            };
                				
				
			}
		},
		uploadFiles:function(files) {
			var _this= this;
			//this.el.dragOutter.html(files[0].fileName+files[0].fileSize+files[0]);
			//XHR
			$.ajax({
			  'contentType': 'multipart/form-data',
			  'beforeSend': function(xhr) {
				  xhr.open('post', '/pushimg', true);
				  xhr.setRequestHeader('Content-Type', 'multipart/form-data');
				  xhr.setRequestHeader('X-File-Name', files[0].fileName);
				  xhr.setRequestHeader('X-File-Size', files[0].fileSize);
				  xhr.send(files[0]);
			  },
			  dataType: "json",
			  success: function(data) {
				_this.host._src= data.src;
				_this.host.setImg();
			  }
			});
		},
		buildDom_flash:function() {
			this.el={};
			this.el.applyB= $(document.createElement("div")); 
			this.el.pad= $(document.createElement("div"));
			var applyB= this.el.applyB;
			var pad= this.el.pad;
			applyB.addClass("apply_button");
			applyB.html("Apply");
			pad.addClass("control_pad");
			pad.html('<div class="content">\
					<div class="tab">\
					width:<input type="text" value=' + this.host._width + ' />\
					height:<input type="text" value=' + this.host._height + ' />\
					</div>\
					<div class="tab">\
					url:<input type="text" value="" style="width:170px" />\
					</div>\
			</div>');
			this.setSize();
			this.setZIndex();
			this.setPosition();
			pad.append(applyB);
			$('body').after(pad);			
		},
		buildEvent_flash:function(){
			var _this= this;
			this.el.applyB.click(function(e){
				//调整大小
				_this.host._width= parseInt(_this.el.pad.find("input")[0].value,10);
				_this.host._height= parseInt(_this.el.pad.find("input")[1].value,10);
				_this.host.setSize();
				_this.host._src= _this.el.pad.find("input")[2].value;
				if (_this.host._src) {
					_this.host.el.content.html('<embed \
						src="' + _this.host._src + '" \
						quality="high" style="width:100%;height:100%" align="middle" \
						allowScriptAccess="sameDomain" type="application/x-shockwave-flash">\
					</embed>');
				}
			});					
		},
		destory:function() {
			var _this= this;
			this.el.pad.remove();
			//删除data
		},
		reFlow:function() {
			this.setPosition();
			this.setZIndex();
		},
		setHeight:function() {
			this.el.pad.css("height",this._height||200);
		},
		setWidth:function() {
			this.el.pad.css("width",this._width||220);
		},
		setSize:function() {
			this.setHeight();
			this.setWidth();
		},
		setPosition:function() {
			this.el.pad.css("left",this.host._left+this.host._width+20);
			this.el.pad.css("top",this.host._top+10);
		},
		setZIndex:function() {
			this.el.pad.css("zIndex",this.host._zIndex+1);
		},
		hide:function() {
			this.el.pad.css("display","none");
		},
		show:function() {
			this.setZIndex();
			this.setPosition();
			this.el.pad.css("display","block");
		},
		toggle:function() {
			if(this.el.pad.css("display")=="none") {
				this.show();
			}
			else {
				this.hide();
			}
		}
	};
	var wrapControlPad= function(host,type) {
		var fn= Class(_ControlPad);
		return new fn(host,type);
	};
	_Card= {
		init:function(option){
			this.formatOption(option);
			this.buildDom();
			this.buildEvent();
		},
		formatOption: function(option) {
			this.option= option;
			this._type= option.type||"text";
			this._src= option.src||null;
			this._left = option.left;
			this._top = option.top;
			this._height= option.height||200;
			this._width= option.width||200;
			this._id= option.id||null;
		},
		buildDom:function() {
			this.el= {};
			//容器
			this.el.card= $(document.createElement("div"));
			//关闭按钮
			this.el.cb= $(document.createElement("div")); 
			var card= this.el.card;
			var cb= this.el.cb;
			//每个容器的独立ID
			var id= this._id||CONFIG.name+CONFIG.maxID++;
			this.id= id;
			//全局维护
			CONFIG.cards[id]= this;
			card.attr("id",id);
			card.addClass("card");
			cb.addClass("close_button_outter");
			cb.html('<div class="close_button_inner">X</div>');
			this.setSize();
			this.setPosition();
			//设置层级
			this.setZIndex();
			if(this._type=="img") {
				this.el.img= $(document.createElement("img"));
				var img= this.el.img;
				img.attr("src",this._src||"sample.png");
				img.attr("alt","card-"+id);
				card.append(img);
			}
			else if(this._type=="flash") {
				card.html('<div class="content"><div style="text-align:center;"><h1>flash</h1></div></div>');
			}
			else {
				card.html('<div class="content"><div style="text-align:center;"><h1>text</h1></div></div>');
			}
			card.append(cb);
			this.el.content= $(card.find(".content")[0]);
			$('body').after(card);
		},
		buildEvent:function() {
			var _this= this;
			this.enableDrage();
			this.el.cb.click(function(e){
				e.stopPropagation();
				e.preventDefault();
				_this.destory();
				//通知后台
			})
			this.el.card.mouseover(function(){
				_this.el.cb.show();
			});
			this.el.card.mouseout(function(){
				_this.el.cb.hide();
			});
			this.enableDrage();
		},
		destory:function(){
			this.el.card.remove();
			this.commander.destory();
			delete this;
		},
		setImg:function() {
			this.el.img.attr("src",this._src);
		},
		setValue:function() {
			$(this.el.content).html(this._value);
		},
		setFontSize:function() {
			$(this.el.content).css("fontSize",this._fontSize);
		},
		setFontColor:function() {
			$(this.el.content).css("color",this._fontColor);
		},
		setHeight:function() {
			var card= this.el.card;
			card.css("height",this._height);
		},
		setWidth:function() {
			var card= this.el.card;
			card.css("width",this._width);			
		},
		setSize:function() {
			this.setHeight();
			this.setWidth();
			if(this.commander) {
				this.commander.reFlow();
			}
		},
		setPosition:function() {
			var card= this.el.card;
			card.css("left",this._left);
			card.css("top",this._top);
			if(this.commander) {
				this.commander.reFlow();
			}
		},
		enableDrage:function() {
			var _this= this;
			var card= this.el.card;
			card.mousedown(function(e){
				e.preventDefault();
				_this.setZIndex();
				_this._oldX= e.pageX;
				_this._oldY= e.pageY;
				_this._pageX= e.pageX;
				_this._pageY= e.pageY;
				_this.isShortClick= true;
				$(window).mousemove(function(e){
					e.preventDefault();
					if (Math.abs(e.pageX - _this._oldX) + Math.abs(e.pageY - _this._oldY) > 20) {
						_this.isShortClick= false;;
						_this._left = e.pageX - _this._pageX + _this._left;
						_this._top = e.pageY - _this._pageY + _this._top;
						_this.setPosition();
						_this._pageX= e.pageX;
						_this._pageY= e.pageY;
					}
				});
				$(window).mouseup(function(e){
					if (_this.isShortClick) {
						_this.toEditorMode();
					}
					else {
						$.ajax({
							cache: false,
							type: "GET",
							dataType: "json",
							url: "/send",
							data: {
								id: CONFIG.id,
								text: JSON.stringify({pos:{left:_this._left,top:_this._top}})
							},
							error: function(){
							
							},
							success: function(){
							
							}
						});
					}
					$(window).unbind();
					_this.isShortClick= true;
				});
			});

		},
		setZIndex:function() {
			this._zIndex= CONFIG.zIndex++;
			this.el.card.css("zIndex",this._zIndex);
		},
		toEditorMode:function() {
			if (!this.commander) {
				this.commander = wrapControlPad(this,this._type);
			}
			else {
				this.commander.toggle();
			}
		},
		push:function() {
			//推参数
		},
		pull:function() {
			//拉参数
		}
	};
	_Panel={
		init:function(option){
			this.formatOption(option);
			this.buildDom();
			this.buildEvent();
		},
		formatOption:function(option) {
			this._left= option.left;
			this._top= option.top;
		},
		buildDom:function(){
			this.el={};
			this.el.panel= $(document.createElement("div"));
			this.el.head= $(document.createElement("div"));
			this.el.body= $(document.createElement("div"));
			this.el.foot= $(document.createElement("div"));
			var body= this.el.body;
			var head= this.el.head;
			var panel= this.el.panel;
			var foot= this.el.foot;
			head.addClass("head");
			panel.addClass("panel");
			body.addClass("body");
			body.html('\
				<div class="panel_body_icon panel_body_text" >TEXT</div>\
				<div class="panel_body_icon panel_body_img" ></div>\
				<div class="panel_body_icon panel_body_flash" >FLASH</div>\
			');
			foot.addClass("foot");
			panel.append(head);
			panel.append(body);
			panel.append(foot);
			$("body").after(panel);
			this.setPosition();			
		},
		buildEvent:function(){
			_this= this;
			var head= this.el.head;
			var buttons= this.el.body.find("div");
			head.mousedown(function(e){
				e.preventDefault();
				_this.setZIndex();
				_this._oldX= e.pageX;
				_this._oldY= e.pageY;
				_this._pageX= e.pageX;
				_this._pageY= e.pageY;
				_this.isShortClick= true;
				$(window).mousemove(function(e){
					e.preventDefault();
					if (Math.abs(e.pageX - _this._oldX) + Math.abs(e.pageY - _this._oldY) > 20) {
						_this.isShortClick= false;;
						_this._left = e.pageX - _this._pageX + _this._left;
						_this._top = e.pageY - _this._pageY + _this._top;
						_this.setPosition();
						_this._pageX= e.pageX;
						_this._pageY= e.pageY;
					}
				});
				$(window).mouseup(function(e){
					if(_this.isShortClick) {
						_this.shortClick();
					}
					$(window).unbind();
					_this.isShortClick= true;
				});
			});
			$(buttons).each(function(i,dom){
				$(dom).mousedown(function(e){
					e.preventDefault();
					var clone= $(dom).clone();
					clone.css("position","absolute");
					var left= e.pageX-22.5;
					var top= e.pageY-20;
					clone.css("left",left);
					clone.css("top",top);
					$("body").after(clone);
					var types= ["text","img","flash"];
					$(window).mousemove(function(e){
						e.preventDefault();
						left = e.pageX - 22.5;
						top = e.pageY - 20;
						clone.css("left",left);
						clone.css("top",top);
						clone.css("opacity",0.6);
					});
					$(window).mouseup(function(e){
						$(window).unbind();
						clone.remove();
						wrapCard({left:left-50,top:top-50,type:types[i]});
					});
				});
			});
		},
		setZIndex:function() {
			this._zIndex= CONFIG.zIndex++;
			this.el.panel.css("zIndex",this._zIndex);			
		},
		setPosition:function() {
			var panel= this.el.panel;
			panel.css("left",this._left);
			panel.css("top",this._top);
		},
		shortClick:function(){
			this.el.body.toggle();
		}
	};
	var wrapCard= function(option) {
		var fn= Class(_Card);
		return new fn(option);
	};
	var wrapPanel= function(option) {
		var fn= Class(_Panel);
		return new fn(option)
	};
	function addMessage(nick,data,timestamp) {
		
	}
	function userJoin(nick,timestamp) {
		
	}
	function userPart(nick,timestamp) {
		
	}
	function longPoll (data) {
	  if (transmission_errors > 2) {
	    //do something
	    return;
	  }
	
	  //process any updates we may have
	  //data will be null on the first call of longPoll
	  if (data && data.messages) {
	    for (var i = 0; i < data.messages.length; i++) {
	      var message = data.messages[i];
	
	      //track oldest message so we only request newer messages from server
	      if (message.timestamp > CONFIG.last_message_time)
	        CONFIG.last_message_time = message.timestamp;
	
	      //dispatch new messages to their appropriate handlers
	      switch (message.type) {
	        case "msg":
	          addMessage(message.nick, message.text, message.timestamp);
	          break;
	        case "join":
	          userJoin(message.nick, message.timestamp);
	          break;
	        case "part":
	          userPart(message.nick, message.timestamp);
	          break;
	      }
	    }
		
	  }
	
	  //make another request
	  $.ajax({ cache: false
	         , type: "GET"
	         , url: "/recv"
	         , dataType: "json"
	         , data: { since: CONFIG.last_message_time, id: CONFIG.id }
	         , error: function () {
	             transmission_errors += 1;
	             //don't flood the servers on error, wait 10 seconds before retrying
	             setTimeout(longPoll, 10*1000);
	           }
	         , success: function (data) {
	             transmission_errors = 0;
	             //if everything went well, begin another request immediately
	             //the server will take a long time to respond
	             //how long? well, it will wait until there is another message
	             //and then it will return it to us and close the connection.
	             //since the connection is closed when we get data, we longPoll again
	             longPoll(data);
	           }
	         });
	}
	var login= function(option) {
		//{name:,color:,avatar:}
		$("#user_frame").hide();
		
		var panel= wrapPanel({left:20,top:20});
		$.ajax({ cache: false
           , type: "GET" 
           , dataType: "json"
           , url: "/join"
           , data: option
           , error: function () {
              
             }
           , success: function(session) {
				if (session.error) {
				  //do something
				  return;
				}
		   		CONFIG.name= option.name;
				CONFIG.id   = session.id;
				longPoll();
		   }
        });
		//TODO
	};
	var pre_login= function() {
		var user_frame= $("#user_frame"),
			 user= $("#user"),
			 user_avatar= $("#user_avatar"),
			 user_name= $("#user_name"),
			 user_button_area= $("#user_button_area"),
			 buttons= user_button_area.find("div"),
			 user_name_input= $("#user_name_input"),
			 user_login_button= $("#user_login_button"),
			 colors=["orange","black","green","blue"],
			 dropped=false,
			 color="",
			 name,
			 avatar="/avatar.jpg";
		color= colors[0];
		user.addClass(color);
		buttons.each(function(i,dom){
			$(dom).click(function(e){
				user.removeClass(color);
				color= colors[i];
				user.addClass(color);
			});
		});
		user_login_button.click(function(e){
			name= user_name_input[0].value||("G"+Math.floor(Math.random()*99999999999).toString());
			var option= {
				nick:name,
				color:color,
				avatar:avatar
			};
			login(option);
		});
	  	user_avatar[0].ondragenter= function (e) {
			user_avatar.css("background","#faa51a");
			e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            return false;
        };
        user_avatar[0].ondragover= function (e) {
            e.preventDefault();
            return false;
        };
		user_avatar[0].ondrop= function(e) {
			e.preventDefault();
			dropped=true;
			//do something
			var files= e.dataTransfer.files;
			$.ajax({
			  'contentType': 'multipart/form-data',
			  'beforeSend': function(xhr) {
				  xhr.open('post', '/pushimg', true);
				  xhr.setRequestHeader('Content-Type', 'multipart/form-data');
				  xhr.setRequestHeader('X-File-Name', files[0].fileName);
				  xhr.setRequestHeader('X-File-Size', files[0].fileSize);
				  xhr.send(files[0]);
			  },
			  dataType: "json",
			  success: function(data) {
				user_avatar.css("background","url("+data.src+")");
				avatar=data.src;
			  }
			});
			//
		};
		user_avatar[0].ondragleave= function (e) {
			if (!dropped) {
				user_avatar.css("background", "url(/avatar.jpg)");
			}
			dropped= false;
        };
	};
	$(document).ready(function() {
		pre_login();
  		//ready
		//var panel= wrapPanel({left:20,top:20});
		/*
		var card1= wrapCard({left:100,top:100});
		var card2= wrapCard({left:300,top:400,type:'img',
			src:'http://www.webdesignerwall.com/wp-content/uploads/2010/03/pleasefixtheiphone.jpg'
		});
		*/
		
	});