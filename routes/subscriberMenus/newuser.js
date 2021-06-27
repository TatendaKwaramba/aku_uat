const { registration, isRegistered, balance,  } = require("../helpers/ussdhelpers");
const menus = require('./subscriber');

module.exports = {
    newuserMenu: {
        stepone: () => {
            return menus.newUserMenu.getNewUserMenu;
        },

        steptwo: (text) => {
            if (!text.split("*")[0]) {
                resp = menus.invalidInput.getInvalidInput;
              } else {
                resp = menus.newUserMenu.getLastName;
              }
              return resp;
        },

        stepfour: (text) => {
          if (!text.split("*")[1]) {
              resp = menus.invalidInput.getInvalidInput;
            } else {
              resp = menus.newUserMenu.getEmail;
            }
            return resp;
        },

        stepfive: async (text, mobile, agentId) => {

          if (!text.split("*")[2]) {
            resp = menus.invalidInput.getInvalidInput;
          } else {
            let firstName = text.split("*")[0];
            let lastName = text.split("*")[1];
            let idNumber = text.split("*")[2];
            let email = text.split("*")[3];

            let isRegistered = await registration.selfRegistration(mobile, email, firstName, lastName, idNumber, agentId);
            console.log("IsRegistered: ", isRegistered);
            
            if(isRegistered){
              resp = menus.newUserMenu.getSuccess(firstName, lastName);
            } else {
              resp = menus.newUserMenu.getFailed;
            }
          }
          return resp;
        }
    },

    balance: {
      subscriber: async (mobile) => {
        let amount = await balance.subscriberBalance(mobile);
        let resp = amount? menus.balance.subscriber(amount): menus.balance.subscriber(0);
        return resp;
      },
      agent: async (agentId) => {
        let data = await balance.agentBalance(agentId);
        console.log("Balance Data: ", data);

        let accountBalance = data.accountBalance !== undefined? data.accountBalance: "0";
        let commissionBalance = data.commissionBalance !== undefined? data.commissionBalance: "0";

        resp = data? menus.balance.agent(accountBalance, commissionBalance): menus.balance.error;
        return resp;
      },
    },

    myaku: {
      stepone: async (phoneNumber) => {
        let cell = phoneNumber.includes("+")? phoneNumber.substring(1): phoneNumber; 

        try {
          let { mobile, fname, lname, email, registrationDate, amount } = await registration.myAku(cell);

          var walletCellphone = mobile ? mobile: "none";
          var walletBalance = amount ? "N" + amount : "";
          var walletEmail = email ? email : "none";
          var walletFirstname = fname ? fname : "none";
          var walletLastname = lname ? lname : "none";

        } catch (error) {
          console.log(error);
        }
    
        return menus.myAku.getMyAku(walletCellphone, walletBalance, walletEmail, walletFirstname, walletLastname);
      }
    },

    fundaku: {
      stepone: () => {
        return menus.fundAku.getFundAku;
      }
    } 
}