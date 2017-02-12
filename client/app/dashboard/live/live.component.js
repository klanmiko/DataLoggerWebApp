'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './live.routes';
import c3 from 'c3';

class Buffer {
  constructor(ms, keys, callback) {
    this.ms = ms;
    this.buffer = [];
    this.callback = callback;
    this.keys = keys;
  }

  push(point) {
    var self = this;
    if (point instanceof Object) {
      if (!this.start) this.start = point.Timestamp;
      if (point.Timestamp - this.start < this.ms) {
        this.buffer.push(point);
      }
      else {
        var out = new Object();
        let seconds = Math.floor(this.start/(1000) % 60);
        let minutes = Math.floor(this.start/(1000*60));
        out.Timestamp = `${minutes}.${seconds}`;
        out.CAN_Id = this.buffer[0].CAN_Id;
        this.keys.forEach(function (key) {
          if (self.buffer[0][key] instanceof Array) {
            var sums = [];
            for (var i = 0; i < self.buffer[0][key].length; i++) {
              sums.push(0);
              self.buffer.forEach(function (value) {
                sums[i] += value[key][i];
              });
            }
            for (var i = 0; i < sums.length; i++) {
              sums[i] = sums[i] / self.buffer.length;
            }
            out[key] = sums;
          }
          else {
            out[key] = 0;
            self.buffer.forEach(function (value) {
              out[key] += value[key];
            });
            out[key] /= self.buffer.length;
          }
        });

        this.start = undefined;
        this.buffer = [];
        this.callback(out);
      }
    }
  }
}

var tb_initialPointRemoved = false;
var tb_count = 0;
var tb_chart;

var temp_initialPointRemoved = false;
var temp_count = 0;
var temp_chart;

var batt_initialPointRemoved = false;
var batt_count = 0;
var batt_chart;

var state_initialPointRemoved = false;
var state_count = 0;
var state_chart;


function createGraph(CAN_Id,descriptionArr,data)
{
  var bufferInfo = new Object();
  bufferInfo.buffer = new Buffer(1000, descriptionArr, plotNew);
  bufferInfo.count = 0;
  bufferInfo.firstPointRemoved = false;
  genericsBufferMap.set(CAN_Id, bufferInfo);

  var graphData = new Object();
  graphData.CAN_Id = CAN_Id;
  graphData.descriptionArr = descriptionArr;
  graphData.graphFormat = data;
  graphRenderQueue.push(graphData);
}

function plotNew(newData) {
  if (newData.CAN_Id == 512 || newData.CAN_Id == 513) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.throttle) object.throttle = newData.throttle / 0x7FF;
    if (newData.brake) object.brake = newData.brake / 0x7FF;
    if (tb_count < 50 && tb_initialPointRemoved) tb_chart.flow({
      json: object,
      length: 0
    });
    else {
      tb_chart.flow({
        json: object
      });
      tb_initialPointRemoved = true;
    }
    tb_count++;
  }
  else if (newData.CAN_Id == 1574) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.state) object.state = newData.state;

    if (state_count < 50 && state_initialPointRemoved) state_chart.flow({
      json: object,
      length: 0
    });
    else {
      state_chart.flow({
        json: object
      });
      state_initialPointRemoved = true;
    }
    state_count++;
  }
  else if (newData.CAN_Id == 904) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.min_voltage != undefined) object.min_voltage = newData.min_voltage;
    if (newData.max_voltage != undefined) object.max_voltage = newData.max_voltage;
    if (newData.pack_voltage != undefined) object.pack_voltage = newData.pack_voltage;
    if (batt_count < 50 && batt_initialPointRemoved) batt_chart.flow({
      json: object,
      length: 0
    });
    else {
      batt_chart.flow({
        json: object
      });
      batt_initialPointRemoved = true;
    }
    batt_count++;
  }
  else if (newData.CAN_Id == 1160) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.temp_array) {
      for (var i = 0; i < newData.temp_array.length; i++)
        object["temp" + i] = newData.temp_array[i];
    }
    if (temp_count < 50 && temp_initialPointRemoved) temp_chart.flow({
      json: object,
      length: 0
    });
    else {
      temp_chart.flow({
        json: object
      });
      temp_initialPointRemoved = true;
    }
    temp_count++;
  }
  else {
    if (genericsGraphMap.get(newData.CAN_Id)) {
      var graph = genericsGraphMap.get(newData.CAN_Id);
      var canId = newData.CAN_Id;
      delete newData.CAN_Id;
      if (genericsBufferMap.get(canId).count < 50 && genericsBufferMap.get(canId).firstPointRemoved) graph.flow({
        json: newData,
        length: 0
      });
      else {
        graph.flow({
          json: newData
        });
        genericsBufferMap.get(canId).firstPointRemoved = true;
      }
      genericsBufferMap.get(canId).count++;
    }
  }
}
var genericsGraphMap = new Map();
var genericsBufferMap = new Map();
var genericsIds = [];
var graphRenderQueue = [];

