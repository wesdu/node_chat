	//card system start
	var _Card,
		_ControlPad,
		CONFIG;
		
	CONFIG={};
	CONFIG.maxID= 1;
	CONFIG.zIndex= 1;
	CONFIG.cards={};
	//obj包装成Class
	var Class= function(obj) {
		var newClass = function() {
			this.init.apply(this, arguments);
		}
		newClass.prototype = obj;
		return newClass;
	};
	var _ControlPad= {
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
	var _Card= {
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
			var id= CONFIG.maxID++;
			this.id= id;
			//全局维护
			CONFIG.cards[id]= this;
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
					if(_this.isShortClick) {
						_this.toEditorMode();
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
	var _Panel={
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
	var login= function(option) {
		alert(option.name);
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
			 avatar;
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
				name:name,
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