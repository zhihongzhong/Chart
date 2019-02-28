
function getElementStyle (eln) {
  if( document.defaultView.getComputedStyle) {
    return document.defaultView.getComputedStyle(eln);
  }
  return eln.currentStyle;
}


function Canvas(canvas) {
  var obj = new Object();
  var canvas = document.getElementById(canvas);

  if(!canvas.getContext){
    console.error("there is a fatal error that canvas cannot be created, please check canvas-id put in before");
    return;
  }

  var ctx = canvas.getContext("2d");
  
  obj.compatibleMode = function () {
    var width = parseInt(getElementStyle(canvas)['width']);
    var height = parseInt(getElementStyle(canvas)['height']);

    canvas.width = width * 2;
    canvas.height = height *2;
    canvas.style.width = width  + "px";
    canvas.style.height = height  + "px";

    ctx.translate(0.5, 0.5);
  }
  
  obj.getWidth = function () {
    return canvas.width;
  }

  obj.getHeight = function() {
    return canvas.height;
  }

  obj.getCTX = function () {
    return ctx;
  }

  obj.getObject = function() {
    return canvas;
  }
  return obj;
}

function Chalk() {
  var obj = new Object;

  obj.drawLine = function (x1, y1, x2 ,y2, ctx, color = "#e0e0e0", lineWidth = 1) {
      var oldcolor = ctx.strokeStyle;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = oldcolor;
  }

  obj.setFont = function (name, align, width, ctx) {
    ctx.font = name;
    ctx.textAlign = align;
    ctx.lineWidth = width;
  }

  obj.drawText = function (text,x, y, ctx,align = "right", font = "24px Arial") {
    ctx.font = font;
    ctx.strokeStyle = "#E0E0E0";
    ctx.textAlign = align;
    ctx.lineWidth = 2; 
    ctx.textBaseLine = "middle";

    ctx.fillText(text,x,y);
  }

  obj.drawRect = function (x1, y1, x2, y2, ctx) {
    w  = Math.abs(x1 - x2);
    h  = Math.abs(y1 - y2);
    ctx.fillStyle = "rgba(0,0,255,0.5)";
  
    ctx.fillRect(x1,y1, w,h);
  }

  obj.drawRect2 = function (x, y, w, h, ctx, style) {

    ctx.fillStyle = style;
  
    ctx.fillRect(x,y, w,h);
  }


  obj.drawPoint = function (x1, y1, ctx, color = "#ff00ff") {
    var oldcolor = ctx.strokeStyle;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x1,y1,10,0, 2* Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = oldcolor;
  }

  return obj;
}

function CMath() {
  this.ceil = function (x,mod = 50) {
    return x + mod - (x % mod);
  }

  // x = margin 
  // y = mod 
  // z = something % (mod)

  this.ratio = function(x, y , z) {
    return z / y * x;
  }

  this.randomElement = function (array) {
    var r = Math.floor(Math.random() * array.length);
    return array[r];
  }
}

