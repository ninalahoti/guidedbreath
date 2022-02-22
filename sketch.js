let counter = 0;
let bigfont;
let medfont;
let smallfont;
let bigtext;
let medtext;
let smalltext;
let titletext;
let titleopacity = 1;
let titlebutton;
let instructtext;
let instructbutton;
let micvol = [];
let maxvols = [];
let threshold = null;
let peaktimes = [];
let averagerate = null;
let calibratebool = false;
let buttoncover;
let newpeakbool = true;
let lastmillis = 0;
let newanimationbool = true;
let mytimer = null;
let animationcounter = 0;
let waveloop;
let firstroundbool = true;
let transitionbool;
let transitionopacity = 0;
let beginbool = true;
let transitioncover;
let endopac = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
}

function preload() {
  soundFormats('wav');
  waveloop = loadSound("WaveLoop.wav");
  waveloop.setVolume(0.05);
  waveloop.playMode("restart");
  bigfont = windowWidth/5;
  medfont = windowWidth/15;
  smallfont = windowWidth/30;
  bigtext = windowWidth/10;
  medtext = windowWidth/15;
  smalltext = windowWidth/35;
  titletext = createDiv("WAVE");
  titletext.addClass("titletext");
  titletext.style('font-size', bigfont+"px");
  titletext.center('horizontal');
  titletext.style('padding-top', windowHeight/4+"px");
  titletext.style("opacity", str(titleopacity));
  titlebutton = createButton("Click here to begin.");
  titlebutton.addClass("button");
  titlebutton.style('font-size', smallfont+"px");
  titlebutton.center('horizontal');
  titlebutton.style('margin-top', 3*windowHeight/4+"px");
  titlebutton.mousePressed(nextscene);
  titlebutton.parent("body");
  buttoncover = createDiv();
  buttoncover.addClass("cover");
  buttoncover.style("background-color", "rgb(187, 211, 237)");
  buttoncover.position(-10000, 0);
  transitioncover = createDiv();
  transitioncover.addClass("transition");
  transitioncover.style("background-color", "rgb(255, 255, 255)");
  transitioncover.position(-10000, 0);
}

function nextscene() {
  transitioncover.position(0, 0);
  transitionbool = true;
}

function transition() {
  if (transitionbool == true) {
    if (beginbool == true) {
      transitionopacity += (1-transitionopacity)*0.03;
      if (transitionopacity > 0.99) {
        counter += 1;
        beginbool = false;
      }  
    } else {
      transitionopacity -= transitionopacity*0.04;
      if (transitionopacity < 0.1) {
        transitionopacity = 0;
        beginbool = true;
        transitioncover.position(-10000, 0);
        transitionbool = false;
      }
    }
  }
  transitioncover.style("opacity", str(transitionopacity));
}

function titlescreen() {
  fill(187, 211, 237);
  rect(0, 0, windowWidth, windowHeight);
}

function instructions() {
  fill(187, 211, 237);
  rect(0, 0, windowWidth, windowHeight);
  fill(0);
  titletext.position(-100000, 0);
  textFont("Syne");
  textAlign(CENTER);
  textSize(smalltext);
  text("WAVE will calibrate based on your current breath rate. After calibration, WAVE will guide you through an anti-anxiety breathing technique. Every time the wave rises, inhale, and every time the wave falls, exhale. Hold your breath when the wave is stagnant.", windowWidth/6, 7*windowHeight/24, 2*windowWidth/3);
  titlebutton.html("Click here to continue.");
  titlebutton.position(3*windowWidth/12, 0);
}

