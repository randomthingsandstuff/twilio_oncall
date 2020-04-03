exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    if (event.response == 1) {
        switch (event.Digits) {
	    case '1':
	        twiml.say("Connecting your call.")
	        break;
	    default:
	        twiml.say("Goodbye!")
	        twiml.hangup()
	    }
    } else {
	    twiml.gather({action: '/screen?response=1', numDigits: 1, timeout: 10}).say("This is the on-call system. Press one to be connected. Press any other key to decline.")
	    twiml.hangup()
    }
    callback(null, twiml);
};
