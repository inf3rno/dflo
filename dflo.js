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

var Class = extend(Object);
Class.abstractInit = function () {
    throw new SyntaxError(warning.ABSTRACT_CLASS_INSTANTIATION);
};
Class.prototype.init = Class.abstractInit;
Class.abstractMethod = function () {
    throw new SyntaxError(warning.ABSTRACT_METHOD_CALL);
};

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
    id: undefined,
    ports: undefined,
    init: function (config) {
        this.id = uniqueId();
        this.ports = {};
    }
});

var Port = Class.extend({
    id: undefined,
    component: undefined,
    connections: undefined,
    init: function (config) {
        if (this.constructor === Port)
            Class.abstractInit();
        this.id = uniqueId();
        this.connections = {};
        if (!config)
            throw new Error(warning.CONFIG_REQUIRED);
        if (!(config.component))
            throw new Error(warning.CONFIG_COMPONENT_REQUIRED);
        if (!(config.component instanceof Component))
            throw new Error(warning.CONFIG_COMPONENT_INVALID);
        this.component = config.component;
    },
    connect: function (port) {
        if (!(port instanceof Port))
            throw new Error(warning.PORT_INVALID);
        if (this.isConnected(port))
            return;
        this.connections[port.id] = port;
        if (!port.isConnected(this))
            port.connect(this);
    },
    disconnect: function (port) {
        if (!(port instanceof Port))
            throw new Error(warning.PORT_INVALID);
        if (this.isConnected(port))
            delete(this.connections[port.id]);
        if (port.isConnected(this))
            port.disconnect(this);
    },
    isConnected: function (port) {
        if (!(port instanceof Port))
            throw new Error(warning.PORT_INVALID);
        return (port.id in this.connections);
    },
    relay: Class.abstractMethod
});

var InputPort = Port.extend({
    callback: undefined,
    context: undefined,
    init: function (config) {
        Port.prototype.init.apply(this, arguments);
        if (!(config.callback instanceof Function))
            throw new Error(warning.CONFIG_CALLBACK_INVALID);
        this.callback = config.callback;
        this.context = config.context;
    },
    connect: function (port) {
        if (!(port instanceof OutputPort))
            throw new Error(warning.OUTPUT_PORT_INVALID);
        Port.prototype.connect.apply(this, arguments);
    },
    relay: function (message) {
        if (!(message instanceof Message))
            throw new Error(warning.MESSAGE_INVALID);
        this.callback.call(this.context, message);
    }
});

var OutputPort = Port.extend({
    connect: function (port) {
        if (!(port instanceof InputPort))
            throw new Error(warning.INPUT_PORT_INVALID);
        Port.prototype.connect.apply(this, arguments);
    },
    relay: function (message) {
        if (!(message instanceof Message))
            throw new Error(warning.MESSAGE_INVALID);
        for (var id in this.connections) {
            var input = this.connections[id];
            input.relay(message);
        }
    }
});

var CustomComponent = Component.extend({
    init: function (init) {
        Component.prototype.init.apply(this, arguments);
        if (init instanceof Function)
            init.apply(this, [].slice.call(arguments, 1));
    }
});

var Publisher = Component.extend({
    init: function (config) {
        Component.prototype.init.apply(this, arguments);
        this.ports.stdout = new OutputPort({
            component: this
        });
    },
    publish: function () {
        var data = [].slice.apply(arguments);
        var message = new Message(data);
        this.ports.stdout.relay(message);
    }
});

