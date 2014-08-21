var extend = function (Ancestor, properties) {
    var Descendant = function () {
        if (this.init instanceof Function)
            this.init.apply(this, arguments);
    };
    Descendant.prototype = Object.create(Ancestor.prototype);
    if (properties)
        for (var property in properties)
            Descendant.prototype[property] = properties[property];
    Descendant.prototype.constructor = Descendant;
    Descendant.extend = function (properties) {
        return extend(this, properties);
    };
    return Descendant;
};

var abstractMethod = function () {
    throw new SyntaxError("Tried to call an abstract method.");
};
var abstractInit = function () {
    throw new SyntaxError("Tried to instantiate an abstract class.");
};

var Class = extend(Object, {
    init: abstractInit
});
Class.abstractInit = abstractInit;
Class.abstractMethod = abstractMethod;


var Sequence = Class.extend({
    initial: undefined,
    state: undefined,
    generator: undefined,
    init: function (config) {
        this.state = config.initial;
        this.generator = config.generator;
    },
    get: function () {
        return this.state;
    },
    next: function () {
        var args = [this.state];
        args.push.apply(args, arguments);
        this.state = this.generator.apply(this, args);
        return this.get();
    },
    wrapper: function () {
        var store = [];
        store.push.apply(store, arguments);
        return function () {
            var args = [];
            args.push.apply(args, store);
            args.push.apply(args, arguments);
            return this.next.apply(this, args);
        }.bind(this);
    }
});

var uniqueId = new Sequence({
    generator: function (previousId) {
        return ++previousId;
    },
    initial: 0
}).wrapper();

var Message = Class.extend({
    data: undefined,
    init: function (data) {
        this.data = data;
    }
});

var Component = Class.extend({
    ports: undefined,
    init: function () {
        this.id = uniqueId();
        this.ports = {};
    }
});

var Port = Class.extend({
    id: undefined,
    component: undefined,
    name: undefined,
    connections: undefined,
    init: function (config) {
        if (this.constructor === Port)
            abstractInit();
        this.id = uniqueId();
        this.connections = {};
        if (!config)
            throw new Error("Invalid arguments: config is required.");
        if (!(config.component))
            throw new Error("Invalid arguments: config.component is required.");
        if (!(config.component instanceof Component))
            throw new Error("Invalid arguments: config.component, Component required.");
        this.component = config.component;
        if (typeof(config.name) != "string")
            throw  new Error("Invalid arguments: config.name, String required.");
        this.name = config.name;
    },
    connect: function (port) {
        if (!(port instanceof Port))
            throw new Error("Invalid arguments: port, Port required.");
        if (this.isConnected(port))
            return;
        this.connections[port.id] = port;
        if (!port.isConnected(this))
            port.connect(this);
    },
    disconnect: function (port) {
        if (!(port instanceof Port))
            throw new Error("Invalid arguments: port, Port required.");
        if (this.isConnected(port))
            delete(this.connections[port.id]);
        if (port.isConnected(this))
            port.disconnect(this);
    },
    isConnected: function (port) {
        if (!(port instanceof Port))
            throw new Error("Invalid arguments: port, Port required.");
        return (port.id in this.connections);
    },
    relay: abstractMethod
});

var InputPort = Port.extend({
    callback: undefined,
    context: undefined,
    init: function (config) {
        Port.prototype.init.apply(this, arguments);
        if (!(config.callback instanceof Function))
            throw new Error("Invalid arguments: config.callback, Function required.");
        this.callback = config.callback;
        this.context = config.context;
    },
    connect: function (port) {
        if (!(port instanceof OutputPort))
            throw new Error("Invalid argument: port, OutputPort required.");
        Port.prototype.connect.apply(this, arguments);
    },
    relay: function (message) {
        if (!(message instanceof Message))
            throw new Error("Invalid argument: message, Message required.");
        this.callback.call(this.context, message);
    }
});

var OutputPort = Port.extend({
    connect: function (port) {
        if (!(port instanceof InputPort))
            throw new Error("Invalid argument: port, InputPort required.");
        Port.prototype.connect.apply(this, arguments);
    },
    relay: function (message) {
        if (!(message instanceof Message))
            throw new Error("Invalid argument: message, Message required.");
        for (var id in this.connections) {
            var input = this.connections[id];
            input.relay(message);
        }
    }
});

var Publisher = Component.extend({
    init: function () {
        Component.prototype.init.apply(this, arguments);
        this.ports.stdout = new OutputPort({
            component: this,
            name: "stdout"
        });
    },
    publish: function () {
        var data = [].slice.apply(arguments);
        var message = new Message(data);
        this.ports.stdout.relay(message);
    },
    connect: function (component) {
        var input = this.findInputPort(component);
        this.ports.stdout.connect(input);
    },
    disconnect: function (component) {
        var input = this.findInputPort(component);
        this.ports.stdout.disconnect(input);
    },
    findInputPort: function (component) {
        if (!(component instanceof Component))
            throw new Error("Invalid argument: component, Component required.");
        var input = component.ports.stdin;
        if (!(input instanceof InputPort))
            throw new Error("Cannot find input port on the given component.");
        return input;
    }
});

var Subscriber = Component.extend({
    init: function (config) {
        Component.prototype.init.apply(this, arguments);
        this.ports.stdin = new InputPort({
            component: this,
            name: "stdin",
            callback: this.notifyCallback,
            context: this
        });
        if (config)
            this.update(config);
    },
    update: function (config) {
        if (!(config.callback instanceof Function))
            throw new Error("Invalid argument: config.callback, Function required.");
        this.callback = config.callback;
        this.context = config.context;
    },
    notifyCallback: function (message) {
        this.callback.apply(this.context, message.data);
    }
});


var Traverser = Publisher.extend({
    traverse: function (component) {
        if (!(component instanceof Component))
            throw new Error("Invalid argument: origin, Component required.");
        this.traverseNext([component], {});
    },
    traverseNext: function (queue, visited) {
        var component = queue.shift();
        if (!component)
            return;
        if (component.id in visited)
            return this.traverseNext(queue, visited);
        this.publish(Traverser.COMPONENT, component);
        for (var portName in component.ports) {
            var port = component.ports[portName];
            if (port.id in visited)
                continue;
            this.publish(Traverser.PORT, port);
            for (var remotePortId in port.connections) {
                var remotePort = port.connections[remotePortId];
                if (!(remotePort.id in visited)) {
                    queue.push(remotePort.component);
                    continue;
                }
                var output = port;
                var input = remotePort;
                if (port instanceof InputPort) {
                    output = remotePort;
                    input = port;
                }
                var connectionId = output.id + "," + input.id;
                if (connectionId in visited)
                    continue;
                visited[connectionId] = true;
                this.publish(Traverser.CONNECTION, output, input);
            }
            visited[port.id] = true;
        }
        visited[component.id] = true;
        return this.traverseNext(queue, visited);
    }
});
Traverser.COMPONENT = 0;
Traverser.PORT = 1;
Traverser.CONNECTION = 2;

var dflo = {
    Class: Class,
    Sequence: Sequence,
    uniqueId: uniqueId,
    Port: Port,
    InputPort: InputPort,
    OutputPort: OutputPort,
    Message: Message,
    Component: Component,
    Publisher: Publisher,
    Subscriber: Subscriber,
    Traverser: Traverser
};

module.exports = dflo;