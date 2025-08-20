
let img;
let typeh  = 100;
let pagew = 500; //500x800 for website; 1000x1200 for desktop
let pageh = 800;//1000;
let leftedge = pagew+15;
let typex = 0;
let topedge = typey = 20;
let startx, starty, curx, cury=0;
let dragging = false;

let renderscale = 4;//render canvas is 4x display dimensions
let renderg;

let mintypeh = 30;
let maxtypeh = 1000;

//composition area
let panelw = 2100;//2100;//1100; //1100x1600 for website; 2100x3700 for big monitor
let panelh = 3600;//3600;//1600;//make sure this is bigger than pageh
let centerx; 
let lines = [];//this will be array of arrays
let linewidths = [];//keep track of line widths, for centering
let curline = 0;

let cursordrag = false;
let canvasdrag = false;//are we dragging in the canvas? otherwise in source image
let startcursory;
let sourcew = 0;
let sourceh = 0;
let desth = 0;
let destw = 0;

let input;//file upload input
let checkbox;//checkbox for centered mode
let slider;//slider for tile spacing - only available on a clear canvas
let aspectcheckbox;//checkbox for fixed aspect ratio
let aspectRatio = NaN;

let widthinput;//text field for aspect ratio width
let heightinput;//text field for aspect ratio height

let images = [];

let spacing = 3;

let tiles = [];//store tile images
let rects = [];
let pages = [];
let curpage = -1;

//let customlist = ['miranda/pinenegative.jpeg', 'miranda/pinepositive.jpeg'];//miranda
let customlist = [];
let imglist = ['cosa_text2.jpg', 'pines.jpg', 'tiberisland.jpg', 
'colosseum1.jpg', 'forum1.jpg', 'forum2.jpg', 'viappia1.jpg', 'DSC00121.JPG', 'domusaurea1.jpg', 'domusaurea2.jpg', 'pantheon1.jpg'];
let pageimgs = [];
let testpage;

let controlPressed = false;
let altPressed = false;
let shiftPressed = false;

let lasttile = 0;


let curbank = 0;//for having multiple memory banks for keyboard mappings 
let numbanks = 3;
let saves = [];
let spacetile = [];

let handlew = 10;

let previewcanvas = true;//whether we draw scaled offscreen buffer or not

window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
  }
}, false);


function preload() {
  let myimglist = customlist.concat(imglist);
  for (let i=0;i<myimglist.length;i++) {
    let tempimg = loadImage("assets/"+myimglist[i]);
    pageimgs.push(tempimg);
  }

 
}

// Create an image if the file is an image,
// then add it to the images array.
function handleImage(file) {
  if (file.type === 'image') {
   let tempimg = loadImage(file.data, success, failure);
  }
}

function success(tempimg) {
  let tpage = new Page(tempimg);
  tpage.autofit(pagew, pageh);
  //pages.push(tpage);
  pages.unshift(tpage);
  curpage = 0;
}

function failure(event) {
  console.error('Oops!', event);
}

function handleKeyboardImage(file) {
  if (file.type === 'image') {
    let fname = file.name.split('.')[0];
    if (fname.length==1) {
      let kindex = fname.charCodeAt(0);
      if (kindex >=65 && kindex < 91) {
       //let tempimg = loadImage(file.data, keyloadSuccess, failure);
      let tempimg = loadImage(file.data, 
        (timg)=>{
          console.log("loaded keyboard image, mapping to key "+fname+" index "+kindex);
          saves[curbank][kindex-65] = new Tile(timg, 0, 0, timg.width, timg.height);
          console.log("made tile "+timg.width+" "+timg.height);
        }, 
        failure);
      }
    }
}
}


