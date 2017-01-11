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

    this.sampleSaver = new sampleSaverC(1024*1024,"text","foo.txt");  //note: lazy file open

    this.scrollOffset = 0;

    //bugbug needed??
    this.canvas.onload = function() {
        this.update();
    }

    this.radio = radio;

    return this;
}


WaterfallC.prototype.graph = function(arrayOfComplexFloats) {
  var w=this.canvas.width;
  var h=this.canvas.height;
  
  
  var arr = arrayOfComplexFloats;  //2d array!!
  var size = arr.length;
  var ox=0;
  var toti=0;
  var totq=0;
  for(var ii=0; ii<size; ii++) {
    var x = Math.floor(ii/size * w);


    var sampi = arr[ii][0]/40;
    var sampq = arr[ii][1]/40;

    sampi = sampi*sampi;
    sampq = sampq*sampq;

    toti += sampi;
    totq += sampq;


    if (x!=ox) {
      var yi = Math.floor(h - toti/30-20);
      var yq = Math.floor(h - totq/30-50);
      this.set(ox,yi,{r:255,g:0,b:0});
      this.set(ox,yq,{r:0,g:200,b:100});
      toti=0;
      totq=0;
    }
    ox = x;
  }
  this.update();
}



WaterfallC.prototype.debugCode=function(evt) {
  //build a sine wave signal and FFT it and display (while waterfall otherwise off)

  var TwoPi = 6.28; //bugbug

  //fake duration = 1 second
  var freq = 5000;  // fake baseband
  var size = 1024*1024;
  var fakeSignal = new ArrayBuffer(size*2);  //I & Q samples

  
  //samples come out of radio interleaved, so we dup that functionality
  for(var ii = 0; ii<size; ii++) {
    var theta = TwoPi * freq * ii / size;
    fakeSignal[ii*2] = fakeSin(theta);
    fakeSignal[ii*2+1] = fakeCos(theta);
  }


  this.fftGraph(fakeSignal,size);
}


//expects signal to be interleaved IQ bytes, size = number of samples ( 1I + 1Q = 1sample )
WaterfallC.prototype.fftGraph=function(signal,size){

  //and the functionality of splitting them from dsp
  var IQ=iqSamplesFromUint8(signal); 


  var INTER_RATE = size;  //samples per second
  var outRate = size/128;  //samples per second


  //note.........
  // * @param {number} sampleRate The signal's sample rate.
  // * @param {number} halfAmplFreq The half-amplitude frequency in Hz.
  // * @param {number} length The filter kernel's length. Should be an odd number.
  var filterCoefs = getLowPassFIRCoeffs(INTER_RATE, 10000, 31);      // * @return {Float32Array} The FIR coefficients for the filter.
  var fftDown = new Downsampler(INTER_RATE, outRate, filterCoefs);

  var smallBufferI = fftDown.downsample(IQ[0]);
  //var smallBufferQ = fftDown.downsample(IQ[1]);  //bugbug
  //bugbug and need to convert the two into N*2 2d array

  smallBufferI = smallBufferI.slice(0,64*1024);

  //actual FFT, bugbug need to adjust it to take Q signals also
  var freqs = fft.fft(smallBufferI);    //,smallBufferQ);  

  this.graph(freqs);
}


function fakeSin(theta){return Math.floor(127*Math.sin(theta)+128);}
function fakeCos(theta){return Math.floor(127*Math.cos(theta)+128);}





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
WaterfallC.prototype.processScope = function(IQ,audioData) {

    return ;  //skip this otherwise good code for now...

  
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
    var dup=3;
    for(var x = 0; x<this.canvas.width*dup; x++) {
      var xx=Math.floor(x/dup);
      
      var y1 = I[x]*30;
      this.set(xx,30+Math.floor(y1),RED);
      
      var y2 = Q[x]*30;
      this.set(xx,50+Math.floor(y2),GREEN);

      //this.set(xx,20+Math.floor(Math.sqrt(y1*y1+y2*y2)),BLUE);
      if (!audioData) return;
      
      var y = 100+Math.floor(30*audioData[x]);
      this.set(xx,y,BLUE);
    }
    this.update();
}

WaterfallC.prototype.process = function(buffer) {
    //raw tuned samples

    if (!buffer) return;
    if (buffer.byteLength<200) return;

    this.sampleSaver.go(buffer);
    return;  //bugbug rest of this code isn't right yet'

    
    //var INTER_RATE = 48000;
    //var outRate = 1024;
    var INTER_RATE = 409600/2;  //samples per second
    var outRate = 48000;  //samples per second


    //note.........
    // * @param {number} sampleRate The signal's sample rate.
    // * @param {number} halfAmplFreq The half-amplitude frequency in Hz.
    // * @param {number} length The filter kernel's length. Should be an odd number.
    var filterCoefs = getLowPassFIRCoeffs(INTER_RATE, 10000, 41);      // * @return {Float32Array} The FIR coefficients for the filter.
    var fftDown = new Downsampler(INTER_RATE, outRate, filterCoefs);

    var smallBuffer = fftDown.downsample(buffer);//bugbug you are here ... this should be array, not array buffer


    //actual waterfall
    var bytes = new Uint8Array(smallBuffer);
    var freqs = fft.fft(bytes);

    var scrollIncrement=4*this.canvas.width;  //4 bytes per pixel
    this.scrollOffset+=scrollIncrement;
    if (this.scrollOffset>80000) 
      this.scrollOffset=0;
    this.canvasData.data.set( bytes.slice(0,4*scrollIncrement),this.scrollOffset );
    var scale = 256;


    //oscilloscope graph
    var RED={ r:255, g:0, b:0 };
    for(var x = 0; x<this.canvas.width; x++) {
	var y = Math.floor(freqs[x*16]/2)+50;
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


