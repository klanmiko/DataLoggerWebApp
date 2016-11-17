var Converter = require("csvtojson").Converter;
var fs = require("fs"); 
var Parser = require("../../serial/dynamicParser.js");
fs.readdir("input",function(err,files){ //reads all the files in the input directory, files is an array of names
    for(var i=0;i<files.length;i++)
    {
        //add a header row naming the values for each column
        var string = fs.readFileSync("input/"+files[i]);
        if(string.length>0){
            string = string.toString();
            var can = string.substring(0,6);
            if(can!="CAN_ID") string = "CAN_ID,Timestamp,bit1,bit2,bit3,bit4,bit5,bit6,bit7,bit8\n"+string;
            fs.writeFileSync("input/"+files[i],string);
            var outputFileName = "output/"+files[i];
            
            var parser = new Parser({decodeStrings:false,stringOut:true});
            outputFileName = outputFileName.substring(0,outputFileName.length-3)+"out"; //removes.csv and adds .json
            var write = fs.createWriteStream(outputFileName);
            parser.pipe(write);
            //create a new instance of a converter for each file
            var converter = new Converter({});
            //nodejs piping magic
            var read =  fs.createReadStream("input/"+files[i]);
            read.on("end",function(){
                console.log("end");
                parser.end();
                write.end();
            });
            read.pipe(converter).pipe(parser).pipe(write);
        }
    }
    return;
});
