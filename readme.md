# deprecated

Now I am developing dflo2 with a different concept. I added dflo2 examples as well, so you can check the difference.

# DFlo project - dataflow islands for async coding in javascript

The main goal I wanted to achieve was bidirectional data binding between models and views in client side javascript. Meantime I realized, that
this is a part of something bigger; javascript has a poor support for async language statements. This is why the callback pyramid is still a
problem by async codes. Currently only `yield` is available to make async series, but nothing more. I studied different topics which share this
common problem for about a month. A short list of them: pub/sub pattern, observer pattern, ZermoMQ, message queue, message bus, promises, the async
lib, routing by computer networks, neural networks, I/O automaton, actor-based programming, agent-based programming, and the noflo lib, which
is dataflow-based. At the end I came to the conclusion, that what I need is some dataflow-based programming which is only for the async part of the code.
I don't think that everything is a nail, and dataflow-based patterns should be used as a golden hammer for everything. So for example in my opinion the
sync code should still be developed with the good old sync javascript as usual and just the communication between the different parts of the application
should be solved with dataflow-based code islands.

## Examples

### Observer pattern

```js

    var Subject = Class.extend({
        init: function (state) {
            this.publisher = new Publisher();
            this.state = state;
        },
        changeState: function (state) {
            this.state = state;
            this.notifyObservers();
        },
        registerObserver: function (observer) {
            this.publisher.ports.stdout.connect(observer.subscriber.ports.stdin);
        },
        unregisterObserver: function (observer) {
            this.publisher.ports.stdout.disconnect(observer.subscriber.ports.stdin);
        },
        notifyObservers: function () {
            this.publisher.publish(this.state);
        }
    });

    var Observer = Class.extend({
        init: function () {
            this.subscriber = new Subscriber({
                callback: this.notify,
                context: this
            });
        },
        notify: function (state) {
            //updating the observer using the subject's new state
        }
    });
```

dflo2:

```js
	var Subject = function (state){
		this.output = df.publisher();
		this.links = {};
		this.state = state;
	};
	Subject.prototype = {
		changeState: function (state) {
			this.state = state;
			this.notifyObservers();
		},
		registerObserver: function (observer) {
			if (!this.links[observer.id])
				this.links[observer.id] = df.link(this.output, observer.input).connect();
		},
		unregisterObserver: function (observer) {
			if (this.links[observer.id]){
				this.links[observer.id].disconnect();
				delete(this.links[observer.id]);
			}
		},
		notifyObservers: function () {
			this.output.publish(this.state);
		}
	};

	var Observer = function (){
		this.id = unique.id();
		this.input = df.subscriber(function (state){
			this.observer.notify(state);
		}, {observer: this});
	};
	Observer.prototype = {
		notify: function (){
			//...
		}
	};

```


[The example code is available here as a jasmine test.](test/example.observer.spec.js)

### Traversing network graph

A simple d3 force layout using the `Traverser` component as data source.
It displays the network graph using SVG. For example by the following network:

```js

    var usableData = new Publisher();
    var rawData = new Publisher();
    var resultLogger = new Subscriber({
        callback: function (result) {
            console.log(result);
        }
    });
    var errorLogger = new Subscriber({
        callback: function (err) {
            console.error(err);
        }
    });
    var raw2usable = new Transformer({
        callback: function (raw, done) {
            //do something to prepare raw data for the transformation
            if (err)
                done(null, err);
            else
                done(usable);
        }
    });
    var usable2Result = new Transformer({
        callback: function (usable, done) {
            //real transformation
            if (err)
                done(null, err);
            else
                done(result);
        }
    });

    var builder = new Builder();
    builder.connectAll(rawData.ports.stdout, raw2usable.ports.stdin);
    builder.connectAll(raw2usable.ports.stdout, usable2Result.ports.stdin);
    builder.connectAll(usableData.ports.stdout, usable2Result.ports.stdin);
    builder.connectAll(raw2usable.ports.stderr, usable2Result.ports.stderr, errorLogger.ports.stdin);
    builder.connectAll(usable2Result.ports.stdout, resultLogger.ports.stdin);
```

dflo2: 

```js
    var usableData = df({out: df.publisher});
    var rawData = df({out: df.publisher});
    var resultLogger = df({in: function (result) {
		console.log(result);
	}});
    var errorLogger = df({in: function (err) {
		console.error(err);
	}});
	
    var raw2usable = df({
		in: function (raw, done) {
            //do something to prepare raw data for the transformation
            if (err)
                this.err(err);
            else
                this.out(usable);
        },
		err: df.publisher,
		out: df.publisher
	})
	
    var usable2Result = df({
		in: function (usable, done) {
            //real transformation
            if (err)
                this.err(err);
            else
                this.out(result);
        },
		err: df.publisher,
		out: df.publisher
	});
	
	df.link(rawData.out, raw2usable.in).connect();
	df.link(raw2usable.out, usable2Result.in).connect();
	df.link(usableData.out, usable2Result.in).connect();
	df.link([raw2usable.err, usable2Result.err], errorLogger.in).connect();
	df.link(usable2Result.out, resultLogger.in).connect();

	rawData.out.publish({...});
```

the results will be something like this, after rearranging the nodes for a short while with drag&drop.

![Traversing network graph example preview](example/traverser/preview.png?raw=true "preview")

This is just a simple force layout, not a multi-force layout, which considers the position of the ports and the link-component overlaps, etc.
So it won't move the nodes into the perfect position automatically.

[The example code is available here.](example/traverser/index.html)
*note: You'll need a dflo.js file for browsers to run it.*

## Documentation

The documentation is not yet available.

### Installation

#### Requirements

Currently no requirements needed.

#### NPM

No npm repo available (because I don't want to add version numbers).

### Manually

I don't recommend to install the package yet, it is no use, but if you insist you can simply require the dflo.js file by node.js,
or with browserify in browsers.

## License

The MIT License (MIT)

Copyright (c) 2014 Jánszky László Lajos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
