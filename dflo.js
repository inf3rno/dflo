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
    buffer: undefined,
    init: function (config) {
        this.id = uniqueId();
        this.buffer = [];
        if (config)
            this.update(config);
    },
    update: function (config) {
    },
    write: function () {
        this.buffer.push([].slice.apply(arguments));
    },
    read: function () {
        return this.buffer.shift();
    }
});

var InputPort = Port.extend({
    reader: undefined,
    context: undefined,
    update: function (config) {
        if (!(config.reader instanceof Function))
            throw new Error("Invalid arguments: config.reader, Function required.");
        this.reader = config.reader;
        this.context = config.context;
    },
    write: function () {
        Port.prototype.write.apply(this, arguments);
        this.reader.apply(this.context, this.read());
    }
});

var OutputPort = Port.extend({
    connections: undefined,
    init: function (config) {
        this.connections = {};
        Port.prototype.init.apply(this, arguments);
    },
    write: function () {
        Port.prototype.write.apply(this, arguments);
        var args = this.read();
        for (var id in this.connections) {
            var port = this.connections[id];
            port.write.apply(port, args);
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
        this.ports.stdout.write(message);
    },
    connect: function (component) {
        if (!(component instanceof Component))
            throw new Error("Invalid argument: component, Component required.");
        var input = component.ports.stdin;
        if (!(input instanceof InputPort))
            throw new Error("Cannot find input port on the given component.");
        this.ports.stdout.connect(input);
    }
});

var Subscriber = Component.extend({
    init: function (config) {
        Component.prototype.init.apply(this, arguments);
        this.ports.stdin = new InputPort({
            reader: this.notify,
            context: this
        });
        if (config)
            this.update(config);
    },
    update: function (config) {
        if (!(config.listener instanceof Function))
            throw new Error("Invalid argument: config.listener, Function required.");
        this.listener = config.listener;
        this.context = config.context;
    },
    notify: function (message) {
        this.listener.apply(this.context, message.data);
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