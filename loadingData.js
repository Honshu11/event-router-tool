import * as YAML from './libraries/yaml/browser/dist/index.js';
yaml = YAML;

loadData();

async function loadData() {
    var fileName = 'browser.yaml';
    var response = await fetch(fileName);
    try {
        var payload = await response.text();
        var data = yaml.parse(payload);
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
            module.x = system.zoneLocations[zoneName].x + Math.random();
            module.y = system.zoneLocations[zoneName].y + Math.random();
            module.v = {
                x: 0.0,
                y: 0.0,
            };
            module.netForce = {
                x: 0.0,
                y: 0.0,
            };

            system.modules[moduleName] = module; //"flattening a tree" 
        })
    })
    requestAnimationFrame(tick);   
}