function setup() {
  console.log('SAVES: '+saves);
  centerx = int(panelw/2);
  lines.push(new Array());
  linewidths.push(0);
  curline = 0;

  createCanvas(pagew+panelw+15, panelh);
  renderg = createGraphics(panelw*renderscale, panelh*renderscale);

  input = createFileInput(handleImage, true);
  input.position(0, 150+pageh+120);

  checkbox = createCheckbox(' centered');
  checkbox.position(0, 150+pageh+140);
  checkbox.mouseClicked(() => {
    console.log("checkbox clicked");
    rendercanvas();
  });

  slider = createSlider(0, 10, 0, 1);
  slider.position(0, 150+pageh+160);
  slider.size(80);

  let button = createButton('EXPORT');
  button.position(160, 150+pageh+160);

  // Use the button to change the background color.
  button.mousePressed(() => {
    renderg.save();
  });

  let kbutton = createButton('saveKeyboard');
  kbutton.position(160, 30+150+pageh+180);
  kbutton.mousePressed(() => {
    savekeyboard();
  });

  /*
  let loadkbutton = createButton('loadKeyboard');
  loadkbutton.position(160, 150+100+pageh+180);
  loadkbutton.mousePressed(() => {
    loadkeyboard();
  });
  */
  let loadkbutton = createFileInput(handleKeyboardImage, true);
  loadkbutton.position(160+100, 30+150+pageh+180);
  
  aspectcheckbox = createCheckbox(' fixed aspect ratio');
  aspectcheckbox.position(160, 30+150+pageh+220);
  aspectcheckbox.mouseClicked(() => {
    console.log("aspect checkbox clicked");
    //rendercanvas();
  });

  widthinput = createInput();
  widthinput.position(160, 30+150+pageh+240);

  heightinput = createInput();
  heightinput.position(160, 30+150+pageh+260);

  widthinput.hide();
  heightinput.hide();
  
  describe('An interactive tool that displays an image on the left, and blank canvas on the right. Selecting portions of the image assembles them as tiles on the right.');
  
  for (let i=0;i<imglist.length;i++) {
    let tpage = new Page(pageimgs[i]);
    tpage.autofit(pagew, pageh);
    pages.push(tpage);
  }
  curpage = 0;
  spacetile = new Array();
  for (let j=0;j<numbanks;j++) {
    spacetile[j] = 0;
    saves[j] = new Array();
    for (let i=0;i<26;i++) {
      saves[j][i] = 0;
    }
  }

  angleMode(DEGREES);
}

function draw() {
  noSmooth();
  background(255);
  pages[curpage].display();

  noStroke();
  fill(255);
  rect(0, pageh, pagew, panelh-pageh);
  rect(pagew, 0, panelw, panelh);

  if (curline==0 && lines[curline].length==0) {//we are on a clear canvas
    slider.show();  
    spacing = slider.value();
    textSize(14);
    noStroke();
    fill(0, 0, 0);
    //
    text('spacing: '+spacing, 10, 150+pageh-17);
    
  }
  else slider.hide();

 

  textSize(14);
  noStroke();
  if (dragging || canvasdrag) fill(0, 0, 0);
  else fill(200, 200, 200);

  text('source: '+sourcew+" x "+sourceh, 10, 150+pageh);
  text('destination: '+destw+" x "+desth, 10, 150+pageh+15);
  //text('aspect ratio: '+Number(sourcew/sourceh).toFixed(3), 10, 150+pageh+30);
  text('aspect ratio: '+Number(aspectRatio).toFixed(3), 10, 150+pageh+30);
  fill(0, 0, 0);
  text('type height: '+typeh, 10, 150+pageh+45);//display bank number
  text('KEY BANK: '+curbank, 10, 150+pageh+60);//display bank number


 push();
 translate(leftedge, 0);
 for (let i=0;i<lines.length;i++) {
  push();
  if (checkbox.checked()) translate((panelw-linewidths[i])/2, 0);
  for (let j=0;j<lines[i].length;j++) {
    lines[i][j].display(); 
  }
  pop();

}
 pop();


  //rendercanvas();//don't do this every frame

 
 image(renderg, leftedge, 0, panelw, panelh);
  stroke(0);
  noFill();
  rect(leftedge, 0, panelw, panelh);
  

  stroke(255, 0, 0);
  push();
 translate(leftedge, 0);
  //display cursor
  if (checkbox.checked()) translate((panelw-linewidths[curline])/2, 0);
  line(typex, typey, typex, typey+typeh);
  if (typex == 0) {
    drawcursorhandle();
  }
  pop();


  if (dragging) {
    if (canvasdrag) stroke(0, 255, 255);
    else stroke(255, 0, 0);
    noFill();
    rect(startx, starty,curx-startx, cury-starty);
  }
}

