
let img;
let typeh  = 100;
let pagew = 500;
let leftedge = typex = pagew+15;
let topedge = typey = 20;
let startx, starty, curx, cury=0;
let dragging = false;



let spacing = 0;

let tiles = [];//store tile images
let rects = [];
let pages = [];
let curpage = -1;

let customlist = ['miranda/pinenegative.jpeg', 'miranda/pinepositive.jpeg'];//miranda
let imglist = ['cosa_text2.jpg', 'pines.jpg', 'tiberisland.jpg', 
'colosseum1.jpg', 'forum1.jpg', 'forum2.jpg', 'viappia1.jpg', 'DSC00121.jpg', 'domusaurea1.jpg', 'domusaurea2.jpg', 'pantheon1.jpg'];
let pageimgs = [];
let testpage;

let controlPressed = false;
let altPressed = false;
let shiftPressed = false;

let lasttile = 0;

let saves = [26];
let spacetile = 0;

function preload() {
  let myimglist = customlist.concat(imglist);
  for (let i=0;i<myimglist.length;i++) {
    let tempimg = loadImage("assets/"+myimglist[i]);
    pageimgs.push(tempimg);
  }

 
}

function setup() {
  createCanvas(1600, 1600);
  
  for (let i=0;i<imglist.length;i++) {
    let tpage = new Page(pageimgs[i]);
    tpage.autofit(pagew, 1000);
    pages.push(tpage);
  }
  curpage = 0;
  for (let i=0;i<26;i++) {
    saves[i] = 0;
  }
}

function draw() {
  background(255);
  pages[curpage].display();
  if (dragging) {
    stroke(255, 0, 0);
    noFill();
    rect(startx, starty,curx-startx, cury-starty);
  }
  for (let i=0;i<tiles.length;i++) {
    tiles[i].display();
  }
  stroke(255, 0, 0);
  line(typex, typey, typex, typey+typeh);
}

function mousePressed() {
  //if (mouseX<img.width && mouseY<img.height) {
    if (mouseX<pages[curpage].img.width && mouseY<pages[curpage].img.height) {
    startx=curx = mouseX;
    starty=cury = mouseY;
    dragging = true;
  }
}

function mouseDragged() {
  curx = mouseX;
  cury = mouseY;
}

function mouseReleased() {
  if (!dragging) return;
  if (curx==startx || cury==starty) {
    dragging = false;
    return;
  }
  let tempw = typeh*(curx-startx)/(cury-starty);
  //let subimg = img.get(startx, starty, curx-startx, cury-starty);
  //let subimg = testpage.extract(startx, starty, curx-startx, cury-starty);

  let subimg = pages[curpage].extract(startx, starty, curx-startx, cury-starty);
  //rects.push(new Rectangle(startx, starty, curx-startx, cury-starty));
  pages[curpage].rects.push(new Rectangle(startx, starty, curx-startx, cury-starty));
  let newtile = new Tile(subimg, typex, typey, tempw, typeh);
  //tiles.push(new Tile(subimg, typex, typey, tempw, typeh));
  //typex+=tempw+spacing;
  typetile(newtile);
  console.log("SNIP");
  dragging = false;

  lasttile = newtile;
  
}

function typetile(ntile) {
  tiles.push(ntile);
  ntile.x = typex;
  ntile.y = typey;
  lasttile = ntile;
  typex+=ntile.w+spacing;
}

function keyPressed() {
  console.log(keyCode);
  if (keyCode == 13) {//return
    typex = leftedge;
    typey+=typeh+spacing;
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
  else if (keyCode==SHIFT) {//(keyCode==ALT) {
    shiftPressed = true;
  }
  else if (keyCode==CONTROL) {
    controlPressed = true;
  }
  else if (keyCode>=65 && keyCode<=90) {
    let saveindex = keyCode-65;
    if (shiftPressed) {//save tile into array
      saves[saveindex] = lasttile;
      console.log("saved "+key);
    }
    else {//recall the correct tile, if exists
      if (lasttile!=0) {
        if (saves[saveindex]!=0) {
          console.log("recall saves"+saveindex);
          typetile(saves[saveindex].copy());
          //tiles.push(new Tile(saves[saveindex], typex, typey, tempw, typeh));
        }
      }
    }
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
  else if (keyCode==8) {
    let ttile = tiles.pop();
    typex-=ttile.w;
  }
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




