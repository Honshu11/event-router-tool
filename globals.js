var system;

var debug = false;
//var debug = true;
var slowMo = true;
var pause = false;
var yaml;


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

var zoom = 0.35;

var repulsiveStrength = 1e6; //1e11;  
var attractiveStrength = 1e4; //1e9;
var zoneCenteringStrength = 0.1;