export class LiveComponent {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    this.socket = socket;
    this.throttleBuffer = new Buffer(1000, ['throttle'], plotNew);
    this.brakeBuffer = new Buffer(1000, ['brake'], plotNew);
    this.tempBuffer = new Buffer(1000, ['temp_array'], plotNew);
    this.voltageBuffer = new Buffer(1000, ['min_voltage', 'max_voltage', 'pack_voltage'], plotNew);
    this.carStateBuffer = new Buffer(1000,['state'],plotNew);

    $scope.genericsGraphMap = genericsGraphMap;
    $scope.genericsBufferMap = genericsBufferMap;
    $scope.genericsIds = genericsIds;
    tb_chart = c3.generate({
      bindto: '#throttle-brake-chart',
      data: {
        /*json: [
          {Timestamp: 0, throttle: 0},
          {Timestamp: 0, brake: 0}
        ],*/
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['throttle', 'brake']
        },
        names: {
          'throttle': 'Throttle',
          'brake': 'Brake'
        }
      },
      axis: {
        y: {
          tick: {
            format: d3.format("%")
          }
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true,
        }
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      size: {
        height: 600
      }
    });
    temp_chart = c3.generate({
      bindto: '#temp-chart',
      data: {
        /*json: [
          {Timestamp: 0, temp0: 0, temp1: 0, temp2: 0, temp3: 0, temp4: 0, temp5: 0}
        ],*/
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['temp0', 'temp1', 'temp2', 'temp3', 'temp4', 'temp5']
        },
        names: {
          'temp0': 'Temperature 1',
          'temp1': 'Temperature 2',
          'temp2': 'Temperature 3',
          'temp3': 'Temperature 4',
          'temp4': 'Temperature 5',
          'temp5': 'Temperature 6',

        }
      },
      axis: {
        y: {
          tick: {
            format: d3.format(".3")
          }
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true,
        }
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      grid: {
        y: {
          lines: [
            {value: 80, text: 'Threshold'}
          ]
        }
      },
      size: {
        height: 600
      }
    });
    batt_chart = c3.generate({
      bindto: '#battery-chart',
      data: {
        /*json: [
          {Timestamp: 0, min_voltage: 0, max_voltage: 0, pack_voltage: 0}
        ],*/
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['min_voltage', 'max_voltage', 'pack_voltage']
        },
        names: {
          'min_voltage': 'Min Voltage',
          'max_voltage': 'Max Voltage',
          'pack_voltage': 'Pack Voltage'
        }
      },
      axis: {
        y: {
          tick: {
            format: d3.format(".3")
          }
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true,
        }
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      size: {
        height: 600
      }
    });
    state_chart = c3.generate({
      bindto: '#state-chart',
      data: {
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['state']
        },
        names: {
          'state': 'State'
        },
        types: {
          state: 'step'
        }
      },
      axis: {
        y: {
          max: 5,
          min: 0,
          tick: {
            format: function(d){
              switch (d)
              {
                case 0:
                  return "Startup";
                case 1:
                  return "LV";
                case 2:
                  return "Precharging";
                case 3:
                  return "HV Enabled";
                case 4:
                  return "Drive";
                case 5:
                  return "Fault";
              }
            }
          }
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true,
        }
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      size: {
        height: 600
      }
    });


