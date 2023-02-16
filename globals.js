var system;

var debug = false;
var slowMo = true;


var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');



var width;
var height;
var moduleCard = {
    width: 100,
    height: 200,
    headerHeight: 25,
    headerFontSize: 20,
}
var spacing = 200;
var bounce = .01;

var maxSpeed = 5;
var minAcceleration = 0.3;
var moduleMass = 1.0;
var forceConstant = 1000;

var camera = {
    x: 0,
    y: 0,
}

var repulsiveStrength = 0;
var attractiveStrength = 100;
var zoneCenteringStrength = 100;