// Copyright (c) 2013, Benjamin J. Kelly ("Author")
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';

module.exports = UdpStream;

var ObjectTransform = require('object-transform');
var UdpHeader = require('udp-header');
var util = require('util');

util.inherits(UdpStream, ObjectTransform);

function UdpStream(opts) {
  var self = (this instanceof UdpStream)
           ? this
           : Object.create(UdpStream.prototype);

  opts = opts || {};

  opts.meta = 'udp';

  ObjectTransform.call(self, opts);

  if (self.udp && typeof self.udp.toBuffer !== 'function') {
    throw new Error('UdpStream option udp must be null or provide a ' +
                    'toBuffer() function');
  }

  self._payload = opts.payload || 'suffix';

  if (self._payload && typeof self._payload !== 'string') {
    throw new Error('Optional payload value must be null or string ' +
                    'specifying message property containing the UDP payload.');
  }

  return self;
}

UdpStream.prototype._reduce = function(msg, output, callback) {
  var type = (msg.ip && msg.ip.protocol) ? msg.ip.protocol : 'udp';
  if (type !== 'udp') {
    var error = new Error('Invalid protocol [' + type + ']; must be udp');
    this.emit('ignored', error, origMsg);
    callback();
    return;
  }

  msg.udp = new UdpHeader(msg.data, msg.offset);
  msg.offset += msg.udp.length;
  return msg;
};

UdpStream.prototype._expand = function(udp, msg, output, callback) {
  if (msg.ip && Buffer.isBuffer(msg[this._payload])) {
    udp.setChecksum(msg.ip, msg[this._payload]);
  }
  udp.toBuffer(msg.data, msg.offset);
  msg.offset += udp.length;
  return msg;
};