function rendercanvas() {
  //offscreen buffer
  renderg.noSmooth();
  renderg.background(255);
  for (let i=0;i<lines.length;i++) {
    renderg.push();
    if (checkbox.checked()) renderg.translate(renderscale*(panelw-linewidths[i])/2, 0);
    for (let j=0;j<lines[i].length;j++) {
      //lines[i][j].display(); 
      lines[i][j].render(renderg, renderscale);
    }
    renderg.pop();
 }

}

function drawcursorhandle() {
  stroke(255, 0, 0);
  if (checkcursorhandle()) fill (255, 0, 0);
  else noFill();
  rect (typex-handlew, typeh+typey, handlew*2, handlew);
  
}

function checkcursorhandle() {
  //console.log("mouseX "+mouseX);
  if (typex!=0) return false;
  let offset = leftedge;//0;
  if (checkbox.checked()) offset += (panelw-linewidths[curline])/2;
  if (mouseX>offset+typex-handlew && mouseX<offset+typex+handlew && mouseY>typeh+typey && mouseY<typeh+typey+handlew) return true;
  else return false;
}

function mousePressed() {
  
  //if (mouseX<pages[curpage].w && mouseY<pages[curpage].h) {
  if (mouseX<pagew && mouseY<pageh) {  
    startx=curx = mouseX;
    starty=cury = mouseY;
    dragging = true;
    canvasdrag = false;
  }
  else if (checkcursorhandle()) {
    cursordrag = true;
    startcursory = mouseY;
  }
  else if (mouseX>pagew) {//dragging on right side
    startx=curx = mouseX;
    starty=cury = mouseY;
    dragging = true;
    canvasdrag = true;
  }
}

function mouseDragged() {
  curx = mouseX;
  cury = mouseY;

  if (cursordrag) {
    dy = mouseY-startcursory;
    typeh+=dy;
    if (typeh<mintypeh) typeh = mintypeh;
    if (typeh>maxtypeh) typeh = maxtypeh;
    startcursory = mouseY;
    return;
  }

  
  if (aspectcheckbox.checked()) {
    let thisaspect = aspectRatio;
    let checkw = float(widthinput.value()); //use user-entered numbers
    if (!isNaN(checkw)) {
      let checkh = float(heightinput.value());
      if (!isNaN(checkh)) {
        thisaspect = checkw/checkh;
        console.log("user-input aspect ratio: "+thisaspect+", width "+checkw+", height "+checkh);
      }
    }
    if (!isNaN(thisaspect) && thisaspect!=0) {
      // Adjust width based on mouse position
      let cheight = abs(curx-startx) / aspectRatio;
      if (cury<startx) cury = starty-cheight;
      else cury = starty+cheight;
    }
  
  }
  

  let newx = min(curx, startx);
  let newy = min(cury, starty);
  let neww = abs(curx-startx);
  let newh = abs(cury-starty);
  let tempw = typeh*neww/newh;
  sourcew = neww;
  sourceh = newh;
  desth = typeh;
  destw = tempw;

  if (canvasdrag) {
    if (curx < pagew) curx = pagew;
    if (cury < 0) cury = 0;

    sourcew-=2;
    sourceh-=2;
  }
  else {
    //if (curx > pages[curpage].w) curx = pages[curpage].w;
    if (curx > pagew) curx = pagew;
    if (curx < 0) curx = 0;
    
    //if (cury > pages[curpage].h) cury = pages[curpage].h;
    if (cury > pageh) cury = pageh;
    if (cury < 0) cury = 0;

    sourcew=sourcew/pages[curpage].scale;
    sourceh=sourceh/pages[curpage].scale;
  }

  sourcew = floor(sourcew);
  sourceh = floor(sourceh);
  destw = floor(destw);
  desth = floor(desth);
  if (!aspectcheckbox.checked()) aspectRatio = sourcew/sourceh;
  
}

