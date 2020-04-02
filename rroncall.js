/*
** Must have exten set in GET string. We don't check because
** it should only be called from trusted code that has already
** validated the exten.
*/

exports.handler = function(context, event, callback) {
    /*
    ** If call status is completed, then caller was connected
    ** to someone. Stop dialing.
    */
    if (event.DialCallStatus == 'completed') {
        let twiml = new Twilio.twiml.VoiceResponse();
        twiml.hangup();
        callback(null, twiml);
        return;
    }
    
    /*
    ** Grab the extension config and make a call
    */
    
    var configurl = context.CONFIG_URL;
    var got = require('got');
    got(configurl, {json: true})
      .then(function(response) {
        callUser(context, event, callback, response.body);
    });
};

function callUser(context, event, callback, extenmap) {
    /*
    ** This is functional programming. We can't have state
    ** so we pass state around instead, like the lastdialed info
    ** If it is unset, then we're just starting.
    */
    let lastdialedidx = event.lastdialed;

    if (lastdialedidx == null) {
        nextnumberidx = 0;
    } else {
        lastdialedidx = parseInt(lastdialedidx);
        nextnumberidx = lastdialedidx + 1;
    }
    
    let twiml = new Twilio.twiml.VoiceResponse();
    let numbers = extenmap[event.exten];
    console.log(event.exten);
    if (event.DialCallStatus == 'completed') {
        twiml.hangup();
    } else if (nextnumberidx >= numbers.length) {
      twiml.say("We're sorry, no one can be reached. Please try again later.");
    } else {
        let d = twiml.dial({timeout: 30, action: '/rroncall?lastdialed=' + nextnumberidx + "&exten=" + event.exten});
        d.number({ url: '/screen'}, numbers[nextnumberidx]);
    }
    
    callback(null, twiml);
}