var Subscriber = Component.extend({
    init: function (config) {
        Component.prototype.init.apply(this, arguments);
        this.ports.stdin = new InputPort({
            component: this,
            callback: this.notifyCallback,
            context: this
        });
        if (config)
            this.update(config);
    },
    update: function (config) {
        if (!(config.callback instanceof Function))
            throw new Error(warning.CONFIG_CALLBACK_INVALID);
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
            throw new Error(warning.COMPONENT_INVALID);
        this.traverseNext([component], {});
    },
    traverseNext: function (queue, visited) {
        var component = queue.shift();
        if (!component)
            return;
        if (component.id in visited) {
            this.traverseNext(queue, visited);
            return;
        }
        this.publish(Traverser.COMPONENT, component);
        for (var portName in component.ports) {
            var port = component.ports[portName];
            if (port.id in visited)
                continue;
            this.publish(Traverser.PORT, port, portName);
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
        this.traverseNext(queue, visited);
    }
});
Traverser.COMPONENT = 0;
Traverser.PORT = 1;
Traverser.CONNECTION = 2;

var Transformer = Component.extend({
    init: function (config) {
        Component.prototype.init.apply(this, arguments);
        this.ports.stdin = new InputPort({
            component: this,
            callback: this.transform,
            context: this
        });
        this.ports.stdout = new OutputPort({
            component: this
        });
        this.ports.stderr = new OutputPort({
            component: this
        });
        if (!(config.callback instanceof Function))
            throw new Error(warning.CONFIG_CALLBACK_INVALID);
        this.callback = config.callback;
        this.context = config.context;
    },
    transform: function (incoming) {
        var done = function (data, error) {
            if (data === incoming.data)
                throw new Error(warning.CANNOT_TRANSFORM_SAME_ARRAY);
            if (error) {
                if (error instanceof Array)
                    this.ports.stderr.relay(new Message(error));
                else
                    throw new Error(warning.ERROR_DATA_INVALID);
            }
            else {
                if (data instanceof Array)
                    this.ports.stdout.relay(new Message(data));
                else
                    throw new Error(warning.MESSAGE_DATA_INVALID);
            }
        }.bind(this);
        this.callback.call(this.context, incoming.data, done);
    }
});

var Builder = Component.extend({
    init: function (config) {
        Component.prototype.init.apply(this, arguments);
    },
    connectAll: function () {
        var inputs = [];
        var outputs = [];
        [].forEach.call(arguments, function (port) {
            if (port instanceof InputPort)
                inputs.push(port);
            else if (port instanceof OutputPort)
                outputs.push(port);
            else
                throw new Error(warning.PORT_INVALID);
        });
        outputs.forEach(function (output) {
            inputs.forEach(function (input) {
                output.connect(input);
            });
        });
    }
});

var warning = {
    ABSTRACT_CLASS_INSTANTIATION: "Tried to instantiate an abstract class.",
    ABSTRACT_METHOD_CALL: "Tried to call an abstract method.",
    CONFIG_REQUIRED: "Invalid arguments: config is required.",
    CONFIG_COMPONENT_REQUIRED: "Invalid arguments: config.component is required.",
    CONFIG_COMPONENT_INVALID: "Invalid arguments: config.component, Component required.",
    PORT_INVALID: "Invalid arguments: port, Port required.",
    CONFIG_CALLBACK_INVALID: "Invalid arguments: config.callback, Function required.",
    OUTPUT_PORT_INVALID: "Invalid argument: port, OutputPort required.",
    MESSAGE_INVALID: "Invalid argument: message, Message required.",
    INPUT_PORT_INVALID: "Invalid argument: port, InputPort required.",
    COMPONENT_INVALID: "Invalid argument: origin, Component required.",
    CANNOT_TRANSFORM_SAME_ARRAY: "Transforming the incoming data array can have unexpected results, so it is not allowed.",
    ERROR_DATA_INVALID: "Invalid error data, Array required.",
    MESSAGE_DATA_INVALID: "Invalid results, Array required."
};

var dflo = {
    Class: Class,
    Sequence: Sequence,
    uniqueId: uniqueId,
    Port: Port,
    InputPort: InputPort,
    OutputPort: OutputPort,
    Message: Message,
    Component: Component,
    CustomComponent: CustomComponent,
    Publisher: Publisher,
    Subscriber: Subscriber,
    Traverser: Traverser,
    Transformer: Transformer,
    Builder: Builder,
    warning: warning
};

module.exports = dflo;