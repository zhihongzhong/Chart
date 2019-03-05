
function getElementStyle (eln) {
  if( document.defaultView.getComputedStyle) {
    return document.defaultView.getComputedStyle(eln);
  }
  return eln.currentStyle;
}

var ChalkStyle = function (Textalign = "center", font = "24px Arial", strokeStyle = "#e0e0e0",
 lineWidth = 1, textBaseLine ="middle", fillStyle = "#000") {
  return {Textalign, font, strokeStyle, lineWidth, textBaseLine};
};


function Chalk(ss) {
  var obj = new Object();

  var s = ss;
  obj.line = function(x1, y1, x2, y2, ctx) {
    ctx = style(ctx);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }

  obj.arc = function(x, y, radius, ctx) {
    ctx = style(ctx);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }

  obj.text = function (x, y, text, ctx) {
    ctx = style(ctx);
    ctx.fillText(text, x, y);
  }

  obj.setStyle = function( chalkStyle) {
    s = chalkStyle;
  }

  function style(ctx) {
    return Object.assign( ctx, s);
  }
  
  obj.rect = function(x1, y1, x2, y2, ctx) {
    ctx = style(ctx);
    var w = x2 - x1;
    var h = y2 - y1;

    ctx.fillRect(x1, y1, w, h);
  }
  return obj;

}

function Canvas(canvasid) {
  var obj = new Object();
  var canvas = document.getElementById(canvasid);

  if(!canvas.getContext){
    throw Error("failed to get context!");
    return;
  }

  var ctx = canvas.getContext("2d");

  obj.getCtx = function(){
    return ctx;
  }

  obj.getWidth = function() {
    return canvas.width;
  }

  obj.getHeight = function () {
    return canvas.height;
  }

  obj.getInstance = function() {
    return canvas;
  }
  // compatible mode

  {
    let width  = canvas.width ;
    let height = canvas.height;
    canvas.width = width *2;
    canvas.height = height *2;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

  }

  ctx.translate(0.5, 0.5);
  
  return obj;
}

function Prompt() {
  // document operation
  {
    document.body.style.position="relative";
  }

  var obj = new Object();

  var container = document.createElement("div");
  var head = document.createElement("div");
  var body = document.createElement("div");
  
  var visibility = false;
  function css(width = 150, height = 100) {
    return "-webkit-transition:all 0.3s linear; width:" + width + "px; height:" + height + "px;\
    display:none; position:absolute;background:rgba(0,0,0,0.5);padding:5px;border-radius:10px;\
    ";
  }
  container.style = css();
  obj.init = function (sets) {
    container.appendChild(head);
    container.appendChild(body);
    document.body.appendChild(container);
    setBody(sets);
  }

  obj.setTitle = function(title) {
    var child = null;
  }

  // set : [{name, value},{name, value}]
  function setBody(sets) {
    sets.forEach(function (set,index) {
      var p = document.createElement("p");
      p.style.fontSize = "12px";
      body.appendChild(p);
    });    
  }

  obj.show = function(x, y,v, xv,r) {
    visibility = v;
    render(x, y, xv,r );
  }

  function render(x, y, xv, r) {
    container.style.display = visibility ? "block" : "none";

    if(!visibility) return;

    if(r) body.childNodes.forEach(function(child, index) {
      child.innerText = "label:" + xv[index].n + ", value:" + xv[index].v;
    });

    container.style.left = x + "px";
    container.style.top = y + "px";
  }

  return obj;

}


function Rect(x, y, w, h) {
    return {x, y, w, h};
}