function sortmicdata() {
  let data = mic.getLevel();
  let time = millis();
  if (maxvols.length < 10) {
    micvol.push(data);
    if (micvol.length > 50) {
      var highest = 0;
      for (let i = 0; i < 50; i++) {
        itemlist = micvol[i];
        if (itemlist > highest) {
          highest = itemlist;
        }
      }
      maxvols.push(highest);
      micvol.length = 0;
    }    
  } else {
    var lowest = maxvols[0];
    for (let i = 0; i < 10; i++) {
      if (maxvols[i]/10 < lowest) {
        lowest = maxvols[0];
      }
    }
    lastmillis = millis();
    threshold = lowest;
    maxvols.length = 0;
  }
  if (threshold != null) {
    if (peaktimes.length < 10) {
      console.log(averagerate, threshold, data);
      if (newpeakbool == true) {
        if (data > threshold) {
          console.log("PEAK", peaktimes.length);
          var timediff = millis() - lastmillis;
          lastmillis = millis();
          peaktimes.push(timediff);
          newpeakbool = false;
        }
      } else {
        if (data < threshold) {
          newpeakbool = true;
        }
      }
    } else {
      var newsum = 0;
      for (let i = 0; i < peaktimes.length; i++) {
        newsum += peaktimes[i]/peaktimes.length;
      }
      if (newsum > 400) {
        if (firstroundbool == true) {
          firstroundbool = false;
        }
        if (newsum > averagerate) {
          averagerate = newsum;
        }
      }
      peaktimes.length = 0;
    }
  }
}

function calibrate() {
  mic.start();
  sortmicdata();
  fill(187, 211, 237);
  rect(0, 0, windowWidth, windowHeight);
  fill(0);
  titletext.position(-100000, 0);
  textFont("Syne");
  textAlign(CENTER);
  textSize(medtext);
  if (averagerate == null){
    text("Calibrating...", windowWidth/6, 7*windowHeight/24, 2*windowWidth/3);
    buttoncover.position(0, 2*windowHeight/3);
  } else {
    text("Calibrated!", windowWidth/6, 7*windowHeight/24, 2*windowWidth/3);
    buttoncover.position(-1000000, 0);
  }
}

function guidedtechnique() {
  var usetime;
  if (firstroundbool == true) {
    usetime = averagerate;
  } else {
    usetime = averagerate*0.8;
  }
  
  if (usetime > 1700) {
    mytimer = millis();
    transitionbool = true;
  }
  
  if (mytimer == null) {
    mytimer = millis();
  }
  sortmicdata();
  var thetime = millis() - mytimer;
  titlebutton.position(-1000000, 0);
  fill(187, 211, 237);
  rect(0, 0, windowWidth, windowHeight);
  if (animationcounter == 0) {
    fill(0);
    rect(0, 0, windowWidth, windowHeight - windowHeight*(thetime/usetime))
  } else if (animationcounter == 1) {
  } else if (animationcounter == 2) {
    fill(0);
    rect(0, 0, windowWidth, windowHeight*(thetime/usetime))
  } else if (animationcounter == 3) {
    fill(0);
    rect(0, 0, windowWidth, windowHeight)
  }
  if (thetime >= usetime) {
    if (animationcounter != 3) {
      animationcounter += 1;
    } else {
      animationcounter = 0;
    }
    mytimer = millis();
  }
}

function endscreen() {
  fill(187, 211, 237);
  rect(0, 0, windowWidth, windowHeight);
  fill(0);
  textFont("Syne");
  textAlign(CENTER);
  textSize(smalltext);
  text("WAVE senses that your breath rate has calmed. We hope you've enjoyed this technique guide!", windowWidth/6, 7*windowHeight/24, 2*windowWidth/3);
  if (millis() - mytimer > 2000) {
    endopac += (255-endopac)*0.3;
    if (endopac > 245) {
      endopac = 255;
      frameRate(0);
    }
  }
  push();
  fill(0, 0, 0, endopac);
  rect(0, 0, windowWidth, windowHeight);
  pop();
}

function draw() {
  transition();
  if (waveloop.isPlaying() == false) {
    waveloop.loop();
  }
  noStroke();
  textFont('Syne');
  background(220);
  switch (counter) {
    case 0:
      titlescreen();
      break;

    case 1:
      instructions();
      break;

    case 2:
      calibrate();
      break;

    case 3:
      guidedtechnique();
      break;

    case 4:
      endscreen();
      break;
  }
}