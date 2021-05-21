const menus = require('./subscriber');

module.exports = {
    atmCashout: {
        stepone: () => {
            return menus.atmCashout.getAtm;  
        },

        steptwo: () => {
            return menus.atmCashout.getComingSoon;  
        },

        stepthree: () => {
            return menus.atmCashout.getAmount; 
        },

        stepfour: (text) => {
            if (text.split("*")[2]) {
                resp = menus.atmCashout.getPin;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp; 
        },

        stepfive: (text) => {
            if (text.split("*")[3]) {
                resp = menus.atmCashout.getComingSoon;
              } else {
                resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },
    }
}
