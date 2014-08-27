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

 - [Observer pattern](test/example.observer.spec.js)
 - [Traversing network graph](example/traverser/index.html)
  ![Traversing network graph example preview](example/traverser/preview.png?raw=true "preview")

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