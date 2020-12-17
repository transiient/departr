const Soap = require('soap');

Soap.createClient('https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2017-10-01', function(err, client) {
    console.log(client.describe());
})