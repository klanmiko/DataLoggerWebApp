var assert = require('assert');
module.exports = function(descriptor){
    assert.ok(descriptor.CAN_Id);
    assert.ok(descriptor.map);
    descriptor.map.forEach(function(value){
        assert.ok(value.length||value.length==0);
        assert.ok(value.offset||value.offset==0);
        assert.ok(value.length+value.offset<=64);
        assert.ok(value.dataType);
        if(value.dataType=='flag'||value.dataType=='state'){
            assert.ok(value.length%8==0);
            assert.ok(value.offset%8==0);
        }
        if(value.dataType=='array'){
            assert.ok(value.array);
            assert.ok(value.array.subLength);
            assert.ok(value.array.subDataType);
            assert.ok(value.array.subLength%8==0);
        }
    });
}