    $scope.$on('updateGraphs', function () {
      console.log("Creating graphs");
      graphRenderQueue.forEach(function (graph) {
        genericsGraphMap.set(graph.CAN_Id, c3.generate({
          bindto: '#can' + graph.CAN_Id,
          data: {
            json: [],
            xFormat: '%M.%S',
            keys: {
              x: 'Timestamp',
              value: graph.descriptionArr
            }
          },
          axis: {
            y: {
              tick: {
                format: d3.format(".3")
              }
            },
            x: {
              type: 'timeseries',
              tick: {
                format: '%M:%S'
              },
              culling:true,
            }
          },
          transition: {
            duration: 0
          },
          subchart: {
            show: true
          },
          size: {
            height: 600
          }
        }));
      });
      graphRenderQueue = [];
    });

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('temp');
      socket.unsyncUpdates('car');
      socket.unsyncUpdates('bms');
      tb_initialPointRemoved = false;
      tb_count = 0;
      temp_initialPointRemoved = false;
      temp_count = 0;
      batt_initialPointRemoved = false;
      batt_count = 0;
      state_initialPointRemoved = false;
      state_count = 0;
      genericsBufferMap.clear();
      genericsGraphMap.clear();
      delete $scope.genericsIds;

    });
  }

  $onInit() {
    this.socket.syncUpdates('car', function (data) {
      if (data) {
        if (data.CAN_Id == 512) this.throttleBuffer.push(data);
        else if (data.CAN_Id == 513) this.brakeBuffer.push(data);
        else if (data.CAN_Id == 1574) this.carStateBuffer.push(data);
      }
    }.bind(this));

    this.socket.syncUpdates('temp', function (data) {
      if (data) {
        this.tempBuffer.push(data)
      }
    }.bind(this));

    this.socket.syncUpdates('bms', function (data) {
      if (data) {
        if (data.CAN_Id == 904) {
          this.voltageBuffer.push(data);
        }
        if (data.CAN_Id == 392){

        }
      }
    }.bind(this));

    this.socket.syncUpdates('data', function (data) {
      if (data && data.generics) {
        var descriptionArr = [];
        var simpleVal = new Object();

        simpleVal.Timestamp = data.Timestamp;
        simpleVal.CAN_Id = data.CAN_Id;

        data.generics.forEach(function (generic) {
          if (generic.dataType == 'decimal') {
            simpleVal[generic.description] = generic.value;
            descriptionArr.push(generic.description);
          }
          else if (generic.dataType == 'array' && generic.value instanceof Array) {
            descriptionArr.push(generic.description);
            for (var i = 0; i < generic.length; i++)
              simpleVal[generic.description + i] = generic.value[i];
          }
        });
        if (genericsBufferMap.get(data.CAN_Id))//can id already exists
        {
          genericsBufferMap.get(data.CAN_Id).buffer.push(simpleVal);
        }
        else {
          if( angular.element(document.querySelector('#can'+data.CAN_Id)).length ) {
            console.log("div already exists");
          }
          else {
            genericsIds.push(data.CAN_Id);
          }

          createGraph(data.CAN_ID,descriptionArr,simpleVal);

          var bufferInfo = new Object();
          bufferInfo.buffer = new Buffer(1000, descriptionArr, plotNew);
          bufferInfo.count = 0;
          bufferInfo.firstPointRemoved = false;
          genericsBufferMap.set(data.CAN_Id, bufferInfo);

          var graphData = new Object();
          graphData.CAN_Id = data.CAN_Id;
          graphData.descriptionArr = descriptionArr;
          graphData.graphFormat = simpleVal;
          graphRenderQueue.push(graphData);
        }
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.live', [uiRouter])
  .config(routes)
  .directive('onFinishRender', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit(attr.onFinishRender);
          });
        }
      }
    }
  })
  .component('live', {
    template: require('./live.html'),
    controller: LiveComponent
  })
  .name;
