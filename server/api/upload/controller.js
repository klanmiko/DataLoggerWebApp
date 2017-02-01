var fs = require('fs');
var csv = require('csvtojson');
var Parser = require('../../serial/dynamicParser.js');
module.exports = function index(req,res){
    let file = req.file;
    let parser = new Parser();
    let array = [];
    parser.on('data',function(data){
        array.push(JSON.parse(data));
    });
    let stream = fs.createReadStream(file.path);
    let headerSet = false;
    csv()
    .fromStream(stream)
    .on('csv',(csvRow)=>{
        csvRow.pop();
        if(!headerSet){
            res.status(200);
            headerSet = true;
        }
        csvRow[0] = parseInt(csvRow[0]);
        csvRow[1] = parseInt(csvRow[1]);
        for(let i=2; i<csvRow.length; i++){
            csvRow[i] = parseInt(csvRow[i],16);
        }
        parser.write(JSON.stringify(csvRow));
        // csvRow is an array
    })
    .on('done',(error)=>{
        if(error) console.error(error);
        res.send(array);
    })
}