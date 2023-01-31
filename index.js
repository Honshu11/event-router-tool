document.addEventListener('click', function(event) {
    console.log(camera);
    console.log('x: ' + worldToScreenX(event.x));
    console.log('y: ' + worldToScreenY(event.y));    
});

//camera movement
document.addEventListener('mousemove', function(event) {
    if(event.buttons == 1) {
        camera.x -= event.movementX;
        camera.y -= event.movementY;
        console.log(JSON.stringify(event.movementX));
    }
})

var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

var width;
var height;
var moduleCard = {
    width: 200,
    height: 300,
    headerHeight: 50,
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

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;

}

window.addEventListener('resize', resize);
resize();

// var testData =  {
//     events: [
//         {
//             name: 'tankTemperature',
//             time: 5.0,
//             value: '23C',
//         },
//         {
//             name: 'tankTemperature',
//             time: 8.0,
//             value: '25C',
//         },
//         {
//             name: 'tankTemperature',
//             time: 10.0,
//             value: '28C',
//         },
//     ]
// }

function worldToScreenX(x) {
    return x - camera.x;
}


function worldToScreenY(y) {
    return y - camera.y;
}

function updateSpacing(moduleB, moduleA) {
    // var distance = Math.abs(moduleA.x - moduleB.x); //distance between two points (1 dimension)
    var horizontalDistance = moduleA.x - moduleB.x;
    var verticalDistance = moduleA.y - moduleB.y;
    var distance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    var theta = Math.atan2(verticalDistance, horizontalDistance);

    var r = distance - spacing; //representing distance
    var aMag = (forceConstant * moduleMass) / (r * r); //acceleration

    //updates velocity
    if(moduleA.x < moduleB.x && r > 0) {
        aMag *= -1;
    }

    if(moduleA.x < moduleB.x && r < 0) {
        aMag *= -1;
    }

    if(moduleA.x > moduleB.x && r < 0) {
        aMag *= -1;
    }
    
    if(moduleA.x > moduleB.x && r > 0) {
        aMag *= 1;
    }

    var a = {
        x: aMag * Math.cos(theta),
        y: aMag * Math.sin(theta),
    }

    //applies acceleration to velocity

    moduleA.v.x -= a.x;
    moduleA.v.y -= a.y;
    moduleB.v.x += a.x;
    moduleB.v.y += a.y;

    var speed = Math.sqrt(moduleA.v.x * moduleA.v.x + moduleA.v.y * moduleA.v.y);
    var angle = Math.atan2(moduleA.v.y, moduleA.v.x);

    if(speed > maxSpeed) {
        moduleA.v.x = maxSpeed * Math.cos(angle);
        moduleA.v.y = maxSpeed * Math.sin(angle);
    }

    if(speed < -maxSpeed) {
        moduleA.v.x =  -maxSpeed * Math.cos(angle);
        moduleA.v.y =  -maxSpeed * Math.sin(angle);
    }

    // if(moduleB.v.x > maxSpeed) {
    //     moduleB.v.x = maxSpeed;
    // }

    // if(moduleB.v.x < -maxSpeed) {
    //     moduleB.v.x = -maxSpeed;
    // }

    moduleA.x += moduleA.v.x;
    moduleA.y += moduleA.v.y;
    // moduleB.x += moduleB.v.x;
    // moduleB.y += moduleB.v.y;
}

function tick() {
    c.clearRect(0, 0, width, height);

    //if(Math.random() < 0.01) {
         //console.log(system);
    //}


    //c.fillRect(worldToScreen(100, 100).x, worldToScreen(100,100).y, 50, 50);
    //c.fillRect(worldToScreen(200, 200).x, worldToScreen(200,200).y, 150, 150);
    drawAllModules();
    callForEachSubscription(updateSpacing);

    
    requestAnimationFrame(tick);
}

//TODO: color coordinate the arrows to match accordingly to the spacing.
//TODO: Look into the physics of the modules
//TODO: debug grid, put on flag.


function drawModule(module, x, y) {
    var screenX = worldToScreenX(x);
    var screenY = worldToScreenY(y);
    
    c.strokeStyle = '#000';
    c.fillStyle = '#bbb4';
    c.font = '20px ariel';
    c.fillRect(screenX, screenY, moduleCard.width, moduleCard.height);
    c.strokeRect(screenX, screenY, moduleCard.width, moduleCard.height);
    c.strokeRect(screenX, screenY, moduleCard.width, moduleCard.headerHeight);
    c.fillStyle = '#000';
    c.fillText(module.name, screenX + 20, screenY + 20);
}

function drawSubscriberArrow(moduleA, moduleB) {
    var moduleAScreenX = worldToScreenX(moduleA.x);
    var moduleAScreenY = worldToScreenY(moduleA.y);
    var moduleBScreenX = worldToScreenX(moduleB.x);
    var moduleBScreenY = worldToScreenY(moduleB.y);
    //error handling
    if(moduleA === undefined) {
        throw new Error('Module A is undefined. (probably publisher is not in the module list.)');
    }

    if(moduleB === undefined) {
        throw new Error('Module B is undefined. (probably subscriber is not in the module list.)');
    }

    var arrowSize = 15;
    
    c.beginPath();
    c.moveTo(moduleAScreenX + moduleCard.width, moduleAScreenY + 100);
    c.lineTo(moduleBScreenX, moduleBScreenY + 100);
    c.lineTo(moduleBScreenX - arrowSize, moduleBScreenY + 100 - arrowSize);
    c.stroke();

    c.beginPath();
    c.moveTo(moduleBScreenX, moduleBScreenY + 100);
    c.lineTo(moduleBScreenX -arrowSize, moduleBScreenY + 100 + arrowSize);
    c.stroke();    
}

function drawAllModules() {
    Object.keys(system.modules).forEach(function(moduleName){
        var module = system.modules[moduleName];
        drawModule(module, module.x, module.y);
    })
    callForEachSubscription(drawSubscriberArrow);
}

function callForEachSubscription(callback) { 
    Object.keys(system.events).forEach(function(eventName) {
        var event = system.events[eventName];
        
        //* this code makes subscribers optional. Not sure if it should be optional.
        if(event.subscribers === undefined) {
            return;
        }

        event.subscribers.forEach(function(subscriberName) {
            //console.log(system);
            var subscriber = system.modules[subscriberName];
            var publisher = system.modules[event.publisher];

            //error handling below:

            if(subscriber === undefined) {
                throw new Error(`subscriber ${subscriberName} is not in module list.`);
            }

            if(publisher === undefined) {
                throw new Error(`publisher ${event.publisher} is not in module list.`);
            }
            
            callback(publisher, subscriber);   
        })
    })
}