function Chart(canvas, prompt) {

  var obj = new Object();


  var cv = canvas;
  var ctx = cv.getCtx();

  var wr = cv.getWidth() / 10;
  var hr = cv.getHeight() / 10;

  var labs = [];
  var sets = [];
  var max = 0;
  
  var callback = null;

  const rect = new Rect(wr, hr, cv.getWidth()- wr, cv.getHeight() - hr);

  function drawAxios(style = null) {
    var s = style? style: new ChalkStyle();
    var stroke = new Chalk(s);
    stroke.line(rect.x, rect.h, rect.w, rect.h, ctx);
    stroke.line(rect.x, rect.h, rect.x, rect.y, ctx);
  }

  function drawBaseLine(style = null) {
    var s = style ? style : new ChalkStyle();
    s.strokeStyle = "#fefefe";
    var stroke = new Chalk(s);

  }

  obj.getTable = function(table) {
    labs = table.labels;
    sets = table.sets;
    prompt.init(sets);
  }

  function drawLabels() {
    var s = new ChalkStyle();
    s.font = "18px Arial";
    s.textAlign = "center";
    var stroke = new Chalk(s);

    var m = rect.w / (labs.length +1);
    var h = rect.h / (labs.length +1);
    labs.forEach(function(label, index, array) {
      var x = rect.x +m/2 + m * index;
      var y = rect.h + 20;
      stroke.text(x, y, label, ctx);
    });
    
  }

  function drawY(){
    var s = new ChalkStyle();
    s.font = "18px Arial";
    s.textAlign = "end";
    var stroke = new Chalk(s);


    sets.forEach(function(set, index, array) {
      set.values.forEach(function(v, n) {
        if(max < v) max = v;
      });
    });

    // must alert it , to increase the flexiblity;
    var tmax = max + 100  - (max %100);
    var p = tmax / 100;
    var h = rect.h / (p+1);

    for(var i = 0; i <= p; i++ ) {
      var x = rect.x - 20;
      var y = rect.h - h * (i);
      stroke.text(x, y, i * 100, ctx);
      
    }
  }

  function positions() {

    var tmax = max + 100  - (max %100);
    var p = tmax / 100;
    var h = rect.h / (p+1);
    var m = rect.w / (labs.length +1);

    return sets.map(function(set, index){
      var lname = set.name;
      var values = set.values;
      
      var newValues = values.map(function(vl, n) {
        var nx = rect.x + m /2 + m * n;
        var ny = rect.h - (h * vl /100 + vl % 100 / 100 * h);
        return {x: nx,y: ny ,v: vl };
      });
      return {name: lname, values: newValues};
    });
  }

  
  function drawSets() {
    var s = new ChalkStyle();
    s.strokeStyle = "#aaaaaa";
    s.textAlign = "center";
    s.font = "15px Arial";
    var stroke = new Chalk(s);

    var newSets = positions();
    
    newSets.forEach(function(set, index, array) {
      set.values.forEach(function(v, i, a) {
        stroke.arc(v.x, v.y, 10,ctx);
        stroke.text(v.x, v.y -15, v.v, ctx);
      });
    });

    // line
    
    function onShow(cb) {
      callback = cb;
    }

    newSets.forEach(function(set, index, array) {
      for(var i = 0; i <set.values.length -1; i++) {
        stroke.line(set.values[i].x, set.values[i].y, set.values[i+1].x, set.values[i+1].y,ctx);
      }
    });
  }

  function listen() {
    var op = 0;
    var r = false;
    var m = rect.w / (labs.length +1);
    var count = 0;
    cv.getInstance().addEventListener("mousemove", function(event) {
      event.preventDefault();
      var x = event.clientX;
      var y = event.clientY;
      
      var xv = [];

      var pos = 0;
      for(let i = 0; i < labs.length; i++) {
        if(x < m*i){
          pos = i;
          break;
        }
      }

      if(op !== pos) {
        op = pos;
        r = true;
        sets.forEach(function(set, index){
          xv.push({n: set.name,v:set.values[op]});
        });
      }else r = false;   

      v = true;
      prompt.show(x, y, v,xv, r);

    });
  }

  obj.draw = function(){
    drawAxios();
    drawLabels();
    drawY();
    drawSets();
    listen();
  }

  return obj;
}


var canvas = new Canvas("canvas");
var prompt = new Prompt();

var table = {
  name:'Hello World',
  labels: ['2017', '2018', '2019', '2020'],
  sets: [
    {
      name: 'Changsha',
      values:[11,80, 115, 250],
    },
    {
      name: 'Wuhan',
      values:[90, 170, 500, 650],
    },
    {
      name: 'Jiangxi',
      values:[50, 230, 700, 850],
    }
  ]
};


var chart = new Chart(canvas, prompt);
chart.getTable(table);
chart.draw();
