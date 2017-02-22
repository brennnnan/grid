var notes = [ 60,61,62,63,64,65,66,67,68,69,70,71,72];

var osc1, osc2;
var lastV = -1;
var lastH = -1;
var thisH, thisV;
var boxes = [];
var start;
var cumulative;
var playing = 0;

var canvas;
var output = -1;
var currentBox = -1;
var activeBox = -1;
var sequence;

// boundaries for grid
var leftEdge = 200
var rightEdge = 1000
var bottomEdge = 1000
var topEdge = 200

function preload() {
   WebMidi.enable(function (err) {
  
    if (err) {
      console.log("WebMidi could not be enabled.", err);
    } else {
      console.log("WebMidi enabled!");
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs[1].name);
      output = WebMidi.getOutputByName(WebMidi.outputs[0].name);
      createP('  1. Select correct midi output from below.<br>  2. Click on boxes to add them to looping sequence. Each box represents the two notes at its x and y points.<br>  3. Change duration of interval by clicking on square and dragging up or down. Remove interval from sequence by option+clicking on it.<br>  4. Press space to start playing.');

		  dropdown = createElement('select');
		  var options = [];
		  for(var d=0; d<WebMidi.outputs.length; d++) {
		  	options.push(WebMidi.outputs[d].name);
		  } 

		  console.log(options)
		  for (var i = 0; i < options.length; i++) {
		    var option = createElement('option');
		    option.attribute('value',options[i]);
		    option.html(options[i]);
		    option.parent(dropdown);
		  }

		  dropdown.elt.onchange = function() {

    		output = WebMidi.getOutputByName(this.value);
  		}


    }
  
  });
}

function setup() {

  canvas = createCanvas(1000, 600);
  frameRate(30)
  //shift pitches down two octaves
  for(var h=0; h<notes.length; h++) {
  	notes[h] = notes[h]-12;
 	}

  var ww = rightEdge-leftEdge-1;
  var wh = canvas.height-1;
  var temparray;
  sequence = new noteSequence();



  for(var i=0; i<notes.length; i++) {
    temparray = [];
    for(var ii=0; ii<notes.length; ii++) {
    	temparray.push(new rectBox(leftEdge+(i*ww)/notes.length,(ii*wh)/notes.length,ww/notes.length,wh/notes.length,notes[i],notes[ii],i*notes.length+ii))
    }
    boxes.push(temparray)
  }
}

function makeOscs() {
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
}

// A function to play a note
function playNotes(duration) {

  //osc1.freq(midiToFreq(notes[thisH]));
  //osc2.freq(midiToFreq(notes[thisV]));
  // Fade it in
  //osc1.fade(0.5,0.2);
  //osc2.fade(0.5,0.2);
  if(WebMidi.enabled) output.playNote([noteToMidi(notes[thisH]), noteToMidi(notes[thisV])]);

  // If we set a duration, fade it out
  if (duration) {
    setTimeout(function() {
      //osc1.fade(0,0.2);
      //osc2.fade(0,0.2);
      if(WebMidi.enabled) {
        //output.stopNote(noteToMidi(notes[thisH]));
        //output.stopNote(noteToMidi(notes[thisV]));
      }
    }, duration-50);
  }
  lastV = thisV;
  lastH = thisH;
}

function draw() {
  clear();
  
  if((millis()-start) >= cumulative && playing==1) sequence.playSequence();

  for(var g=0; g<boxes.length; g++) {
  	for(var h=0; h<boxes.length; h++) {
  		hit = collidePointRect(mouseX, mouseY, boxes[g][h].x, boxes[g][h].y, boxes[g][h].width, boxes[g][h].height);
  		if(hit && !mouseIsPressed) {


  			if((g*boxes.length+h) != currentBox) {
  				currentBox = g*boxes.length+h;
  				
  			}
  			// color green if hovering
  			boxes[g][h].sketch('rgba(0,255,0, 0.25)');
  			fill(51)
  			text(""+noteToMidi(boxes[g][h].note1)+"  "+noteToMidi(boxes[g][h].note2), boxes[g][h].x+5, boxes[g][h].y+25)
  			noFill();
  			continue;
  		} 

  		if(activeBox[0] == g && activeBox[1] == h) {
  			boxes[g][h].chordLength = map(mouseY,0,600,1000,200)
  		}

  		boxes[g][h].sketch();
  		noFill()



  	}
  	
  }
  
  //if there is a change between this and the last one, playnotes
  //if(thisV != lastV || thisH != lastH) playNotes(500)
  
}

