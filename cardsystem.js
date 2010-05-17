	//card system start
	var _Card,
		_ControlPad,
		CONFIG;
	CONFIG={};
	CONFIG.maxID= 1;
	CONFIG.zIndex= 1;
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
			this.buildDom();
			this.buildEvent();
		},
		buildDom:function() {
			this.el={};
			this.el.applyB= $(document.createElement("div")); 
			this.el.pad= $(document.createElement("div"));
			var applyB= this.el.applyB;
			var pad= this.el.pad;
			applyB.addClass("apply_button");
			applyB.html("Apply");
			pad.addClass("control_pad");
			pad.html('<div class="content">\
				width:<input type="text" value='+this.host._width+' />\
				height:<input type="text" value='+this.host._height+' />\
			</div>');
			this.setSize();
			this.setZIndex();
			this.setPosition();
			pad.append(applyB);
			$('body').after(pad);
		},
		buildEvent:function() {
			var _this= this;
			this.el.applyB.click(function(e){
				_this.host._width= parseInt(_this.el.pad.find("input")[0].value,10);
				_this.host._height= parseInt(_this.el.pad.find("input")[1].value,10);
				_this.host.setSize();
			});
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
		},
		buildDom:function() {
			this.el= {};
			this.el.card= $(document.createElement("div"));
			this.el.cb= $(document.createElement("div")); 
			var card= this.el.card;
			var cb= this.el.cb;
			var id= CONFIG.maxID++;
			this.id= id;
			card.addClass("card");
			cb.addClass("control_button");
			this.setSize();
			this.setPosition();
			this.setZIndex();
			if(this._type=="img") {
				this.el.img= $(document.createElement("img"));
				var img= this.el.img;
				img.attr("src",this._src);
				img.attr("alt","card-"+id);
				card.append(img);
			}
			else {
				card.html("card-"+id);
			}
			card.append(cb);
			$('body').after(card);
		},
		buildEvent:function() {
			var _this= this;
			this.enableDrage();
			/*
			this.el.card.mouseover(function(){
				_this.el.cb.css("display","block");
			});
			this.el.card.mouseout(function(){
				_this.el.cb.css("display","none");
			});
			*/
			this.enableDrage();
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
	}
	var wrapCard= function(option) {
		var fn= Class(_Card);
		return new fn(option);
	};
	$(document).ready(function() {
  		//ready
		var card1= wrapCard({left:100,top:100});
		var card2= wrapCard({left:300,top:400,type:'img',
			src:'http://www.webdesignerwall.com/wp-content/uploads/2010/03/pleasefixtheiphone.jpg'
		});
	});