let { Transaction: transaction } = require("../../models/sequelize");

const { agent } = require("../helpers/ussdhelpers");
const menus = require('./agent');

let dbStatus = false;
module.exports = {
    cashout: {
        stepone: async (phoneNumber, sessionId) => {
            let cashout_user;
            cashout_user = phoneNumber.includes("+")? phoneNumber.substring(1): phoneNumber;

            try {
              await transaction
              .create({
                session_id: sessionId,
                transaction_type: "CASHOUT",
                mobile1: cashout_user,
              })
              dbStatus = true;
            } catch (error) {
              console.log(error);
            }

            if (dbStatus) {
              resp = menus.cashout.getAmount;
            } else {
              resp = menus.systemBusy.getSystemBusy;
            }
            return resp;
        }, 

        steptwo: async (text, sessionId) => {
          var amount = text.split("*")[2];
          console.log("S5 Data Entered: ", text);
          
          try {
            await transaction
            .update(
              {
                amount: amount,
              },
              {
                where: {
                  session_id: sessionId,
                },
              }
            )
            dbStatus = true;
          } catch (error) {
            console.log(error);
          }

          if(dbStatus){
            if (text.split("*")[2] && !isNaN(text.split("*")[2])) {
              resp = menus.cashout.getRecipient;
            } else {
              resp = menus.invalidInput.getInvalidInput;
            }
          } else {
            resp = menus.systemBusy.getSystemBusy;            
          }
          return resp;
        }, 

        stepthree: async (text, sessionId) => {
            var amount = text.split("*")[2];
            let recipientNumber = text.split("*")[3];
            console.log("S5 Data Entered: ", text);        
            
            try {
              await transaction
              .update(
                {
                  mobile2: recipientNumber,
                },
                {
                  where: {
                    session_id: sessionId,
                  },
                }
              )
              dbStatus = true;              
            } catch (error) {
              console.log(error);
            }

            if(dbStatus){
              if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
                resp = menus.cashout.getConfirm(amount, recipientNumber);
              } else {
                resp = menus.invalidInput.getInvalidInput;
              }
            } else {
              resp = menus.systemBusy.getSystemBusy;              
            }
            return resp;
        },

        stepfour: () => {
            return menus.cashout.getPIN;
        },

        stepfive: () => {
            return menus.cashout.getCancel;
        },

        stepsix: async (text) => {
          var pin = text.split("*")[5];

          if (pin && !isNaN(pin)) {
            resp = menus.cashout.getAgentCode;
          } else {
            resp = menus.invalidInput.getInvalidInput;
          }
          return resp;
        },

        stepseven: async (text, sessionId, agentId, operatorId) => {
          let operatorCode = text.split("*")[6];

          let bankdts = await transaction
            .findAll({
              where: {
                session_id: sessionId,
              },
            });
      
          let imei = bankdts[0] ? bankdts[0].getDataValue("mobile1") : "";
          let subscriberMobile = bankdts[0] ? bankdts[0].getDataValue("mobile2") : "";
          let amount = bankdts[0] ? parseInt(bankdts[0].getDataValue("amount")) : 0;
          let pin = text.split("*")[5];

          let agentCashoutFlag = await agent.cashout(agentId, subscriberMobile, pin, amount, operatorId, imei, operatorCode);
          
          if(agentCashoutFlag.flag){
            // return success
            resp = menus.cashout.getSuccess;
          } else if(agentCashoutFlag.statusCode == 404){
            // subscriber not found
            resp = menus.cashout.getUnknownSubscriber;
          } else if(agentCashoutFlag.statusCode == 500){
            // incorrect subscriber pin
            resp = menus.cashout.getWrongPin;
          } else if(agentCashoutFlag.statusCode == 300){
            // get wrong code
            resp = menus.cashout.getWrongCode;
          } else {
            // return failed
            resp = menus.cashout.getFailed;
          }
          return resp; 
        }
    }
}