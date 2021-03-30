const PNF = require('google-libphonenumber').PhoneNumberFormat;
const NT = require('google-libphonenumber').PhoneNumberType
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

function swap(json){
    var ret = {};
    for(var key in json){
      ret[json[key]] = key;
    }
    return ret;
  }

module.exports = function(RED) {
    function PhoneNumberNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.useplus = config.useplus
        node.on('input', function(msg) {
            if (config.number == ""){
                this.number = msg.payload
            } else {
                this.number = config.number 
            }
            if (config.country == ""){
                this.country = msg.topic
            } else{
                this.country = config.country
            }
            const numberObj = phoneUtil.parseAndKeepRawInput(this.number, this.country);
            const payload = {}
            payload.countryCode = numberObj.getCountryCode().toString()
            payload.nationalNumber = numberObj.getNationalNumber().toString()
            payload.extension = numberObj.getExtension()
            payload.isValidNumber = phoneUtil.isValidNumber(numberObj)
            payload.numberType = swap(NT)[phoneUtil.getNumberType(numberObj).toString()]
            payload.e164 = phoneUtil.format(numberObj, PNF.E164)
            payload.nationalFormat = phoneUtil.format(numberObj, PNF.NATIONAL)
            payload.internationalFormat = phoneUtil.format(numberObj, PNF.INTERNATIONAL)
            if (!this.useplus){
                payload.e164 = payload.e164.replace('+', '')

            }
            msg.payload = payload
            node.send(msg);
        });
    }
    RED.nodes.registerType("phone-number",PhoneNumberNode);
}
