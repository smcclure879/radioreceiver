// Copyright 2016-7 AyvexLLC Inc. All rights reserved.
//
// Started from google code, under this same license
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


//  e.g.     mySampleSaver = new SampleSaverC(1024*1024,"text","foo.txt");



function sampleSaverC(samplesToStore,mode,filePath){

    this.fileEntry=null;
    this.fileWriter=null;
    this.mode = mode;
    this.samplesToStore=samplesToStore;
    this.samplesWritten=0;
    this.filePath = filePath;

    //bugbug what??  showError('');
    var opt = {
		type: 'saveFile',
		suggestedName: filePath
    };
    var that = this;
    chrome.fileSystem.chooseEntry(opt, function(fileEntry) {
		that.fileEntry = fileEntry;
		fileEntry.createWriter(function(writer) {
		    writer.onerror = that.processError;
	    	that.fileWriter = writer;
		});
    });
}


//s = sampleBufffer;  //everywhere!!!
sampleSaverC.prototype.go = function (s) {
	if (this.fileWriter) {
    	this.handleOpen(s);
    } else {
		log("bugbug103x");
    	return; //ignore error
    }
}


sampleSaverC.prototype.processError = function(err) {
    console.log("err1158:"+err);
}


sampleSaverC.prototype.write = function(s) {
	var that = this;
    this.fileWriter.onwriteend=function(){
		that.samplesWritten += s.length * 2; //bugbug check fudge factor 2 bytes per sample??
		if (that.samplesWritten >= that.samplesToStore) {
	    	that.fileWriter.truncate(that.samplesToStore);
	    	that.state = 'closed';
		}
    }

    this.fileWriter.write(new Blob([s]));
}



sampleSaverC.prototype.handleOpen = function(s) {
	this.write(s);
}




sampleSaverC.prototype.useFileSamples = function() {
	var me = this;
    var opt = {
		type: 'openFile',
		suggestedName: this.filePath
    };


		//var reader = new FileReader();
		//reader.onload=function(evt) {
			//var fileBlob = reader.result;
			
			//bugbug needed???

    me.fileEntry.file(function(file){


		var reader = new FileReader();
		reader.addEventListener("loadend", function(evt) {
			// reader.result contains the contents of blob as a typed array
			var stuff = reader.result;
			waterfall.fftGraph(stuff,stuff.byteLength/80);  //bugbug fudge factor
		});
		reader.readAsArrayBuffer(file);

	});
}