
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

function requestAnimationFrameSlowMoDebug() {
    if(!slowMo){
        requestAnimationFrame(tick);
    } else {
        setTimeout(tick, 100);
    }
}

function worldToScreenX(x) {
    return x - camera.x;
}

function worldToScreenY(y) {
    return y - camera.y;
}

function calculateModuleForce(module, otherModules) {
    module.netForce.x = 0;
    module.netForce.y = 0;
    otherModules.forEach(function otherModulesLoop(otherModule) {
        var distanceBetweenModules = distance(module, otherModule);
         //referencing to local function scope.
        if(distanceBetweenModules === 0) {
            throw new Error('distance between modules is 0.');
        }

        if(!Number.isFinite(distanceBetweenModules)) {
            throw new Error('distance between modules is infinity, NaN, or the wrong type.' + distanceBetweenModules);
        }

        var force = repulsiveStrength / (distanceBetweenModules ** 2);

        if(!Number.isFinite(force)) {
            throw new Error('force is infinity, NaN, or the wrong type.' + force);
        }

        //console.log(`${module.name} ${otherModule.name} ${force} force == distanceBetween ${distanceBetweenModules}`);
        
        var angleBetweenModules = angleBetween(module, otherModule);
        //add to modules force total
        module.netForce.x += force * Math.cos(angleBetweenModules);
        //console.log(module.netForce.x);
        module.netForce.y += force * Math.sin(angleBetweenModules);
        //console.log(module.netForce.y);
    })

    callForEachSubscription(function calcAttractiveForce(otherModule) {
        var distanceBetweenModules = distance(module, otherModule); 

        if(distanceBetweenModules === 0) {
            throw new Error(`distanceBetweenModules is 0. ${module.name} ${otherModule.name}`);
        }
    
        if(!Number.isFinite(distanceBetweenModules)) {
            throw new Error(`distanceBetweenModules is infinity, NaN, or the wrong data type ${distanceBetweenModules}`);
        }
    
        var force = attractiveStrength / (distanceBetweenModules ** 2);
    
        if(!Number.isFinite(force)) {
            throw new Error(`force is infinity, NaN, or the wrong data type ${force}`);
        }

        var angleBetweenModules = angleBetween(module, otherModule);
        //add to modules force total
        module.netForce.x += force * Math.cos(angleBetweenModules);
        module.netForce.y += force * Math.sin(angleBetweenModules);
    }, module);

    //console.log(module.netForce);
    
    //TODO: calculate zone attractive force using verticalness.
        // add to modules force total
}

function distance(moduleA, moduleB) {
    var horizontalDistance = moduleA.x - moduleB.x;
    var verticalDistance = moduleA.y - moduleB.y;
    return Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
}

function angleBetween(moduleA, moduleB) {
    var horizontalDistance = moduleA.x - moduleB.x;
    var verticalDistance = moduleA.y - moduleB.y;
    return Math.atan2(verticalDistance, horizontalDistance);
}

function updateVelocity(module) {
    module.v.x += module.netForce.x;
    module.v.y += module.netForce.y;
}

function applyMaxVelocity(moduleA) {
    var speed = Math.sqrt(moduleA.v.x * moduleA.v.x + moduleA.v.y * moduleA.v.y);
    var angle = Math.atan2(moduleA.v.y, moduleA.v.x);

    if(speed > maxSpeed) {
        moduleA.v.x = maxSpeed * Math.cos(angle);
        moduleA.v.y = maxSpeed * Math.sin(angle);
    }

    // if(speed < -maxSpeed) {
    //     moduleA.v.x =  -maxSpeed * Math.cos(angle);
    //     moduleA.v.y =  -maxSpeed * Math.sin(angle);
    // }
}

function updatePosition(module) {
    module.x += module.v.x;
    module.y += module.v.y;   
}

function applyModuleForce(module) {
    updateVelocity(module);
    applyMaxVelocity(module);
    updatePosition(module);
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

function calculateForces() {
    Object.values(system.modules).forEach(function(module) {
        var otherModules = Object.values(system.modules).filter(function(otherModule) {
            return module != otherModule;    
        })
        calculateModuleForce(module, otherModules);
    })
}

function applyForces() {
    Object.values(system.modules).forEach(function(module){
        applyModuleForce(module);
    })
}

function tick() {
    c.clearRect(0, 0, width, height);

    calculateForces();
    applyForces();
    drawAllModules();

    requestAnimationFrameSlowMoDebug();
}

//TODO: Look into the physics of the modules.
//TODO: debug grid, put on flag.


function drawModule(module, x, y) {
    var screenX = worldToScreenX(x);
    var screenY = worldToScreenY(y);
    
    c.strokeStyle = '#000';
    c.fillStyle = '#bbb4';
    c.font = `${moduleCard.headerFontSize}px Ariel`;
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
    c.lineTo(moduleBScreenX - arrowSize, moduleBScreenY + 100 + arrowSize);
    c.stroke();    
}

function drawAllModules() {
    Object.keys(system.modules).forEach(function(moduleName){
        var module = system.modules[moduleName];
        drawModule(module, module.x, module.y);
    })
    callForEachSubscription(drawSubscriberArrow);
}

function callForEachSubscription(callback, module) { 
    // system events is being referenced in loadingData.js on line 14-16;
    Object.keys(system.events).forEach(function eventLoop(eventName) {
        var event = system.events[eventName];
        
        //* this code makes subscribers optional. Not sure if it should be optional.
        if(event.subscribers === undefined) {
            return;
        }

        event.subscribers.forEach(function subscriberLoop(subscriberName) {
            //console.log(system);
            var subscriber = system.modules[subscriberName];
            var publisher = system.modules[event.publisher];

            //way to create an optional param.
            if(module !== null && publisher == module) {
                return;
            }

            //error handling below:
            if(subscriber === undefined) {
                throw new Error(`subscriber ${subscriberName} is not in module list.`);
            }

            if(publisher === undefined) {
                throw new Error(`publisher ${event.publisher} is not in module list.`);
            }

            if(publisher.name == subscriber.name) {
                throw new Error(`subscribed to own event ${publisher} >> ${subscriber}`);
            }
            
            callback(publisher, subscriber);   
        })
    })
}
