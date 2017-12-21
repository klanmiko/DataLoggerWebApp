var database;
var activeCallback;

function sort(collections){
  collections.sort(function(a,b){
    return -a.localeCompare(b);
  });
}
function quicksort(collections,low,high){
  if(low<high){
    let pivot = collections[high];
    let i = low;
    for(var j = low; j<high;j++){
      if(collections[j].localeCompare(pivot)>-1){
        let temp = collections[j];
        collections[j] = collections[i];
        collections[i] = temp;
        i=i+1;
      }
    }
    let swap = collections[high];
    collections[high] = collections[i];
    collections[i] = swap;
    quicksort(collections,low,i-1);
    quicksort(collections,i+1,high);
  }
}

export function list(req,res){
  var collections = [];
  res.status(200).send(collections);
}
export function download(req,res){
  var name = req.params.collection;
  var fileType = req.params.fileType;
  if(fileType=="json") {
    res.attachment(`${name}.json`);
  }
  else if(fileType=="csv") res.attachment(`${name}.csv`);
  else{
    res.status(401).end();
    return;
  }
  res.status(200).send();
}
export function setActive(callback) {
    activeCallback = callback;
}
export function deleteCollection(req,res){
    var name = req.params.collection;
    res.sendStatus(200);
}
export function printData(req,res){
    var start;
    var end;
    var name = req.params.collection;
    if(req.query.start) start = parseInt(req.query.start);
    if(req.query.end) end = parseInt(req.query.end);
    elements = [];
    res.status(200).send(elements);
}