function Chart(canvas, chalk, prompt) {
  var obj = new Object;

  var ck = chalk;
  var cv = canvas;
  var ctx = cv.getCTX();
  var pmt = prompt;

  cv.compatibleMode();

  const basePointMarginLeft = 120;
  const basePointMarginTop = 160;
  
  const basePointMarginRight = cv.getWidth() - 60;
  const basePointMarginBottom = cv.getHeight()-80;
  

  // to calculate ratios 

  var margin = 0;
  var m = 0;

  var titlePositions = [];
  var setPositions = [];
  obj.strokeBaseLine = function (table, mod = 50) {
    
    var max = 0;
    var span = 0;  
    m = mod;

    ck.drawLine(basePointMarginLeft, basePointMarginBottom,basePointMarginRight, basePointMarginBottom,ctx, "#000000");
    ck.drawLine(basePointMarginLeft,basePointMarginTop, basePointMarginLeft, basePointMarginBottom, ctx,"#000000");
    ck.drawLine(basePointMarginRight-20,basePointMarginBottom-10,basePointMarginRight,basePointMarginBottom, ctx,"#000000");
    ck.drawLine(basePointMarginRight-20,basePointMarginBottom+10,basePointMarginRight,basePointMarginBottom, ctx,"#000000");

    ck.drawLine(basePointMarginLeft-10,basePointMarginTop+20,basePointMarginLeft,basePointMarginTop, ctx,"#000000");
    ck.drawLine(basePointMarginLeft+10,basePointMarginTop+20,basePointMarginLeft,basePointMarginTop, ctx,"#000000");


    table.sets.map(function(b, i) {
      b.values.map(function(v, n) {
        if( max < v) 
          max = v;
      });
    });

    max = new CMath().ceil(max, mod); 
    span = max / mod;
    margin = (basePointMarginBottom-basePointMarginTop) / (span+1);
    var startPosition = basePointMarginBottom ;

    for(var i = 1; i <= span; i++) {
      ck.drawLine(basePointMarginLeft, startPosition - margin * i, basePointMarginRight, startPosition - margin * i, ctx);
      ck.drawText(i * mod, basePointMarginLeft-20, startPosition - margin * i,ctx);
    }

  }


  function translate(x) {
    var v = Math.floor(x / m);
    var v1 = new CMath().ratio(margin, m, (x % m));
    return basePointMarginBottom - (margin* v + v1);
  }

  obj.drawTitle = function(titles) {    
    titlePositions = getTitlePositions(titles);
    titlePositions.map(function(t, n){
      ck.drawText(titles[n], t,basePointMarginBottom +30,ctx,"center");
    });
  }

  function getTitlePositions(titles) {
    var length = titles.length + 1;
    var margin = (canvas.getWidth()-basePointMarginLeft) / length;
    var startPosition = margin + basePointMarginLeft;

    return titles.map(function(t, n) {
      return margin * n + startPosition;
    });
  }

  function datasets(sets) {
    return sets.map(function(set, index) {
       return set.values.map(function(value, ndex) {
        return translate(value);
      });
    });
  }


  obj.drawDatasets = function(sets) {
    setPositions = datasets(sets);
    var colors = ["#ff0000", "#00ff00"];
    sets.map(function (set, index) {
      set.values.map(function(v, n) {
        ck.drawText(v, titlePositions[n], setPositions[index][n]-m/3,ctx,"center", "18px Arial");
        ck.drawPoint(titlePositions[n], setPositions[index][n],ctx,colors[index]);
      });
    });
  }

  obj.drawLines = function(sets) {
    var colors = ["#ff0000", "#00ff00"];
    sets.map(function(set, index) {
      set.values.map(function(v, n) {
        ck.drawLine(titlePositions[n], setPositions[index][n], titlePositions[n+1], setPositions[index][n+1], ctx, colors[index]);
      });
    });
  }

  obj.drawSetLabels = function(sets) {
    var colors = ["#ff0000", "#00ff00"];
    sets.map(function(set, index) {
      ck.drawRect2(basePointMarginRight - m*3, basePointMarginTop + m/2 * index, 20,10, ctx, colors[index]);
      ck.drawText(set.name, basePointMarginRight - m *3 + m , basePointMarginTop + m/2*index+6, ctx, "start", "12px Arial");
    })
  }

  obj.strokeTableName = function(name) {
    var baseLine = cv.getWidth() / 2 ;
    ck.drawText(name, baseLine, basePointMarginTop , ctx, "center", "30px Arial");
  }
  
  obj.strokeLabels = function(table) {
    this.strokeTableName(table.name);
    this.drawTitle(table.titles);
    this.drawDatasets(table.sets);
    this.drawLines(table.sets);
    this.drawSetLabels(table.sets);
  }

  obj.listen = function() {
    var count = 0;
    cv.getObject().addEventListener("mousemove", function (event) {
   
    count =(count+1) % 5;
    
    if(!count) {
        pmt.display(event.clientX, event.clientY);
       
      }
    });

    // cv.getObject().addEventListener("mouseleave", function (event) {
    //    pmt.undisplay();
    // });
  }
  return obj;
}





function Prompt(div) {
  var obj = new Object();
  var id = Math.random().toString(32).substr(5);
  console.log(id);
  var parent = document.createElement("div");
  var style = document.createElement("style");
  
  var title = document.createElement("p");
  var content = document.createElement("p");
  title.appendChild(document.createTextNode("hello world"));
  content.appendChild(document.createTextNode("content 1"));

  parent.appendChild(title);
  parent.appendChild(content);

  parent.id = id;
  style.type = "text/css";
  
  var css = cssText(id);
  try {
    style.appendChild(document.createTextNode(css));
  }catch(e) {
    style.styleSheet.cssText = css;
  }

  document.getElementsByTagName("head")[0].appendChild(style);
  document.body.appendChild(parent);
  document.body.style.display = "relative";
  parent.style.display = "none";
  parent.style.position = "absolute";
  
  var tx = 0;
  var ty = 0;
  var visibility = false;

  var fragment = document.createDocumentFragment();

  function cssText(id) {
    return "#"+id+"{transition: all 0.2s linear; -moz-transition:all 0.2s linear; -webkit-transition:all 0.2s linear;\
    position:absolute; width: 150px; height: 100px; border-radius: 10px;\
    background:rgba(0,0,0,0.5);\
    }";
  }
  function show(x =0 ,y= 0){
    if(visibility == false) {
      parent.style.display = "none";
      return;
    }

    tx = x ? x: tx;
    ty = y ? y: ty;
    
    parent.style.display = "block";
    parent.style.left = tx +"px";
    parent.style.top = ty +"px";
  }

  obj.display = function(x, y) {
    visibility = true;
    show(x, y);
  }

  obj.setData = function(dataset) {
    
    dataset.map(function(data, index){
      
      fragment.appendChild();
    });
    return this;
  }


  obj.undisplay = function() {
    visibility = false;
    show();
  }


  return obj;
}

function main() {
  var canvas = new Canvas("canvas");
  var chalk = new Chalk();
  var prompt = new Prompt();

  var chart = new Chart(canvas,chalk,prompt);


  var table = {
    name:'Hello World',
    titles: ['2017', '2018', '2019', '2020'],
    sets: [
      {
        name: 'Changsha',
        values:[11,80, 115, 250],
      },
      {
        name: 'Wuhan',
        values:[90, 170, 500, 650],
      }
    ]
  };

  chart.strokeBaseLine(table, 50);
  chart.strokeLabels(table);
  chart.listen();
}

main();
