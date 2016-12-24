// Copyright 2014 Google Inc. All rights reserved.
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

//major modifications by ayvex also under copyright, and goverened by this license, by ayvexLLC 2016-2017


/**
 * Classes to save a file of raw samples 
 *
 * The FileSystem API doesn't buffer writes, so this class implements just waits 
 * and writes everything at the end (when enough samples acquired)
 * @param {FileEntry} fileEntry An entry for the output file.
 * @constructor
 */
//  e.g.     mySampleSaver = new SampleSaverC(1024*1024,"text","foo.txt");
function sampleSaverC(samplesToStore,mode,filePath){
    //function SaverC(fileEntry) {

    this.fileEntry=null;
    this.fileWriter=null;
    this.mode = mode;
    this.samplesToStore=samplesToStore;
    this.samplesWritten=0;
    this.filePath = filePath;
    this.state = "new"; // new-->opened/writing-->closed  or error:details
}


//s = sampleBufffer;  //everywhere!!!
sampleSaverC.prototype.go = function (s) {
    switch (this.state) {
    case 'new': this.handleNew(s); break;
    case 'opened': this.handleOpen(s); break;
    case 'closed': this.handleClosed(s); break;
    default: return; //ignore error
    }
}


sampleSaverC.prototype.processError = function(err) {
    console.log("err1158:"+err);
}

sampleSaverC.prototype.initFileWriter = function(filePath,cb) {

    if (this.fileEntry) 
	return fileEntry;
  
    //bugbug what??  showError('');
    var opt = {
	type: 'saveFile',
	suggestedName: filePath
    };
    chrome.fileSystem.chooseEntry(opt, function(fileEntry) {
	this.fileEntry = fileEntry;
	fileEntry.createWriter(function(writer) {
	    writer.onerror = this.processError;
	    this.fileWriter = writer;
	    this.state = 'opened';
	    cb();
	});
    });
}



sampleSaverC.prototype.handleNew = function(s) {
    this.initFileWriter(this.filePath,function(){
	this.go(s);	
    });
}


sampleSaverC.prototype.handleOpen = function(s) {
    if (this.state != 'opened') 
	return;

    this.write(s);
}

sampleSaverC.prototype.write = function(s,cb) {
    this.fileWriter.onwriteend=function(){
	this.samplesWritten += s.length * 2; //bugbug check fudge factor 2 bytes per sample??
	if (this.samplesWritten >= this.samplesToStore) {
	    this.fileWriter.truncate(this.samplesToStore);
	    this.state = 'closed';
	}
	if (cb) 
	    cb();
    }


    this.fileWriter.write(new Blob([s]));
}