function mousePressed() {

	// checks each box to see if it's being pressed
	// turns on activeBox so that user can change note length in draw function
	// otherwise removes it if user holds down option while pressing

	for(var g=0; g<boxes.length; g++) {
	  	for(var h=0; h<boxes.length; h++) {
	  		hit = collidePointRect(mouseX, mouseY, boxes[g][h].x, boxes[g][h].y, boxes[g][h].width, boxes[g][h].height);
	  		if(hit) {
	  			if(boxes[g][h].pressed) {
	  				if(keyIsDown(OPTION)) {
	  					boxes[g][h].pressed = 0;
	  					sequence.removeItemByID(boxes[g][h].id);
	  					return;
	  				}
	  				activeBox = [g,h];
	  			}

	  			sequence.addItem(boxes[g][h]);
	  			boxes[g][h].pressed = 1;
	  			return;
	  		} 
	  	}
	 }
}

function mouseReleased() {
	// if user stops holding down mouse sets activeBox to none
	activeBox = [-1,-1]
}

function keyPressed() {
  if (keyCode === 32) {
  	if(playing === 0) {
  		sequence.playSequence();
  		playing = 1;
  		return;
  	} else if(playing == 1) playing = 0;
  }
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

function noteSequence() {
	this.seqArray = []

	this.playSequence = function(){
		cumulative = 0;
		for(var i=0; i<this.seqArray.length; i++) {
			
			if(i>0) {
				output.playNote(this.seqArray[i].note1, 1, {duration: this.seqArray[i].chordLength, time:"+"+cumulative});
				output.playNote(this.seqArray[i].note2, 2, {duration: this.seqArray[i].chordLength, time:"+"+cumulative});
				//console.log(this.seqArray[i].note1+' '+this.seqArray[i].note2+' '+this.seqArray[i].chordLength+' '+"+"+cumulative);
				cumulative += this.seqArray[i].chordLength+1;
			}
			else {
				//console.log(this.seqArray[i].note1+' '+this.seqArray[i].note2+' '+this.seqArray[i].chordLength);
				output.playNote(this.seqArray[i].note1, 1, {duration: this.seqArray[i].chordLength,time:"+"+1});
				output.playNote(this.seqArray[i].note2, 2, {duration: this.seqArray[i].chordLength,time:"+"+1});
				cumulative += this.seqArray[i].chordLength+1
			}

		}
		start = millis()

	}

	this.removeItemByID = function(id) {
		for(var i=0; i<this.seqArray.length; i++) {
			if(this.seqArray[i].id == id) {
				this.seqArray.splice(i,1)
				return;
			}
		}
	 	console.log('Item '+id+' not found in sequence');
	}

	this.addItem = function(boxToAdd) {
		
		//keeps from adding same chord twice
		if(!this.seqArray.includes(boxToAdd)) this.seqArray.push(boxToAdd)
		
		// debug comments
		//console.log('added box '+boxToAdd.id)
		//console.log('length: '+this.seqArray.length)
	}
}

function rectBox (x,y,w,h,note1,note2,id) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.width = w;
  this.height = h;
  this.pressed = 0;
  this.chordLength = 2000;
  this.note1 = note1;
  this.note2 = note2;

  
  this.sketch = function(fillColor) {

    n = 'rgba(4,80,240,'+constrain(this.chordLength/1000,.1,1)+')'
    
    if(fillColor) fill(fillColor)
    if(this.pressed){
    	fill(n)
    }
    rect(this.x, this.y, this.width, this.height,4);
  }
}