
let img;
let typeh  = 100;
let pagew = 500;
let pageh = 1000;
let leftedge = typex = pagew+15;
let topedge = typey = 20;
let startx, starty, curx, cury=0;
let dragging = false;

//composition area
let panelw = 1100;
let panelh = 1600;//make sure this is bigger than pageh
let centerx; 
let lines = [];//this will be array of arrays
let linewidths = [];//keep track of line widths, for centering
let curline = 0;

let cursordrag = false;
let startcursory;

let input;//file upload input
let checkbox;//checkbox for centered mode
let slider;//slider for tile spacing - only available on a clear canvas

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
let spacetile = 0;

let handlew = 10;

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
    /*
    let tempimg = createImg(file.data, '');
    tempimg.hide();
    images.push(tempimg);
    */
   let tempimg = loadImage(file.data, success, failure);

   /*
    let tpage = new Page(tempimg);
    tpage.autofit(pagew, 1000);
    //pages.push(tpage);
    pages.unshift(tpage);
    */
   //let tempimg = loadImage("")
  }
}

function success(tempimg) {
  let tpage = new Page(tempimg);
  tpage.autofit(pagew, pageh);
  //pages.push(tpage);
  pages.unshift(tpage);
}

function failure(event) {
  console.error('Oops!', event);
}

function setup() {
  console.log('SAVES: '+saves);
  centerx = int(panelw/2);
  lines.push(new Array());
  linewidths.push(0);
  curline = 0;

  createCanvas(pagew+panelw, panelh);

  input = createFileInput(handleImage, true);
  input.position(0, pageh+50);

  checkbox = createCheckbox(' centered');
  checkbox.position(0, pageh+100);

  slider = createSlider(0, 10, 0, 1);
  slider.position(0, pageh+150);
  slider.size(80);

  describe('An interactive tool that displays an image on the left, and blank canvas on the right. Selecting portions of the image assembles them as tiles on the right.');
  
  for (let i=0;i<imglist.length;i++) {
    let tpage = new Page(pageimgs[i]);
    tpage.autofit(pagew, pageh);
    pages.push(tpage);
  }
  curpage = 0;
  for (let j=0;j<numbanks;j++) {
    saves[j] = new Array();
    for (let i=0;i<26;i++) {
      saves[j][i] = 0;
    }
  }
}

function draw() {
  background(255);
  pages[curpage].display();

  if (curline==0 && lines[curline].length==0) {//we are on a clear canvas
    slider.show();  
    spacing = slider.value();
    textSize(14);
    noStroke();
    fill(0, 0, 0);
    //
    text('spacing: '+spacing, 10, pageh+17);
    
  }
  else slider.hide();

  if (dragging) {
    stroke(255, 0, 0);
    noFill();
    rect(startx, starty,curx-startx, cury-starty);
  }

  textSize(14);
  noStroke();
  fill(0, 0, 0);
  text('KEY BANK: '+curbank, 10, pageh+37);//display bank number

  /*
  for (let i=0;i<tiles.length;i++) {
    tiles[i].display();
  }
  */
 for (let i=0;i<lines.length;i++) {
  push();
  if (checkbox.checked()) translate((panelw-linewidths[i])/2, 0);
  for (let j=0;j<lines[i].length;j++) {
    lines[i][j].display(); 
  }
  pop();
 }
  stroke(255, 0, 0);
  push();
  if (checkbox.checked()) translate((panelw-linewidths[curline])/2, 0);
  line(typex, typey, typex, typey+typeh);
  if (typex == leftedge) {
    drawcursorhandle();
  }
  pop();
}

function drawcursorhandle() {
  stroke(255, 0, 0);
  if (checkcursorhandle()) fill (255, 0, 0);
  else noFill();
  rect (typex-handlew, typeh+typey, handlew*2, handlew);
  
}

function checkcursorhandle() {
  //console.log("mouseX "+mouseX);
  if (typex!=leftedge) return false;
  let offset = 0;
  if (checkbox.checked()) offset = (panelw-linewidths[curline])/2;
  if (mouseX>offset+typex-handlew && mouseX<offset+typex+handlew && mouseY>typeh+typey && mouseY<typeh+typey+handlew) return true;
  else return false;
}

function mousePressed() {
  //if (mouseX<img.width && mouseY<img.height) {
    if (mouseX<pages[curpage].w && mouseY<pages[curpage].h) {
    startx=curx = mouseX;
    starty=cury = mouseY;
    dragging = true;
  }
  else if (checkcursorhandle()) {
    cursordrag = true;
    startcursory = mouseY;
  }
}

function mouseDragged() {
  curx = mouseX;
  if (curx > pages[curpage].w) curx = pages[curpage].w;
  if (curx < 0) curx = 0;
  cury = mouseY;
  if (cury > pages[curpage].h) cury = pages[curpage].h;
  if (cury < 0) cury = 0;

  if (cursordrag) {
    dy = mouseY-startcursory;
    typeh+=dy;
    if (typeh<30) typeh = 30;
    if (typeh>200) typeh = 200;
    startcursory = mouseY;
  }
}