function extract(x, y, w, h) {//accepts screen coordinates and returns corresponding image section in full res
  let subimg = renderg.get((x-leftedge)*renderscale, renderscale*y,renderscale*w, renderscale*h);
  return subimg;
}

function mouseReleased() {
  cursordrag = false;
  if (!dragging) return;
  if (curx==startx || cury==starty) {
    dragging = false;
    return;
  }
  let newx = floor(min(curx, startx));
  let newy = floor(min(cury, starty));
  let neww = floor(abs(curx-startx));
  let newh = ceil(abs(cury-starty));//was floor; trying to fix gaps
  
  let tempw = floor(typeh*neww/newh);
 

  

  let subimg;
  if (canvasdrag) {//grabbing from self-canvas!
   // subimg = get(newx+1, newy+1, neww-2, newh-2);
    subimg = extract(newx, newy, neww, newh);
  }
  else {//grabbing from source image
    subimg = pages[curpage].extract(newx, newy, neww, newh);
    
  }


  let newtile = new Tile(subimg, typex, typey, tempw, typeh);
  typetile(newtile);
  console.log("SNIP");
  dragging = false;

  lasttile = newtile;
  
  
}

function typetile(ntile) {
  if (ntile.h != typeh) {//resize tile
    let tempw = floor(typeh*ntile.w/ntile.h);
    ntile.w = tempw;
    ntile.h = typeh;//+2?fix gaps
  }
  tiles.push(ntile);
  lines[curline].push(ntile);
  ntile.x = typex;
  ntile.y = typey;//-1?fix gaps
  lasttile = ntile;


  updatecursor();
  //typex+=ntile.w+spacing;
  //linewidths[curline]+=ntile.w+spacing;
  rendercanvas();
}

function updatecursor() {
  
  calculateLineWidth();
  console.log("update cursor, typex "+linewidths[curline]);
  typex = linewidths[curline];
}

