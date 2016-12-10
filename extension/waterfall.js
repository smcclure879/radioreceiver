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

WaterfallC.prototype.process = function(buffer) {
    if (!buffer) return;
    if (buffer.byteLength<2) return;
    
    var bytes = new Uint8Array(buffer);
    
    this.canvasData.data.set( bytes.slice(0,80000),0 );
    this.set( bytes[0]%256, bytes[1]%256, { r:255, g:0, b:0  });
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


