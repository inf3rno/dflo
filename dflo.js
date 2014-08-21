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

var Port = Class.extend({
    id: undefined,
    init: function (config) {
        if (this.constructor === Port)
            abstractInit();
        this.id = uniqueId();
        if (config)
            this.update(config);
    },
    update: abstractMethod,
    relay: abstractMethod
});

var InputPort = Port.extend({
    callback: undefined,
    context: undefined,
    update: function (config) {
        if (!(config.callback instanceof Function))
            throw new Error("Invalid arguments: config.callback, Function required.");
        this.callback = config.callback;
        this.context = config.context;
    },
    relay: function () {
        this.callback.apply(this.context, arguments);
    }
});

var OutputPort = Port.extend({
    connections: undefined,
    init: function (config) {
        this.connections = {};
        Port.prototype.init.apply(this, arguments);
    },
    update: function (config) {

    },
    relay: function () {
        for (var id in this.connections) {
            var port = this.connections[id];
            port.relay.apply(port, arguments);
        }
    },
    connect: function (port) {
        if (!(port instanceof InputPort))
            throw new Error("Invalid argument: port, InputPort required.");
        this.connections[port.id] = port;
    },
    disconnect: function (port) {
        delete (this.connections[port.id]);
    }
});

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

var Publisher = Component.extend({
    init: function () {
        Component.prototype.init.apply(this, arguments);
        this.ports.stdout = new OutputPort();
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
    Subscriber: Subscriber
};

module.exports = dflo;