function keyPressed() {
  console.log(keyCode);
  if (keyCode == 13) {//return
    typex = 0;
    //typey+=typeh+spacing-1;//-1 to fix spaced lines, but makes it worse when scaled?
    typey+=typeh+spacing;
    
    //make new line array
    lines.push(new Array());
    linewidths.push(0);
    curline++;
  }
  else if (keyCode>=48 && keyCode<=57) {
    let which = 9-(57-keyCode);
    console.log("switch to page "+which);
    if (pages.length>which) curpage = which;
  }
  else if (keyCode==187) {//equal sign / plus key
    curpage++;
    if (curpage>=pages.length) curpage = 0;
  }
  else if (keyCode==189) {//hyphen / minus key
    curpage--;
    if (curpage<0) curpage = pages.length-1;
  } 
  else if (keyCode==SHIFT) {//(keyCode==ALT) {
    shiftPressed = true;
  }
  else if (keyCode==CONTROL) {
    controlPressed = true;
  }
  else if (keyCode>=65 && keyCode<=90) {
    let saveindex = keyCode-65;
    if (shiftPressed) {//save tile into array
      saves[curbank][saveindex] = lasttile;
      console.log("saved "+key);
    }
    else {//recall the correct tile, if exists
      //if (lasttile!=0) {
        if (saves[curbank][saveindex]!=0) {
          console.log("recall saves"+saveindex);
          typetile(saves[curbank][saveindex].copy());
        }
      //}
    }
  }
  else if (shiftPressed && keyCode==219) {//'['
    curbank--;
    if (curbank<0) curbank = numbanks-1;
  }
  else if (shiftPressed && keyCode==221) {//']'
    curbank++;
    if (curbank>=numbanks) curbank = 0;
  }
  else if (keyCode==32) {
    if (shiftPressed) {//controlPressed
      spacetile[curbank] = lasttile;
      console.log("saved spacebar");
    }
    else {//recall the correct tile, if exists
      if (lasttile!=0) {
        if (spacetile[curbank]!=0) {
          console.log("recall space");
          typetile(spacetile[curbank].copy());
        }
      }
    }
  }
  else if (keyCode==188) {//,< zoom in
    pages[curpage].zoomin();

  }
  else if (keyCode==190) {//.> zoom out
    pages[curpage].zoomout();
  }
  else if (keyCode==37 && shiftPressed) {//left arrow; pan left
    pages[curpage].panx(100);

  }
  else if (keyCode==39 && shiftPressed) {//right arrow; pan right
    pages[curpage].panx(-100);

  }
  else if (keyCode==38 && shiftPressed) {//up arrow; pan up
    pages[curpage].pany(100);
  }
  else if (keyCode==40 && shiftPressed) {//down arrow; pan down
    pages[curpage].pany(-100);
  }
  else if (keyCode==192) {//tilde
    if (shiftPressed) cleartiles();
  }
  else if (keyCode==37 || keyCode==39) {//left and right arrows
    if (lasttile!=0) lasttile.fliphoriz();
    rendercanvas();
  }
  else if (keyCode==38 || keyCode==40) {//up and down arrows
    if (lasttile!=0) lasttile.flipvert();
    rendercanvas();
  }
  else if (keyCode==191) {//forward slash /
    if (lasttile!=0) lasttile.rotate();
    updatecursor();
    rendercanvas();
  }
  else if (keyCode==220) {//backslash \
    previewcanvas = !previewcanvas;
    console.log("PREVIEW CANVAS: "+previewcanvas);
  }
  else if (keyCode==8) {//DELETE
    
   let ttile = lines[curline].pop();
   if (lines[curline].length>=1) {
      let prevtile = lines[curline][lines[curline].length-1];
      typex = prevtile.x+prevtile.getwidth()+spacing;
      typey = prevtile.y;
      typeh = prevtile.h;
      //linewidths[curline]-=ttile.width+spacing;
      calculateLineWidth();
   }
   else {//current line length is 0, so jump back to end of last tile
    while (curline>0 && lines[curline].length==0) {//delete any extra empty lines
      lines.pop();
      linewidths.pop();
      curline--;
    }
    if (lines[curline].length>=1) {
      let prevtile = lines[curline][lines[curline].length-1];
      typex = prevtile.x+prevtile.getwidth()+spacing;
      typey = prevtile.y;
      typeh = prevtile.h;

      calculateLineWidth();
    }
    else {//if we get here, curline = 0 and length = 0 ?
      typex = 0;
      typey = topedge;
    }
    
   }
   rendercanvas(); 
  
  }//END DELETE
}

function calculateLineWidth() {
  let w = 0;
  for (let i=0;i<lines[curline].length;i++) {
    //w+=lines[curline][i].w+spacing;
    w+=lines[curline][i].getwidth()+spacing;
  }
  linewidths[curline] = w;
  console.log("linewidth: "+w+" for curline:"+curline);
}

function keyReleased() {
  if (keyCode==SHIFT) {
    //altPressed = false;
    shiftPressed = false;
  }
  if (keyCode==CONTROL) {
    controlPressed = false;
  }
}

function savekeyboard() {
  for (let i=0;i<26;i++) {
    if (saves[curbank][i]!=0) {
      let filename = String.fromCharCode(i+65)+".jpg";
      console.log("saving "+filename);
      save(saves[curbank][i].img, filename);
    }
  }
}

function cleartiles() {
  typex = 0;//leftedge;
  typey = topedge;
  tiles = [];

  lines = [];
  lines.push(new Array());
  linewidths = [];
  linewidths.push(0);
  curline = 0;
  rendercanvas();
}


class Tile {
  constructor(i, x, y, w, h) {
    this.img = i;
    this.x = x;
    this.y = y-1;
    this.w = w;
    this.h = h+2;
    this.fliph = false;
    this.flipv = false;
    this.angle = 0;
    this.sideways = false;
  }

  display() {
    //image(this.img, this.x, this.y, this.w, this.h);
    push();
    translate(this.x, this.y);
    translate(0.5*this.w, 0.5*this.h);
    if (this.fliph) scale(-1, 1);
    if (this.flipv) scale(1, -1);
    image(this.img, -0.5*this.w, -0.5*this.h, this.w, this.h);
    pop();
  }

