loadData();

async function loadData() {
    var fileName = 'browser.json';
    var response = await fetch(fileName);
    try {
        var data = await response.json();
    } catch(error) {
        if(error instanceof SyntaxError) {
            throw new SyntaxError(`${fileName} is not valid JSON.`);
        }
    }
    
    system = data;
    system.zones = system.modules;
    system.modules = {};

    Object.entries(system.zones).forEach(function([zoneName, zone]) {
        zone["_name"] = zoneName;
        Object.entries(zone).forEach(function([moduleName, module]) {
            if(moduleName.startsWith('_')) {
                return;
            }
            //console.log(moduleName, module, zoneName, zone);
            module.name = moduleName;
            //module.x = Math.random() * width;
            //module.y = Math.random() * height;
            module.x = system.zoneLocations[zoneName].x;
            module.y = system.zoneLocations[zoneName].y;
            module.v = {
                x: 0.0,
                y: 0.0,
            };
            system.modules[moduleName] = module; //"flattening a tree" 
        })
        
    })
       
    requestAnimationFrame(tick);   
}