function mouseReleased() {
  cursordrag = false;
  if (!dragging) return;
  if (curx==startx || cury==starty) {
    dragging = false;
    return;
  }
  let newx = min(curx, startx);
  let newy = min(cury, starty);
  let neww = abs(curx-startx);
  let newh = abs(cury-starty);
  //let tempw = typeh*(curx-startx)/(cury-starty);
  let tempw = typeh*neww/newh;
  //let subimg = img.get(startx, starty, curx-startx, cury-starty);
  //let subimg = testpage.extract(startx, starty, curx-startx, cury-starty);

  //let subimg = pages[curpage].extract(startx, starty, curx-startx, cury-starty);
  let subimg = pages[curpage].extract(newx, newy, neww, newh);

  //pages[curpage].rects.push(new Rectangle(startx, starty, curx-startx, cury-starty));
  pages[curpage].rects.push(new Rectangle(newx, newy, neww, newh));


  let newtile = new Tile(subimg, typex, typey, tempw, typeh);
  //tiles.push(new Tile(subimg, typex, typey, tempw, typeh));
  //typex+=tempw+spacing;
  typetile(newtile);
  console.log("SNIP");
  dragging = false;

  lasttile = newtile;
  
}

function typetile(ntile) {
  if (ntile.h != typeh) {//resize tile
    let tempw = typeh*ntile.w/ntile.h;
    ntile.w = tempw;
    ntile.h = typeh;
  }
  tiles.push(ntile);
  lines[curline].push(ntile);
  ntile.x = typex;
  ntile.y = typey;
  lasttile = ntile;
  typex+=ntile.w+spacing;
  linewidths[curline]+=ntile.w+spacing;
}

function keyPressed() {
  console.log(keyCode);
  if (keyCode == 13) {//return
    typex = leftedge;
    typey+=typeh+spacing-1;
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
      if (lasttile!=0) {
        if (saves[curbank][saveindex]!=0) {
          console.log("recall saves"+saveindex);
          typetile(saves[curbank][saveindex].copy());
        }
      }
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
      spacetile = lasttile;
      console.log("saved spacebar");
    }
    else {//recall the correct tile, if exists
      if (lasttile!=0) {
        if (spacetile!=0) {
          console.log("recall space");
          typetile(spacetile.copy());
        }
      }
    }
  }
  else if (keyCode==192) {//tilde
    if (shiftPressed) cleartiles();
  }
  else if (keyCode==37 || keyCode==39) {//left and right arrows
    if (lasttile!=0) lasttile.fliph = !lasttile.fliph;
  }
  else if (keyCode==38 || keyCode==40) {//up and down arrows
    if (lasttile!=0) lasttile.flipv = !lasttile.flipv;
  }
  else if (keyCode==8) {//DELETE
    
    /*
    let ttile = tiles.pop();
    //typex-=ttile.w;
    if (tiles.length>=1) {
      let prevtile = tiles[tiles.length-1];
      typex = prevtile.x+prevtile.w;
      typey = prevtile.y;
      typeh = prevtile.h;
    }
    else {
      typex = leftedge;
      typey = topedge;
    }
    */
   let ttile = lines[curline].pop();
   if (lines[curline].length>=1) {
      let prevtile = lines[curline][lines[curline].length-1];
      typex = prevtile.x+prevtile.w+spacing;
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
      typex = prevtile.x+prevtile.w+spacing;
      typey = prevtile.y;
      typeh = prevtile.h;

      calculateLineWidth();
    }
    else {//if we get here, curline = 0 and length = 0 ?
      typex = leftedge;
      typey = topedge;
    }
   }
    
  
  }
}

function calculateLineWidth() {
  let w = 0;
  for (let i=0;i<lines[curline].length;i++) {
    w+=lines[curline][i].w+spacing;
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

function cleartiles() {
  typex = leftedge;
  typey = topedge;
  tiles = [];

  lines = [];
  lines.push(new Array());
  linewidths = [];
  linewidths.push(0);
  curline = 0;
}


class Tile {
  constructor(i, x, y, w, h) {
    this.img = i;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.fliph = false;
    this.flipv = false;
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

  copy() {
    let newtile = new Tile(this.img, this.x, this.y, this.w, this.h);
    newtile.fliph = this.fliph;
    newtile.flipv = this.flipv;
    return (newtile);
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  display() {
    noFill();
    stroke(255, 0, 0);
    for (let i=this.x;i<this.x+this.w;i+=3){
      line(i, this.y, i, this.y+this.h);
    }
  }
}

class Page {//a source image, scaled and with selection areas saved
  constructor(myimg) {
    this.img = myimg;
    this.scale = 1;
    this.w = myimg.width;
    this.h = myimg.height;
    console.log("created page with image "+this.w+" x "+this.h);
    this.rects = [];//note rects are in screen space
  }

  autofit(w, h) {//scale the image to fit rect. ASSUME IMAGE IS ALWAYS >= THAN DRAWN AREA
    
    this.scale = min(w/this.img.width, h/this.img.height);
    this.w = this.scale*this.img.width;
    this.h = this.scale*this.img.height;

    //console.log("autofit: "+fitwidth+" to "+this.w+" "+this.h+", scale "+this.scale);

  }

  extract(x, y, w, h) {//accepts screen coordinates and returns corresponding image section in full res
    let subimg = this.img.get(x/this.scale, y/this.scale, w/this.scale, h/this.scale);
    return subimg;
  }

  display() {
    image(this.img, 0, 0, this.w, this.h);
    for (let i=0;i<this.rects.length;i++) {
      this.rects[i].display();
    }
  }

}




