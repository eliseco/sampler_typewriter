
let img;
let typeh  = 60;
let typex = 1000;
let typey = 0;
let startx, starty, curx, cury=0;
let dragging = false;

let spacing = 2;

let tiles = [];//store tile images
let rects = [];
let pages = [];
let curpage = -1;

let imglist = ['assets/cosa_text2.jpg', 'assets/pines.jpg', 'assets/tiberisland.jpg'];
let pageimgs = [];
let testpage;

let controlPressed = false;

let lasttile = 0;

let saves = [26];

function preload() {
  //img = loadImage('assets/cosatext_1.jpg');
  //img = loadImage('assets/cosa_text2.jpg');
  //img = loadImage('assets/cosatext_3sm-1.jpg');
  for (let i=0;i<imglist.length;i++) {
    let tempimg = loadImage(imglist[i]);
    pageimgs.push(tempimg);
  }

 
}

function setup() {
  createCanvas(1600, 1400);
  //image(img, 0, 0);

  //testpage = new Page(img);
  //testpage.autofit(500, 500);

  for (let i=0;i<imglist.length;i++) {
    let tpage = new Page(pageimgs[i]);
    tpage.autofit(500, 500);
    pages.push(tpage);
    //let tempimg = loadImage(imglist[i]);
    //pageimgs.push(tempimg);
  }
  curpage = 0;
  for (let i=0;i<26;i++) {
    saves[i] = 0;
  }
}

function draw() {
  background(255);
  //testpage.display();
  pages[curpage].display();
  if (dragging) {
    stroke(255, 0, 0);
    noFill();
    rect(startx, starty,curx-startx, cury-starty);
  }
  for (let i=0;i<tiles.length;i++) {
    tiles[i].display();
  }
  for (let i=0;i<rects.length;i++) {
    rects[i].display();
  }
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
  rects.push(new Rectangle(startx, starty, curx-startx, cury-starty));
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
  typex+=ntile.w+spacing;
}

function keyPressed() {
  console.log(keyCode);
  if (keyCode == 13) {//return
    typex = 1000;
    typey+=typeh+spacing;
  }
  else if (keyCode>=48 && keyCode<=57) {
    let which = 9-(57-keyCode);
    console.log("switch to page "+which);
    if (pages.length>which) curpage = which;
  }
  else if (keyCode==CONTROL) {
    controlPressed = true;
  }
  else if (keyCode>=65 && keyCode<=90) {
    let saveindex = keyCode-65;
    if (controlPressed) {//save tile into array
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
}

function keyReleased() {
  if (keyCode==CONTROL) {
    controlPressed = false;
  }
}


class Tile {
  constructor(i, x, y, w, h) {
    this.img = i;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  display() {
    image(this.img, this.x, this.y, this.w, this.h);
  }

  copy() {
    let newtile = new Tile(this.img, this.x, this.y, this.w, this.h);
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
    let aspect = this.img.width/this.img.height;
    let targetaspect = w/h;
    let fitwidth = true;
    //let targetw = this.w;
    //let targeth = this.h;//gonna overwrite these anyway
    console.log("aspect: "+aspect+", targetaspect "+targetaspect);
    if (aspect<=1) {
      if (targetaspect<1) fitwidth = false;
    }
    if (fitwidth) {
      this.scale = w/this.img.width;
    }
    else {
      this.scale = h/this.img.height;
    }
    this.w = this.scale*this.img.width;
    this.h = this.scale*this.img.height;

    console.log("autofit: "+fitwidth+" to "+this.w+" "+this.h+", scale "+this.scale);

  }

  extract(x, y, w, h) {//accepts screen coordinates and returns corresponding image section in full res
    let subimg = this.img.get(x/this.scale, y/this.scale, w/this.scale, h/this.scale);
    return subimg;
  }

  display() {
    image(this.img, 0, 0, this.w, this.h);
  }

}




