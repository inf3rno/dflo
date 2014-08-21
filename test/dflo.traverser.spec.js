var dflo = require("../dflo"),
    Publisher = dflo.Publisher,
    Subscriber = dflo.Subscriber,
    Traverser = dflo.Traverser;

describe("dflo", function () {

    describe("Traverser", function () {

        describe("traverse()", function () {

            it("traverses a basic network graph downstream", function () {

                var publisher = new Publisher();
                var subscriber1 = new Subscriber();
                var subscriber2 = new Subscriber();
                var subscriber3 = new Subscriber();
                publisher.connect(subscriber1);
                publisher.connect(subscriber2);

                var traverser = new Traverser();
                var log = jasmine.createSpy();
                var logger = new Subscriber({
                    callback: log
                });
                traverser.connect(logger);
                traverser.traverse(publisher);

                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, publisher);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, subscriber1);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, subscriber2);

                expect(log).toHaveBeenCalledWith(Traverser.PORT, publisher.ports.stdout);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, subscriber1.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, subscriber2.ports.stdin);

                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher.ports.stdout, subscriber1.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher.ports.stdout, subscriber2.ports.stdin);

                expect(log).not.toHaveBeenCalledWith(Traverser.CONNECTION, publisher.ports.stdout, subscriber3.ports.stdin);

                expect(log.callCount).toBe(8);

            });

            it("traverses a basic network graph upstream", function () {

                var publisher1 = new Publisher();
                var publisher2 = new Publisher();
                var subscriber = new Subscriber();

                publisher1.connect(subscriber);
                publisher2.connect(subscriber);

                var traverser = new Traverser();
                var log = jasmine.createSpy();
                var logger = new Subscriber({
                    callback: log
                });
                traverser.connect(logger);
                traverser.traverse(subscriber);

                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, publisher1);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, publisher2);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, subscriber);

                expect(log).toHaveBeenCalledWith(Traverser.PORT, publisher1.ports.stdout);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, publisher2.ports.stdout);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, subscriber.ports.stdin);

                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher1.ports.stdout, subscriber.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher2.ports.stdout, subscriber.ports.stdin);

                expect(log).not.toHaveBeenCalledWith(Traverser.CONNECTION, publisher1.ports.stdout, publisher2.ports.stdout);

                expect(log.callCount).toBe(8);
            });

            it("traverses a basic network graph using both downstream and upstream directions", function () {

                var publisher1 = new Publisher();
                var publisher2 = new Publisher();
                var subscriber = new Subscriber();

                publisher1.connect(subscriber);
                publisher2.connect(subscriber);

                var traverser = new Traverser();
                var log = jasmine.createSpy();
                var logger = new Subscriber({
                    callback: log
                });
                traverser.connect(logger);
                traverser.traverse(publisher1);

                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, publisher1);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, publisher2);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, subscriber);

                expect(log).toHaveBeenCalledWith(Traverser.PORT, publisher1.ports.stdout);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, publisher2.ports.stdout);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, subscriber.ports.stdin);

                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher1.ports.stdout, subscriber.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher2.ports.stdout, subscriber.ports.stdin);

                expect(log.callCount).toBe(8);
            });

            it("traverses a cyclic network graph using both downstream and upstream directions", function () {

                var publisher1 = new Publisher();
                var publisher2 = new Publisher();
                var subscriber1 = new Subscriber();
                var subscriber2 = new Subscriber();

                publisher1.connect(subscriber1);
                publisher1.connect(subscriber2);
                publisher2.connect(subscriber1);
                publisher2.connect(subscriber2);

                var traverser = new Traverser();
                var log = jasmine.createSpy();
                var logger = new Subscriber({
                    callback: log
                });
                traverser.connect(logger);
                traverser.traverse(publisher1);

                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, publisher1);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, publisher2);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, subscriber1);
                expect(log).toHaveBeenCalledWith(Traverser.COMPONENT, subscriber2);

                expect(log).toHaveBeenCalledWith(Traverser.PORT, publisher1.ports.stdout);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, publisher2.ports.stdout);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, subscriber1.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.PORT, subscriber2.ports.stdin);

                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher1.ports.stdout, subscriber1.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher1.ports.stdout, subscriber2.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher2.ports.stdout, subscriber1.ports.stdin);
                expect(log).toHaveBeenCalledWith(Traverser.CONNECTION, publisher2.ports.stdout, subscriber2.ports.stdin);

                expect(log.callCount).toBe(12);
            });

            it("traverses the network in the proper order", function () {

                var publisher1 = new Publisher();
                var publisher2 = new Publisher();
                var subscriber1 = new Subscriber();
                var subscriber2 = new Subscriber();

                publisher1.connect(subscriber1);
                publisher1.connect(subscriber2);
                publisher2.connect(subscriber1);
                publisher2.connect(subscriber2);

                var traverser = new Traverser();
                var log = [];
                var logger = new Subscriber({
                    callback: function () {
                        log.push([].slice.apply(arguments));
                    }
                });
                traverser.connect(logger);
                traverser.traverse(publisher1);

                expect(log[0]).toEqual([Traverser.COMPONENT, publisher1]);
                expect(log[1]).toEqual([Traverser.PORT, publisher1.ports.stdout]);
                expect(log[2]).toEqual([Traverser.COMPONENT, subscriber1]);
                expect(log[3]).toEqual([Traverser.PORT, subscriber1.ports.stdin]);
                expect(log[4]).toEqual([Traverser.CONNECTION, publisher1.ports.stdout, subscriber1.ports.stdin]);
                expect(log[5]).toEqual([Traverser.COMPONENT, subscriber2]);
                expect(log[6]).toEqual([Traverser.PORT, subscriber2.ports.stdin]);
                expect(log[7]).toEqual([Traverser.CONNECTION, publisher1.ports.stdout, subscriber2.ports.stdin]);
                expect(log[8]).toEqual([Traverser.COMPONENT, publisher2]);
                expect(log[9]).toEqual([Traverser.PORT, publisher2.ports.stdout]);
                expect(log[10]).toEqual([Traverser.CONNECTION, publisher2.ports.stdout, subscriber1.ports.stdin]);
                expect(log[11]).toEqual([Traverser.CONNECTION, publisher2.ports.stdout, subscriber2.ports.stdin]);

                expect(log[11]).not.toEqual([Traverser.CONNECTION, publisher2.ports.stdout, subscriber1.ports.stdin]);

                expect(log.length).toBe(12);

            });

        });


    });
});