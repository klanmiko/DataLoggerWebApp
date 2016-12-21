var fs = require('fs');
const readline = require('readline');
var Parser = require('../../serial/dynamicParser.js');
fs.readdir("intermediate",function(err,files){ // 'intermediate/*.csv' file format
    for(var i=0;i<files.length;i++)
    {
        
        var outputFileName = "output/"+files[i];
        var parser = new Parser({decodeStrings:false,stringOut:true});
        outputFileName = outputFileName.substring(0,outputFileName.length-3)+"json"; //removes.csv and adds .json
        parser.pipe(fs.createWriteStream(outputFileName));
        var rl = readline.createInterface({
            input:fs.createReadStream("intermediate/"+files[i])
        });
        //creates stream for asynchronous parsing
        rl.on('line',function(line){
            this.write(line);
            //this.write(line);
        }.bind(parser)); //bind the output file stream to 'this', cannot use 'files[i]' because it is out of scope
    }
});