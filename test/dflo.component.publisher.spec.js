var dflo = require("../dflo"),
    InputPort = dflo.InputPort,
    Message = dflo.Message,
    Component = dflo.Component,
    Publisher = dflo.Publisher;

describe("dflo", function () {

    describe("Publisher", function () {

        var createLogger = function () {

            var component = new Component();
            var spy = jasmine.createSpy();
            component.ports.stdin = new InputPort({
                callback: function (message) {
                    expect(message instanceof Message).toBe(true);
                    spy.apply(null, message.data);
                },
                component: component,
                name: ""
            });

            return {
                component: component,
                spy: spy
            };
        };

        describe("publish()", function () {

            it("sends messages to the stdin of other components", function () {
                var publisher = new Publisher();
                var logger = createLogger();
                publisher.connect(logger.component);
                publisher.publish(1, 2, 3);
                expect(logger.spy).toHaveBeenCalledWith(1, 2, 3);
            });

        });

        describe("disconnect()", function () {

            it("disconnects stdin of other components", function () {

                var publisher = new Publisher();
                var logger1 = createLogger();
                var logger2 = createLogger();
                publisher.connect(logger1.component);
                publisher.connect(logger2.component);
                publisher.publish(1, 2, 3);
                expect(logger1.spy).toHaveBeenCalledWith(1, 2, 3);
                expect(logger2.spy).toHaveBeenCalledWith(1, 2, 3);
                publisher.disconnect(logger1.component);
                publisher.publish(4, 5, 6);
                expect(logger1.spy).not.toHaveBeenCalledWith(4, 5, 6);
                expect(logger2.spy).toHaveBeenCalledWith(4, 5, 6);
            });

        });

    });

});