# Port
[Documentation](dflo.md) / Port

## <a name="Port"></a> Port : [Class](dflo.class.md#Class)

### <a name="Port.id"></a> id of Number

### <a name="Port.buffer"></a> buffer of Array [params of Array]

### <a name="Port.init"></a> init (config of Object)

**arguments**

 <a name="Port.init.config"></a> config of Object

### <a name="Port.update"></a> update (config of Object)

**arguments**

 <a name="Port.update.config"></a> config of Object

### <a name="Port.write"></a> write (params[0], params[1], ...) to buffer

**arguments**

 <a name="Port.write.params"></a> params of Array to buffer

### <a name="Port.read"></a> read () -> params of Array from buffer

**returns**

 <a name="Port.read.params"></a> params of Array from buffer


## <a name="InputPort"></a> InputPort : [Port](#Port)

### <a name="InputPort.callback"></a> callback of Function (params[0], params[1], ...)

### <a name="InputPort.context"></a> context of Object

### <a name="InputPort.update"></a> update (config of Object[callback, context])

**arguments**

 <a name="InputPort.update.config"></a> config of Object[callback, context]

 - <a name="InputPort.update.config.callback"></a> callback of Function (params[0], params[1], ...)

 - <a name="InputPort.update.config.callback"></a> context of Object

### <a name="InputPort.write"></a> write (params[0], params[1], ...)

**arguments**

 <a name="InputPort.write.params"></a> params of Array


## <a name="OutputPort"></a> OutputPort : [Port](#Port)

### <a name="OutputPort.connections"></a> connections of Set[port of InputPort]

### <a name="OutputPort.connect"></a> connect (port of InputPort)

**arguments**

 <a name="OutputPort.connect.port"></a> port of [InputPort](#InputPort)

### <a name="OutputPort.disconnect"></a> disconnect (port of InputPort)

**arguments**

 <a name="OutputPort.disconnect.port"></a> port of [InputPort](#InputPort)

### <a name="OutputPort.write"></a> write (params[0], params[1], ...)

**arguments**

 <a name="OutputPort.write.params"></a> params of Array