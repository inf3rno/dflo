var dflo = require("../dflo"),
    Port = dflo.Port,
    InputPort = dflo.InputPort,
    OutputPort = dflo.OutputPort;

describe("dflo", function () {

    describe("Port", function () {

        var MockPort = Port.extend({
            update: function () {
            },
            relay: function () {
            }
        });

        it("has a unique id", function () {
            expect(new MockPort().id).not.toEqual(new MockPort().id);
        });

    });

    describe("InputPort", function () {

        it("automatically reads the data into a callback function after it was written", function () {

            var mockCallback = jasmine.createSpy();
            var port = new InputPort({
                callback: mockCallback
            });
            port.relay(1, 2, 3);
            expect(mockCallback).toHaveBeenCalledWith(1, 2, 3);
        });

    });

    describe("OutputPort", function () {

        it("automatically read the data into connected InputPorts after it was written", function () {

            var mockCallbacks = {
                a: jasmine.createSpy(),
                b: jasmine.createSpy(),
                c: jasmine.createSpy()
            };
            var inputs = {};
            for (var name in mockCallbacks)
                inputs[name] = new InputPort({
                    callback: mockCallbacks[name]
                });
            var output = new OutputPort();
            output.connect(inputs.a);
            output.connect(inputs.b);
            output.relay(1, 2, 3);
            expect(mockCallbacks.a).toHaveBeenCalledWith(1, 2, 3);
            expect(mockCallbacks.a.callCount).toBe(1);
            expect(mockCallbacks.b).toHaveBeenCalledWith(1, 2, 3);
            expect(mockCallbacks.b.callCount).toBe(1);
            expect(mockCallbacks.c).not.toHaveBeenCalled();

            output.disconnect(inputs.b);
            output.connect(inputs.c);
            output.relay(4, 5, 6);
            expect(mockCallbacks.a).toHaveBeenCalledWith(4, 5, 6);
            expect(mockCallbacks.b).not.toHaveBeenCalledWith(4, 5, 6);
            expect(mockCallbacks.c).toHaveBeenCalledWith(4, 5, 6);
        });

    });

});



