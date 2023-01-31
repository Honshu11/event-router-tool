var system = {
    modules: {
        temperatureSensor: {
            name: 'temperatureSensor',
            devices: ['termocouple'],
            publishedEvent: 'tankTemperature',
        },
        fanControl: {
            name: 'fanControl',
            devices: ['fan'],
        },

        alarmSystem: {
            name: 'alarmSystem',
            devices: ['alarm'], 
        },

        resetButton: {
            name: 'resetButton',
            devices: ['button'],
        },
    },

    events: {
        tankTemperature: {
            publisher: 'temperatureSensor',
            subscribers: ['fanControl'],
        },

        resetButton: {
            publisher: 'resetButton',
            subscribers: ['alarmSystem', 'fanControl'],
        },

        fanSpeed: {
            publisher: 'fanControl',
            subscribers: ['alarmSystem'],
        },

        fanTorque: {
            publisher: 'fanControl',
            subscribers: ['alarmSystem'],
        },
    }
}
