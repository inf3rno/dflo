# DFlo Documentation

Documentation

 - [class](dflo.class.md)
   - [Class](dlo.class.md#Class) : Object
     - static [extend](dlo.class.md#Class.extend) (properties of Object) -> descendant : Class
     - [init](dlo.class.md#Class.init) ()
 - [sequence](dflo.sequence.md)
   - [Sequence](dflo.sequence.md#Sequence) : Class
     - [init](dflo.sequence.md#Sequence.init) ()
     - [state](dflo.sequence.md#Sequence.state)
     - [get](dflo.sequence.md#Sequence.get) () -> state
     - [next](dflo.sequence.md#Sequence.next) (params[0], params[1], ...) -> state
     - [wrapper](dflo.sequence.md#Sequence.wrapper) (params[0], params[1]) -> nextWrapper (params[2], params[3], ...)
     - *: Class*
       - *static [extend](dlo.class.md#Class.extend) (properties of Object) -> descendant : Class*
   - [uniqueId](dflo.sequence.md#uniqueId) () -> id of Number
 - [port](dflo.port.md)
   - [Port](dflo.port.md#Port) : Class
     - [id](dflo.port.md#Port.id) id of Number
     - [init](dflo.port.md#Port.init) (config of Object)
     - *: Class*
       - *static [extend](dlo.class.md#Class.extend) (properties of Object) -> descendant : Class*
   - [InputPort](dflo.port.md#InputPort) : Port
     - [callback](dflo.port.md#InputPort.callback) of Function (params[0], params[1], ...)
     - [context](dflo.port.md#InputPort.context) of Object
     - [update](dflo.port.md#InputPort.update) (config of Object[callback, context])
     - [relay](dflo.port.md#InputPort.relay) (params[0], params[1], ...)
     - *: Port*
       - *[id](dflo.port.md#Port.id) id of Number*
       - *[init](dflo.port.md#Port.init) (config of Object)*
     - *: Class*
       - *static [extend](dlo.class.md#Class.extend) (properties of Object) -> descendant : Class*
   - [OutputPort](dflo.port.md#OutputPort) : Port
     - [connections](dflo.port.md#OutputPort.connections) of Set[port of InputPort]
     - [connect](dflo.port.md#OutputPort.connect) (port of InputPort)
     - [disconnect](dflo.port.md#OutputPort.disconnect) (port of InputPort)
     - [relay](dflo.port.md#OutputPort.relay) (params[0], params[1], ...)
     - *: Port*
       - *[id](dflo.port.md#Port.id) id of Number*
       - *[init](dflo.port.md#Port.init) (config of Object)*
     - *: Class*
       - *static [extend](dlo.class.md#Class.extend) (properties of Object) -> descendant : Class*

