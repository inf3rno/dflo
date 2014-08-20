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

        describe("publish()", function () {

            it("sends messages to the stdin of other components", function () {
                var publisher = new Publisher();
                var logger = new Component();
                var log = jasmine.createSpy();
                logger.ports.stdin = new InputPort({
                    reader: function (message) {
                        expect(message instanceof Message).toBe(true);
                        log.apply(null, message.data);
                    }
                });
                publisher.connect(logger);
                publisher.publish(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
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