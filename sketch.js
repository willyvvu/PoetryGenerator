function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  window.onresize = () => resizeCanvas(window.innerWidth, window.innerHeight);
  newPoem();
}

function draw() {
  render();
}
var majorGrid = 20;
var minorGrid = 12.5;

var nightFactor = 1;
var nightMode = 1;

var p, ltr, ttb, s, symbolic = true;
function newPoem(){
  symbolic = !symbolic;
  p = (symbolic?genPoem:genPoemNS)();
  ltr = Math.random() < 0.5 ? 1 : -1;
  ttb = Math.random() < 0.33;
  s = getPoemSize(p);
}
var timer = 0;
function mousePressed(){
  nightMode = +!nightMode;
}
function render() {
  background(235 - 205*nightFactor);
  translate(width/2, height/2);
  noStroke();
  fill(30+140*nightFactor);

  nightFactor = lerp(nightFactor, nightMode, 0.1);

  var x = 0,
    y = 0;
  var poemTime = min(max(p.length/5, 3.5), 10);
  var grid = symbolic?majorGrid:minorGrid;
  if (ttb) translate(- ltr*grid * s[1] / 2, - grid * s[0] / 2);
  else translate(- ltr * grid * s[0] / 2, - grid * s[1] / 2);
  var stillVisible = false;
  for (var i = 0; i < p.length; i += 1) {
    var animCoordinate;
    if (p[i] == 0) {
      if (ttb) {
        x += grid;
        y = 0;
      } else {
        x = 0;
        y += grid;
      }
    } else {
      if(ttb) animCoordinate = x/10 + y/10;
      else animCoordinate = x/10 + y/10;
      push();
      translate(ltr * x, y);
      if(ttb) y += grid;
      else x += grid;
      var localTime = min(max(timer*2-animCoordinate/grid,0),1)
                * min(max(animCoordinate/grid + (poemTime - timer) * 2,0),1);
      (symbolic?glyph:letter)(p[i], localTime);
      if(localTime > 0) stillVisible = true;
      pop();
    }
  }
  timer+=1/60;
  if(timer > poemTime && !stillVisible){
    timer = 0;
    newPoem();
  }
}

function getPoemSize(poem) {
  var textify = poem.map((a) => a == 0 ? "\n" : "#").join("");
  return [textify.split("\n").reduce((a, b) => Math.max(a, b.length), 0), textify.split("\n").length];
}


function genPoemNS() {
  var stanza = genStanzaNS();
  var p = expandAFewTimes(stanza, 1, 0.9, stanza.length*5);
  // Consolidate newlines
  p = p.filter((c,i)=>i<p.length-2&&!(p[i]<=0&&p[i+1]<=0&&p[i+2]<=0))
  while(p.length>0&&p[p.length-1]==0){
    p.pop();
  }
  return p;
}

function genStanzaNS() {
  return genStanzaLengths().reduce((a, b) => a.concat(genSentenceNS(min(10,b))), []).concat([0]);
}
function genSentenceNS(length) {
  if (length <= 0) return [0];
  if (length <= 1) return [1 / Math.random(), 0];
  return genWord(min(10,2/Math.random()-1)).concat(genSentenceNS(length - 1))
}
function genWord(length){
  if (length <= 1) return [1 / Math.random(), -1];
  return [100 / Math.random() - 99].concat(genWord(length - 1));
}

function genPoem() {
  var stanza = genStanza();
  var p = expandAFewTimes(stanza, 1, 0.9, stanza.length*9);
  // Consolidate newlines
  p = p.filter((c,i)=>i<p.length-2&&!(p[i]==0&&p[i+1]==0&&p[i+2]==0))
  while(p.length>0&&p[p.length-1]==0){
    p.pop();
  }
  return p;
}

function genStanza() {
  return genStanzaLengths().reduce((a, b) => a.concat(genSentence(b)), []).concat([0]);
}

function genStanzaLengths() {
  return expandAFewTimes([min(14 / Math.random() - 7, 10)], 1, 0.99, 8);
}

function genSentence(length) {
  if (length <= 0) return [0];
  if (length <= 1) return [1 / Math.random(), 0];
  return [100 / Math.random() - 99].concat(genSentence(length - 1))
}

function expandAFewTimes(list, prob, probFalloff, maxLength) {
  if (list.length > maxLength) return list.slice(maxLength);
  if (Math.random() < prob) return expandAFewTimes(getExpander()(list), prob * probFalloff, probFalloff, maxLength);
  return list;
}

function getExpander() {
  return expanders[Math.random() * expanders.length | 0];
}
var expanders = [ab, aba];

function ab(poem) {
  return poem.concat(variation(poem));
}

function aba(poem) {
  return poem.concat(variation(poem), variationsmall(poem));
}

function variation(poem) {
  return poem.filter((a) => a == 0 ? true : Math.random() < 0.5).map((a) => a == 0 ? a : a > 1.5 ? a * (Math.random() * 0.4 + 0.8) : a);
}
function variationsmall(poem) {
  return poem/*.filter((a) => a == 0 ? true : Math.random() < 0.95)*/.map((a) => a == 0 ? a : a > 1.5 ? a * (Math.random() * 0.2 + 0.9) : a);
}

function glyph(charCode, anim) {
  push();
  scale(5);
  let anim1 = min(anim, 0.5) * 2;
  let anim2 = max(anim - 0.5, 0) * 2;
  [-1, 0, 1].forEach((x) => {
    [-1, 0, 1].forEach((y) => {
      if (noise(5 * x, 5 * y, charCode) < 0.4 && x <= 0) {
        rect(x - 0.25 * anim1, y - 0.25 * anim1, 0.5 * anim1 + anim2, 0.5 * anim1);
      } else if (noise(charCode, 5 * x, 5 * y) > 0.4 && y <= 0) {
        rect(x - 0.25 * anim1, y - 0.25 * anim1, 0.5 * anim1, 0.5 * anim1 + anim2);
      } else if (abs(noise(5 * x, charCode, 5 * y) - 0.5) < 0.1) {
        rect(x - 0.25 * anim1, y - 0.25 * anim1, 0.5 * anim1, 0.5 * anim1);
      }
    })
  })
  pop();
}
function letter(charCode, anim) {
  if(charCode == -1) return;
  push();
  scale(5);
  let anim1 = min(anim, 0.5) * 2;
  let anim2 = max(anim - 0.5, 0) * 2;
  [-0.5, 0.5].forEach((x) => {
    [-0.5, 0.5].forEach((y) => {
      if (noise(5 * x+1, 5 * y+1, charCode) < 0.4 && x <= 0) {
        rect(x - 0.25 * anim1, y - 0.25 * anim1, 0.5 * anim1 + anim2, 0.5 * anim1);
      } else if (noise(charCode, 5 * x+1, 5 * y+1) > 0.5 && y <= 0) {
        rect(x - 0.25 * anim1, y - 0.25 * anim1, 0.5 * anim1, 0.5 * anim1 + anim2);
      } else if (abs(noise(5 * x+1, charCode, 5 * y+1) - 0.5) < 0.1) {
        rect(x - 0.25 * anim1, y - 0.25 * anim1, 0.5 * anim1, 0.5 * anim1);
      }
    })
  })
  pop();
}