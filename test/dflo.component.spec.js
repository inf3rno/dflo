var dflo = require("../dflo"),
    Port = dflo.Port,
    InputPort = dflo.InputPort,
    OutputPort = dflo.OutputPort,
    Message = dflo.Message,
    Component = dflo.Component,
    Publisher = dflo.Publisher,
    Subscriber = dflo.Subscriber;

describe("dflo", function () {

    describe("Component", function () {

        it("has a unique id", function () {
            expect(new Component().id).not.toEqual(new Component().id);
        });

    });

    describe("Publisher", function () {

        var createLogger = function () {

            var component = new Component();
            var spy = jasmine.createSpy();
            component.ports.stdin = new InputPort({
                reader: function (message) {
                    expect(message instanceof Message).toBe(true);
                    spy.apply(null, message.data);
                }
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

    describe("Subscriber", function () {

        describe("subscribe()", function () {

            it("notifies subscribers with the message data", function () {
                var publisher = new Publisher();
                publisher.publish(1, 2, 3);

                var log = jasmine.createSpy();
                var subscriber = new Subscriber({
                    listener: log
                });
                publisher.connect(subscriber);
                publisher.publish(4, 5, 6);
                expect(log).not.toHaveBeenCalledWith(1, 2, 3);
                expect(log).toHaveBeenCalledWith(4, 5, 6);
            });

        });

    });


});