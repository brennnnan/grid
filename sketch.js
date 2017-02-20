var notes = [ 60, 61,62, 63,64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83,84];

var osc1, osc2;
var lastV = -1;
var lastH = -1;
var thisH, thisV;
var verticals = [];
var horiz = [];
var canvas;
var output;

function preload() {
   WebMidi.enable(function (err) {
  
    if (err) {
      console.log("WebMidi could not be enabled.", err);
    } else {
      console.log("WebMidi enabled!");
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs);
      output = WebMidi.getOutputByName("IAC Driver Bus 1");
      output.playNote("C3")
    }
  
  });
}

function setup() {
  canvas = createCanvas(400, 400);

 for(var h=0; h<notes.length; h++) {
   notes[h] = notes[h]-24;
 }

  console.log('C'+5)
  
  // A triangle oscillator
  osc1 = new p5.TriOsc();
  // Start silent
  osc1.start();
  osc1.amp(0);
  
  // A triangle oscillator
  osc2 = new p5.TriOsc();
  // Start silent
  osc2.start();
  osc2.amp(0);
  
  var ww = canvas.width;
  var wh = canvas.height;
  for(var i=0; i< notes.length; i++) {
    verticals.push(new rectBox(i*(ww/notes.length),0,ww/notes.length,wh))
    horiz.push(new rectBox(0,i*(wh/notes.length),ww,wh/notes.length))
  }

}




// A function to play a note
function playNotes(duration) {

  osc1.freq(midiToFreq(notes[thisH]));
  osc2.freq(midiToFreq(notes[thisV]));
  // Fade it in
  //osc1.fade(0.5,0.2);
  //osc2.fade(0.5,0.2);
  if(WebMidi.enabled) output.playNote([noteToMidi(notes[thisH]), noteToMidi(notes[thisV])]);

  // If we set a duration, fade it out
  if (duration) {
    setTimeout(function() {
      osc1.fade(0,0.2);
      osc2.fade(0,0.2);
      if(WebMidi.enabled) {
        output.stopNote(noteToMidi(notes[thisH]));
        output.stopNote(noteToMidi(notes[thisV]));
      }
    }, duration-50);
  }
  lastV = thisV;
  lastH = thisH;
}

function draw() {
  clear();
  
  for(var i=0; i< notes.length; i++) {
    noFill();
    if(i==thisV) verticals[i].sketch('rgba(0,255,0, 0.25)');
    else verticals[i].sketch();
    noFill();
    if(i==thisH) horiz[i].sketch('rgba(0,255,0, 0.25)')
    else horiz[i].sketch()
    if(!mouseIsPressed) {
      //get mouse quadrants
      hit = collidePointRect(mouseX,mouseY,verticals[i].x,verticals[i].y,verticals[i].width,verticals[i].height);
      if(hit) thisV = i;
      hit = collidePointRect(mouseX,mouseY,horiz[i].x,horiz[i].y,horiz[i].width,horiz[i].height);
      if(hit) thisH = i;
    }
  }
  
  //if there is a change between this and the last one, playnotes
  if(thisV != lastV || thisH != lastH) playNotes(500)
  
}

function noteToMidi(noteNum) {
  result = noteNum%12;
  if(result==0) return 'C'+noteNum/12;
  octave = (noteNum-result)/12;
  
  if(result==1) return 'C#'+octave;
  if(result==2) return 'D'+octave;
  if(result==3) return 'D#'+octave;
  if(result==4) return 'E'+octave;
  if(result==5) return 'F'+octave;
  if(result==6) return 'F#'+octave;
  if(result==7) return 'G'+octave;
  if(result==8) return 'G#'+octave;
  if(result==9) return 'A'+octave;
  if(result==10) return 'A#'+octave;
  if(result==11) return 'B'+octave;
}

function rectBox (x,y,w,h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  
  this.sketch = function(fillColor) {
    if(fillColor) fill(fillColor)
    rect(this.x, this.y, this.width, this.height);
  }
}