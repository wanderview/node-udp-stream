# udp-stream

UDP header serialization object stream.

[![Build Status](https://travis-ci.org/wanderview/node-udp-stream.png)](https://travis-ci.org/wanderview/node-udp-stream)

## Example

### Reading

```javascript
var UdpStream = require('udp-stream');
var IpStream = require('ip-stream');
var EtherStream = require('ether-stream');
var PcapStream = require('pcap-stream');

var pstream = new PcapStream(PCAP_FILE);
var estream = new EtherStream();
var ipstream = new IpStream();
var ustream = new UdpStream();

pstream.pipe(estream).pipe(ipstream).pipe(ustream);

upstream.on('readable', function() {
  var msg = upstream.read();

  msg.ether.src === '12:34:56:65:43:21';  // Ethernet frame is still available

  msg.ip.src === '1.1.1.1';   // IP header is still available
  msg.ip.dst === '2.2.2.2';
  msg.ip.protocol === 'udp';

  msg.udp.srcPort === 5321;   // UDP header is available at .udp property
  msg.udo.dstPort === 52;

  var payload = msg.data;     // UDP data is available at .data property
});

// Packets that cannot be parsed as UDP are emitted with 'ignored' event
upstream.on('ignored', function(msg) {
  console.log('Ignored message [' + msg + ']');
});

upstream.read(0);
```

### Writing
```javascript
var UdpStream = require('udp-stream');
var IpStream = require('ip-stream');
var EtherStream = require('ether-stream');
var UdpHeader = require('udp-header');
var IpHeader = require('ip-header');
var EtherFrame = require('ether-frame');

var estream = new EtherStream();
var ipstream = new IpStream();
var ustream = new UdpStream();

estream.pipe(ipstream).pipe(ustream);

// define the header fields to write out to the buffer
var input = {
  ether: new EtherFrame({dst: '01:02:03:04:05:06'}),
  ip: new IpHeader({dst: '1.2.3.4'}),
  udp: new UdpHeader({dstPort: 52, dataLength: 500}),
  data: new Buffer(8*1024)                // space to write header to
};

// NOTE: packet payload is not in.data, that must be appended later

estream.write(input);
var out = ustream.read();

// header values have been written to the buffer
out.offset === (input.ether.length * input.ip.length + input.udp.length);
test.deepEqual(input.ether, new EtherFrame(out.data, 0));
test.deepEqual(input.ip, new IpHeader(out.data, input.ether.length));
test.deepEqual(input.udp, new UdpHeader(out.data, input.ether.length +
                                                  input.ip.length));

// UDP checksums will only be calculated if the message contains both
// the 'ip' header property and the UDP payload.  By default the
// payload is assumed to be in the 'suffix' property.
input.suffix = new Buffer(500);

// The location of the UDP payload can be configured.
ustream2 = new UdpStream({payload: 'udpPayload'});
input.udpPayload = new Buffer(500);
```