  rotate() {
    this.angle+=90;
    if (this.angle > 270) this.angle = 0;
    if (this.angle==90 || this.angle==270) this.sideways = true;
    else this.sideways = false;
  }

  render(g, s) {//graphics context, scale

    /* pre-rotate version
    g.push();
    g.translate(s*this.x, s*this.y-1);
    //g.translate(s*0.5*this.w, s*0.5*this.h);
    g.translate(s*0.5*this.w, s*0.5*this.h);//fix gaps
    if (this.fliph) g.scale(-1, 1);
    if (this.flipv) g.scale(1, -1);
    g.image(this.img, -0.5*s*this.w, -0.5*s*this.h, s*this.w, s*this.h+2);
    g.pop();
    */

    /*
   let curw = this.w;
   let curh = this.h;
   let domod = false;
   if (this.sideways) {//need to modify w and h so stays same lineheight
    let mod = this.h/this.w;
    curw*=mod;
    curh*=mod;
    domod = true;
   }
    g.push();
   
    g.translate(s*this.x, s*this.y-1);
    

    
    if (!domod) g.translate(s*0.5*curw, s*0.5*curh);
    else g.translate(s*0.5*curh, s*0.5*curw);
    //g.push();
    g.angleMode(DEGREES);
    g.rotate(this.angle);
    
    if (this.fliph) g.scale(-1, 1);
    if (this.flipv) g.scale(1, -1);
    
    g.push();
    
    g.translate(-0.5*s*curw, -0.5*s*curh);
    //g.image(this.img, 0, 0, s*curw, s*curh+2);
    g.image(this.img, 0, 0, s*curw, s*curh, 0, 0, this.img.width, this.img.height, COVER);
    g.pop();
    g.pop();
    //g.pop();
    */
    let curw = this.w;
    let curh = this.h;
    let domod = false;
    if (this.sideways) {//need to modify w and h so stays same lineheight
     let mod = this.h/this.w;
     curw*=mod;
     curh*=mod;
     domod = true;
    }
     g.push();
    
     g.translate(s*this.x, s*this.y-1);
     
    g.imageMode(CENTER);

    if (!domod) g.translate(floor(s*0.5*curw), floor(s*0.5*curh));
     else g.translate(floor(s*0.5*curh), floor(s*0.5*curw));

     
     g.angleMode(DEGREES);
     g.rotate(this.angle);
     
     if (this.fliph) g.scale(-1, 1);
     if (this.flipv) g.scale(1, -1);
     
     g.push();
     
     //g.image(this.img, 0, 0, s*curw, s*curh, 0, 0, this.img.width, this.img.height, COVER);
     g.image(this.img, 0, 0, s*curw, s*curh+3);
     g.pop();
     g.pop();
    //console.log("rendered w"+s*curw+" h"+s*curh+2);

    g.imageMode(CORNERS);
  }

  fliphoriz() {
    if (this.sideways) this.flipv = !this.flipv;
    else this.fliph = !this.fliph;
  }

  flipvert() {
    if (!this.sideways) this.flipv = !this.flipv;
    else this.fliph = !this.fliph;
  }

  copy() {
    let newtile = new Tile(this.img, this.x, this.y, this.w, this.h);
    newtile.fliph = this.fliph;
    newtile.flipv = this.flipv;
    newtile.angle = this.angle;
    newtile.sideways = this.sideways;
    return (newtile);
  }

  getwidth() {
    if (!this.sideways) return this.w;
    else return (this.h*this.h/this.w);
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = floor(x);
    this.y = floor(y);
    this.w = floor(w);
    this.h = floor(h);
  }

  display() {
    noFill();
    stroke(255, 0, 0);
    /*
    for (let i=this.x;i<this.x+this.w;i+=3){
      line(i, this.y, i, this.y+this.h);
    }
    */
   rect(this.x, this.y, this.w, this.h);
    for (let i=this.x;i<this.x+this.w;i++){
      if (i%5==0) line(i, this.y, i, this.y+this.h);
    }
  }

