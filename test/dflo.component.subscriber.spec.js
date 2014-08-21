var dflo = require("../dflo"),
    Publisher = dflo.Publisher,
    Subscriber = dflo.Subscriber;

describe("dflo", function () {

    describe("Subscriber", function () {

        describe("subscribe()", function () {

            it("notifies subscribers with the message data", function () {
                var publisher = new Publisher();
                publisher.publish(1, 2, 3);

                var log = jasmine.createSpy();
                var subscriber = new Subscriber({
                    callback: log
                });
                publisher.connect(subscriber);
                publisher.publish(4, 5, 6);
                expect(log).not.toHaveBeenCalledWith(1, 2, 3);
                expect(log).toHaveBeenCalledWith(4, 5, 6);
            });

        });

    });

});