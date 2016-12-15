// Copyright 2016 Ayvex Light Industries LLC. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


function WaterfallC(canvas,radio) {
    if (!canvas)  {
      throw("err1214r: no canvas");
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvasData = this.ctx.createImageData(canvas.width, canvas.height);  //bugbug we won't support resize canvas for now!

    this.scrollOffset = 0;

    //bugbug needed??
    this.canvas.onload = function() {
        this.update();        
    }

    this.radio = radio;

    return this;
}


WaterfallC.prototype.set = function(x,y,color) {
    var index = (x + y * this.canvas.width) * 4;
    this.canvasData.data[index + 0] = color.r;
    this.canvasData.data[index + 1] = color.g;
    this.canvasData.data[index + 2] = color.b;
    this.canvasData.data[index + 3] = 255;    //we don't support transparency  
};


WaterfallC.prototype.update = function() {
    this.ctx.putImageData(this.canvasData,0,0);
};

WaterfallC.prototype.clear = function() {
  this.canvasData = this.ctx.createImageData(this.canvas.width, this.canvas.height);  //bugbug we won't support resize canvas for now!
}

//bugbug need different types of displays soon...
WaterfallC.prototype.processScope = function(IQ) {
    if (!IQ) return;
    var I = IQ[0];
    var Q = IQ[1];
    if (!I || I.byteLength<200) return;
    if (!Q || Q.byteLength<200) return;
    
    //oscilloscope graph
    var RED={ r:255, g:0, b:0 };
    var GREEN={r:0, g:255, b:0 };
    var BLUE={r:0,g:0,b:255};
    this.clear();
    var dup=1;
    for(var x = 0; x<this.canvas.width*dup; x++) {
      
      var y1 = I[x*dup]*30;
      this.set(Math.floor(x/dup),100+Math.floor(y1),RED);
      
      var y2 = Q[x*dup]*30;
      this.set(Math.floor(x/dup),130+Math.floor(y2),GREEN);

      var y = Math.floor();
      this.set(Math.floor(x/dup),20+Math.floor(Math.sqrt(y1*y1+y2*y2)),BLUE);
    }
    this.update();
}


WaterfallC.prototype.process = function(buffer) {
 
    return ; //for now skip the raw tuned samples

    if (!buffer) return;
    if (buffer.byteLength<200) return;


    //actual waterfall
    var bytes = new Uint8Array(buffer);
    var scrollIncrement=4*this.canvas.width;  //4 bytes per pixel
    this.scrollOffset+=scrollIncrement;
    if (this.scrollOffset>80000) 
      this.scrollOffset=0;
    this.canvasData.data.set( bytes.slice(0,4*scrollIncrement),this.scrollOffset );
    var scale = 256;



    //an indicator of signal phase and strength
    //bugbug need to sample better
    var x = this.canvas.width - bytes[100]/2;
    var y = this.canvas.height - bytes[102]/2;
    var c = { r:255, g:0, b:bytes[101] };
    this.set(x,y,c);



    //oscilloscope graph
    var RED={ r:255, g:0, b:0 };
    for(var x = 0; x<this.canvas.width; x++) {
	var y = Math.floor(bytes[x*16]/2)+50;
	this.set(x,y,RED);
    }






    this.update();
};


WaterfallC.prototype.selfTest = function() {
  var GREEN={ r:0, g:255, b:0 };

  for(var x=10; x<100; x++) {
    for(var y=10; y<100; y++) {
      this.set(x,y,GREEN);
    }
  }

  this.update();
};


