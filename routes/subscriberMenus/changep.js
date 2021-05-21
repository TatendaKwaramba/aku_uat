const { registration } = require("../helpers/ussdhelpers");
const menus = require('./subscriber');

let { Transaction: transaction } = require("../../models/sequelize");

let dbStatus = false;
module.exports = {
    changepin: {
        stepone: (sessionId, phoneNumber) => {
          
          try {
            transaction
              .create({
                session_id: sessionId,
                transaction_type: "CHANGE_PIN",
                mobile1: phoneNumber,
            })
            dbStatus = true;
          } catch (error) {
            console.log(error);
          }

          if(dbStatus){
            return menus.changePin.getCurrentPin;
          } else {
            return menus.systemBusy.getSystemBusy;
          }

        },

        steptwo: (text) => {
            if (text.split("*")[1] && !isNaN(text.split("*")[1])) {
                resp = menus.changePin.getNewPin;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },

        stepthree: () => {
            return menus.changePin.getConfirmPin;
        },

        stepfour: async (text, phoneNumber) => {
            let mobile = phoneNumber.includes("+")? phoneNumber.substring(1): phoneNumber;

            var oldPin = text.split("*")[1];
            var newPin = text.split("*")[2];
            var confirmPin = text.split("*")[3];
        
            if (newPin === confirmPin) {
              responseFlag = await registration.changePin(mobile, oldPin, newPin);
              if (responseFlag) {
                resp = menus.changePin.getSuccess;
              } else {
                resp = menus.changePin.getWrongPin;
              }
            } else {
              resp = menus.changePin.getPinMismatch;
            }
            return resp;        
        },
    }
}