const menus = require('./subscriber');

module.exports = {
    airtime: {
        stepone: () => {
            return menus.airtime.getOptions;
        },

        steptwo: (text) => {
            if (text.split("*")[1] && !isNaN(text.split("*")[1])) {
                return menus.airtime.getAmount;
              }
        },

        stepthree: (text) => {
            let airtime = text.split("*")[2];
            if (airtime && !isNaN(airtime)) {
              resp = menus.airtime.getConfirmAirtime(airtime);
            } else {
              resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },

        stepfour: (text) => {
            if (text.split("*")[2] && !isNaN(text.split("*")[2])) {
                resp = menus.airtime.getComingSoon;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },

        stepfive: (text) => {
            if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
                resp = menus.airtime.getCancel;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },
    },
    
    otherAirtime: {
        stepone: (text) => {
            if (text.split("*")[1] && !isNaN(text.split("*")[1])) {
                return menus.airtime.otherAirtime.getCell;
            }
        },

        steptwo: (text) => {
            if (text.split("*")[2] && !isNaN(text.split("*")[2])) {
                resp = menus.airtime.otherAirtime.getAmount;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },

        stepthree: (text) => {
            if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
                resp = menus.airtime.otherAirtime.getPin;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp;    
        },
        
        stepfour: (text) => {
            let airtime1 = text.split("*")[3];
            let receiver = text.split("*")[2];
            if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
              resp = menus.airtime.otherAirtime.getConfirm(airtime1, receiver);
            } else {
              resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },

        stepfive: (text) => {
            if (text.split("*")[2] && !isNaN(text.split("*")[3])) {
                resp = menus.airtime.otherAirtime.getSuccess;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        }
    }
}