  screenDisplay(s) {//display at screen coordinates
    noFill();
    stroke(255, 0, 0);
    rect(s*this.x, s*this.y, s*this.w, s*this.h);
    for (let i=floor(s*this.x);i<floor(s*this.x+s*this.w);i++){

      if (i%3==0) line(i, s*this.y, i, s*this.y+s*this.h);
    }

  }
}

class Page {//a source image, scaled and with selection areas saved
  constructor(myimg) {
    this.img = myimg;
    this.scale = 1;
    this.fitscale = 1;//scale at which fits into defined display panel; mouse coord are one to one scale
    this.w = myimg.width;
    this.h = myimg.height;
    this.viewportw = myimg.width;
    this.viewporth = myimg.height;
    this.viewportx = 0;
    this.viewporty = 0;
    this.x = 0;
    this.y = 0;
    console.log("created page with image "+this.w+" x "+this.h);
    this.rects = [];//note rects are in screen space
  }

  autofit(w, h) {//scale the image to fit rect. ASSUME IMAGE IS ALWAYS >= THAN DRAWN AREA
    
    this.scale = min(w/this.img.width, h/this.img.height);
    this.fitscale = this.scale;
    this.w = this.scale*this.img.width;
    this.h = this.scale*this.img.height;
    this.viewportw = w;
    this.viewporth = h;

    //console.log("autofit: "+fitwidth+" to "+this.w+" "+this.h+", scale "+this.scale);

  }

  zoomin() {
    let pivot = this.screentoimg(this.viewportw/2, this.viewporth/2);
    this.scale+=0.1;
    if (this.scale > 1) this.scale = 1;
    this.x = -pivot.x*this.scale+this.viewportw/2;
   
    this.y = -pivot.y*this.scale+this.viewporth/2;
   
    this.checkbounds();
  }

  zoomout() {
    let pivot = this.screentoimg(this.viewportw/2, this.viewporth/2);
    this.scale-=0.1;
    if (this.scale < this.fitscale) this.scale = this.fitscale;
    this.x = -pivot.x*this.scale+this.viewportw/2;
    
    this.y = -pivot.y*this.scale+this.viewporth/2;
    
    this.checkbounds();
  }

  panx(dx) {
    this.x+=dx;
    this.checkbounds();
  }

  pany(dy) {
    this.y+=dy;
    this.checkbounds();
  }

  checkbounds() {
    
    if (this.x < -this.img.width*this.scale+this.viewportw) this.x = -this.img.width*this.scale+this.viewportw;
    if (this.x > 0) this.x = 0;
    
    if (this.y < -this.img.height*this.scale+this.viewporth) this.y = -this.img.height*this.scale+this.viewporth;
    if (this.y > 0) this.y = 0;
  }

  screentoimg(x, y) {//returns screen coord mapped to image pixel coords
    let imgx = (x-this.x)/this.scale;
    let imgy = (y-this.y)/this.scale;
    return({x: imgx, y: imgy});
  }

  extract(x, y, w, h) {//accepts screen coordinates and returns corresponding image section in full res
    let pos = this.screentoimg(x, y);
    let subimg = this.img.get(pos.x, pos.y, w/this.scale, h/this.scale);
    this.rects.push(new Rectangle(pos.x, pos.y, w/this.scale, h/this.scale));
    //let subimg = this.img.get(x/this.scale, y/this.scale, w/this.scale, h/this.scale);
    //this.rects.push(new Rectangle(x/this.scale, y/this.scale, w/this.scale, h/this.scale));
    
    return subimg;
  }

  display() {
    /*
    image(this.img, 0, 0, this.w, this.h);
    for (let i=0;i<this.rects.length;i++) {
      this.rects[i].display();
    }
    */
   push();
   translate(this.x, this.y);
   scale(this.scale);
   image(this.img, 0, 0);

   /*
   push();
   //scale(1/this.fitscale);
    for (let i=0;i<this.rects.length;i++) {
      this.rects[i].display();
    }
    pop();
    */
    pop();

    push();
    translate(this.x, this.y);
    for (let i=0;i<this.rects.length;i++) {
      this.rects[i].screenDisplay(this.scale);
    }
    pop();
  }

}




