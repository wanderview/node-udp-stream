# udp-stream

UDP header parsing object stream

[![Build Status](https://travis-ci.org/wanderview/node-udp-stream.png)](https://travis-ci.org/wanderview/node-udp-stream)

## Example

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
