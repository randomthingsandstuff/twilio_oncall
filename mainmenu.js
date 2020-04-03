/*
** Validate all extensions here. Do not proceed without validating it is real!
** Virtually all of the security is implemented here (example, max invalids)
*/

exports.handler = function(context, event, callback) {

    var configurl = context.CONFIG_URL;
  
    if (event.Digits == null) {
        getExten(context, event, callback, false);
        return;
    }
    var got = require('got');
    got(configurl, {json: true})
      .then(function(response) {
        routeExten(context, event, callback, response.body);
    });
};

function getExten(context, event, callback, invmsg) {
    var menuloopiter;
    if (event.menuloopiter == null) {
        menuloopiter = 1;
    } else {
        menuloopiter = parseInt(event.menuloopiter) + 1;
    }
    let twiml = new Twilio.twiml.VoiceResponse();
    
    let msg = "";
    if (invmsg) {
        msg += "Invalid extension... ";
    }
    if (menuloopiter > context.MAX_MENULOOPITER) {
        msg += "Too many attempts... Goodbye!";
        twiml.say(msg);
        callback(null, twiml);
        return;
    }
    if (invmsg) {
        msg += "Please try again....";
    }
    msg += "Please enter the extension you wish to reach.";
    let nextUrl = "/mainmenu?menuloopiter=" + menuloopiter;
    twiml.gather({numDigits: 4, action: nextUrl, timeout:10}).say(msg);
    twiml.redirect(nextUrl);
    callback(null, twiml);
}

function routeExten(context, event, callback, extenmap) {
    var exten = event.Digits;
    if (!(exten in extenmap)) {
        console.log("Got extension " + exten);
        getExten(context, event, callback, true);
        return;
    }
    let twiml = new Twilio.twiml.VoiceResponse();
    twiml.redirect("/rroncall?exten=" + exten);
    callback(null, twiml);
}
