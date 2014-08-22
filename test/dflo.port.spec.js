var dflo = require("../dflo"),
    Port = dflo.Port,
    InputPort = dflo.InputPort,
    OutputPort = dflo.OutputPort,
    Message = dflo.Message,
    Component = dflo.Component;

describe("dflo", function () {

    var MockPort = Port.extend({
        relay: function () {
        }
    });

    describe("Port", function () {

        describe("id", function () {

            it("has a unique id", function () {
                var port1 = new MockPort({
                    component: new Component()
                });
                var port2 = new MockPort({
                    component: new Component()
                });
                expect(port1.id).not.toEqual(port2.id);
            });

        });

        describe("label", function () {

            it("is a string given in the config", function () {

                var port1 = new MockPort({
                    component: new Component(),
                    label: "something"
                });
                expect(port1.label).toBe("something");
            });

        });

        describe("connections", function () {

            it("can be traversed from both side of the connection", function () {

                var mockPorts = [];
                for (var i = 0; i < 3; ++i)
                    mockPorts[i] = new MockPort({
                        component: new Component()
                    });
                mockPorts[0].connect(mockPorts[1]);
                expect(mockPorts[1].id in mockPorts[0].connections).toBe(true);
                expect(mockPorts[0].id in mockPorts[1].connections).toBe(true);
                expect(mockPorts[2].id in mockPorts[0].connections).toBe(false);
            });

        });

        describe("init()", function () {

            it("requires a Component instance as component", function () {
                expect(function () {
                    new MockPort({});
                }).toThrow("Invalid arguments: config.component is required.");

                expect(function () {
                    new MockPort({
                        component: {}
                    });
                }).toThrow("Invalid arguments: config.component, Component required.");

                expect(function () {
                    new MockPort({
                        component: new Component()
                    });
                }).not.toThrow();
            });

        });

        describe("isConnected()", function () {

            it("can be asked on both side of the connection", function () {

                var mockPorts = [];
                for (var i = 0; i < 3; ++i)
                    mockPorts[i] = new MockPort({
                        component: new Component()
                    });
                mockPorts[0].connect(mockPorts[1]);
                expect(mockPorts[0].isConnected(mockPorts[1])).toBe(true);
                expect(mockPorts[1].isConnected(mockPorts[0])).toBe(true);
                expect(mockPorts[0].isConnected(mockPorts[2])).toBe(false);
                expect(mockPorts[2].isConnected(mockPorts[0])).toBe(false);
            });

        });

    });

    describe("InputPort", function () {

        describe("init()", function () {

            it("requires a Function instance as a callback", function () {

                expect(function () {
                    new InputPort({
                        component: new Component(),
                        callback: {}
                    });
                }).toThrow("Invalid arguments: config.callback, Function required.");

                expect(function () {
                    new InputPort({
                        component: new Component(),
                        callback: function () {
                        }
                    });
                }).not.toThrow();

            });

        });

        describe("relay()", function () {

            it("automatically reads the data into a callback function after it was written", function () {

                var mockCallback = jasmine.createSpy();
                var port = new InputPort({
                    callback: mockCallback,
                    component: new Component()
                });
                var message = new Message();
                port.relay(message);
                expect(mockCallback).toHaveBeenCalledWith(message);
            });

            it("can relay only Messages", function () {

                var port = new InputPort({
                    callback: function () {
                    },
                    component: new Component()
                });
                expect(function () {
                    port.relay({});
                }).toThrow("Invalid argument: message, Message required.");

            });

        });

        describe("connect()", function () {

            it("can connect only to OutputPorts", function () {

                var inputs = [];
                for (var i = 0; i < 2; ++i)
                    inputs[i] = new InputPort({
                        callback: function () {
                        },
                        component: new Component()
                    });
                var mockPort = new MockPort({
                    component: new Component()
                });
                var output = new OutputPort({
                    component: new Component()
                });
                expect(function () {
                    inputs[0].connect(inputs[1]);
                }).toThrow("Invalid argument: port, OutputPort required.");

                expect(function () {
                    mockPort.connect(inputs[0]);
                }).toThrow("Invalid argument: port, OutputPort required.")

                expect(function () {
                    inputs[0].connect(output);
                }).not.toThrow();
            });

        });

    });

    describe("OutputPort", function () {

        describe("relay()", function () {

            it("automatically read the data into connected InputPorts after it was written", function () {

                var mockCallbacks = {
                    a: jasmine.createSpy(),
                    b: jasmine.createSpy(),
                    c: jasmine.createSpy()
                };
                var inputs = {};
                for (var name in mockCallbacks)
                    inputs[name] = new InputPort({
                        callback: mockCallbacks[name],
                        component: new Component()
                    });
                var output = new OutputPort({
                    component: new Component()
                });
                output.connect(inputs.a);
                output.connect(inputs.b);

                var message1 = new Message(1);
                var message2 = new Message(2);

                output.relay(message1);
                expect(mockCallbacks.a).toHaveBeenCalledWith(message1);
                expect(mockCallbacks.a.callCount).toBe(1);
                expect(mockCallbacks.b).toHaveBeenCalledWith(message1);
                expect(mockCallbacks.b.callCount).toBe(1);
                expect(mockCallbacks.c).not.toHaveBeenCalled();

                output.disconnect(inputs.b);
                output.connect(inputs.c);
                output.relay(message2);
                expect(mockCallbacks.a).toHaveBeenCalledWith(message2);
                expect(mockCallbacks.b).not.toHaveBeenCalledWith(message2);
                expect(mockCallbacks.c).toHaveBeenCalledWith(message2);
            });

            it("can relay only Messages", function () {

                var port = new OutputPort({
                    component: new Component()
                });
                expect(function () {
                    port.relay({});
                }).toThrow("Invalid argument: message, Message required.");

            });

        });

        describe("connect()", function () {

            it("can connect only to InputPorts", function () {

                var outputs = [];
                for (var i = 0; i < 2; ++i)
                    outputs[i] = new OutputPort({
                        component: new Component()
                    });
                var mockPort = new MockPort({
                    component: new Component()
                });
                var input = new InputPort({
                    component: new Component(),
                    callback: function () {
                    }
                });
                expect(function () {
                    outputs[0].connect(outputs[1]);
                }).toThrow("Invalid argument: port, InputPort required.");

                expect(function () {
                    mockPort.connect(outputs[0]);
                }).toThrow("Invalid argument: port, InputPort required.");

                expect(function () {
                    outputs[0].connect(input);
                }).not.toThrow();
            });

        });

    });

});



