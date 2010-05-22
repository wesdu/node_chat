HOST = null; // localhost
PORT = 80;

var fu = require("./fu"),
    sys = require("sys"),
    url = require("url"),
    qs = require("querystring");

var MESSAGE_BACKLOG = 200,
    SESSION_TIMEOUT = 60 * 1000,
    HISTORY= {},
    STORE_IMG= {},
    channels= {};
    

var Channel = function () {
  var messages = [],
      callbacks = [];
	
  this.appendMessage = function (nick, type, text) {
    var m = { nick: nick
            , type: type // "msg", "join", "part"
            , text: text
            , timestamp: (new Date()).getTime()
            };

    switch (type) {
      case "msg":
        sys.puts("<" + nick + "> " + text);
        break;
      case "join":
        sys.puts(nick + " join");
        break;
      case "part":
        sys.puts(nick + " part");
        break;
    }

    messages.push( m );

    while (callbacks.length > 0) {
      callbacks.shift().callback([m]);
    }

    while (messages.length > MESSAGE_BACKLOG)
      messages.shift();
  };

  this.query = function (since, callback) {
    var matching = [];
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      if (message.timestamp > since)
        matching.push(message)
    }

    if (matching.length != 0) {
      callback(matching);
    } else {
      callbacks.push({ timestamp: new Date(), callback: callback });
    }
  };

  // clear old callbacks
  // they can hang around for at most 30 seconds.
  setInterval(function () {
    var now = new Date();
    while (callbacks.length > 0 && now - callbacks[0].timestamp > 30*1000) {
      callbacks.shift().callback([]);
    }
  }, 3000);
};

var sessions = {};

function createSession (nick,channel) {
  if (nick.length > 50) return null;
  if (/[^\w_\-^!]/.exec(nick)) return null;

  for (var i in sessions) {
    var session = sessions[i];
    if (session && session.nick === nick) return null;
  }

  var session = { 
    nick: nick, 
    id: Math.floor(Math.random()*99999999999).toString(),
    timestamp: new Date(),
    channel: channel,
    poke: function () {
      session.timestamp = new Date();
    },

    destroy: function () {
      channel.appendMessage(session.nick, "part");
      delete sessions[session.id];
    }
  };

  sessions[session.id] = session;
  return session;
}

// interval to kill off old sessions
setInterval(function () {
  var now = new Date();
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];

    if (now - session.timestamp > SESSION_TIMEOUT) {
      session.destroy();
    }
  }
}, 1000);

fu.listen(PORT, HOST);

fu.get("/", fu.staticHandler("ui.html"));
fu.get("/default.css", fu.staticHandler("default.css"));
fu.get("/cardsystem.js", fu.staticHandler("cardsystem.js"));
fu.get("/jquery-1.2.6.min.js", fu.staticHandler("jquery-1.2.6.min.js"));
fu.get("/json.js", fu.staticHandler("json.js"));
fu.get("/img.png", fu.staticHandler("img.png"));
fu.get("/sample.png", fu.staticHandler("sample.png"));
fu.get("/avatar.jpg", fu.staticHandler("avatar.jpg"));


fu.get("/who", function (req, res) {
  var nicks = [];
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];
    nicks.push(session.nick);
  }
  res.simpleJSON(200, { nicks: nicks });
});

fu.get("/join", function (req, res) {
  var nick = qs.parse(url.parse(req.url).query).nick;
  var color = qs.parse(url.parse(req.url).query).color;
  var avatar = qs.parse(url.parse(req.url).query).avatar; 
  var chnid  = qs.parse(url.parse(req.url).query).chnid;
  if (nick == null || nick.length == 0) {
    res.simpleJSON(400, {error: "Bad nick."});
    return;
  }
  if(!channels[chnid]){
    channels[chnid] = new Channel(); 
  }
  var session = createSession(nick,channels[chnid]);
  if (session == null) {
    res.simpleJSON(400, {error: "Nick in use"});
    return;
  }

  //sys.puts("connection: " + nick + "@" + res.connection.remoteAddress);
  session.channel.appendMessage(session.nick, "join", JSON.stringify({color:color,avatar:avatar}) );
  res.simpleJSON(200, { id: session.id, nick: session.nick});
});
fu.get("/part", function (req, res) {
  var id = qs.parse(url.parse(req.url).query).id;
  var session;
  if (id && sessions[id]) {
    session = sessions[id];
    session.destroy();
  }
  res.simpleJSON(200, { });
});

fu.get("/recv", function (req, res) {
  if (!qs.parse(url.parse(req.url).query).since) {
    res.simpleJSON(400, { error: "Must supply since parameter" });
    return;
  }
  var id = qs.parse(url.parse(req.url).query).id;
  var session;
  if (id && sessions[id]) {
    session = sessions[id];
    session.poke();
  }

  var since = parseInt(qs.parse(url.parse(req.url).query).since, 10);

  session.channel.query(since, function (messages) {
    if (session) session.poke();
    res.simpleJSON(200, { messages: messages });
  });
});

fu.get("/send", function (req, res) {
  var id = qs.parse(url.parse(req.url).query).id;
  var text = qs.parse(url.parse(req.url).query).text;

  var session = sessions[id];
  if (!session || !text) {
    res.simpleJSON(400, { error: "No such session id" });
    return; 
  }

  session.poke();

  session.channel.appendMessage(session.nick, "msg", text);
  res.simpleJSON(200, {});
});
function extname (path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
}
fu.get("/pushimg",function(req,res) {
	var body="";
	var filename= req.headers["x-file-name"];
	var length= req.headers["x-file-size"];
	var content_type = fu.mime.lookupExtension(extname(filename));
   	req.setBodyEncoding("binary");
   	req.addListener("data",function(chunck){
		body+= chunck;
   	});
   	req.addListener("end",function(){
   		//STORE_IMG	
		//STORE_IMG[filename]= body;
		sys.puts("ok");
		fu.get("/"+filename, function(req,res){
			var headers = {
		    	"Content-Length": length
		   	   ,"Content-Type": content_type
			};
			res.writeHead(200, headers);
			res.write(body,"binary");
			res.end();
		});
		sys.puts("ok");
		res.simpleJSON(200, {src:"/"+filename});
   	});
});
