var fu = exports,
	sys = require("sys");
fu.sayhi= function() {
	var inner;
	function a() {
		if(!inner) {
			sys.puts("hihihi");
			inner='a';
		}
		sys.puts('nononno');

	}
	return function() {
		a();
	}

};
var t= fu.sayhi();
for(var i=0;i<4;i++) {
	t();
}





