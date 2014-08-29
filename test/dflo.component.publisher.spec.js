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
                component: component
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
                publisher.ports.stdout.connect(logger.component.ports.stdin);
                publisher.publish(1, 2, 3);
                expect(logger.spy).toHaveBeenCalledWith(1, 2, 3);
            });

        });

    });

});