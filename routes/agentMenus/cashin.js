let { Transaction: transaction } = require("../../models/sequelize");

const { agent } = require("../helpers/ussdhelpers");
const menus = require('./agent');

let dbStatus = false;
module.exports = {
    cashin: {
        stepone: async (user, sessionId) => {
          try {
            await transaction
                .create({
                  session_id: sessionId,
                  transaction_type: "CASHIN",
                  mobile1: user,
                })
              dbStatus = true;
            } catch (error) {
              console.log("db cashin start: ", error);
            }

            if(dbStatus){
              resp = menus.cashin.getRecipient;
            } else {
              resp = menus.systemBusy.getSystemBusy;
            }
            return resp;
        },

        steptwo: async (text, sessionId) => {
            console.log("Data Entered: ", text);
            try {
              await transaction
                .update(
                  {
                    mobile2: text.split("*")[2],
                  },
                  {
                    where: {
                      session_id: sessionId,
                    },
                  }
              )
              dbStatus = true;    
            } catch (error) {
              console.log("db update phone: ", error);
            }

            if(dbStatus){
              if (text.split("*")[2] && !isNaN(text.split("*")[2])) {
                resp = menus.cashin.getAmount;
              } else {
                resp = menus.invalidInput.getInvalidInput;
              }
            } else {
              resp = menus.systemBusy.getSystemBusy;
            }
            return resp;
        },

        stepthree: async (text, sessionId) => {
            console.log("S5 Data Entered: ", text);
            try {
              await transaction
                .update(
                  {
                    amount: text.split("*")[3],
                  },
                  {
                    where: {
                      session_id: sessionId,
                    },
                  }
                )

                dbStatus =  true;
            } catch (error) {
              console.log("db update amount: ", error);
            }
            
            if(dbStatus){
              if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
                resp = menus.cashin.getConfirm(text);
              } else {
                resp = menus.invalidInput.getInvalidInput;
              }
            } else {
              resp = menus.systemBusy.getSystemBusy;
            }
            return resp;
        },

        stepfour: () => {
            return menus.cashin.getCancel; 
        },

        stepfive: (text) => {
            try {
                if (text.split("*")[4] && !isNaN(text.split("*")[4])) {
                  resp = menus.cashin.getEmployeeCode;
                } else {
                  resp = menus.invalidInput.getInvalidInput;
                }
                return resp;
              } catch (error) {
                console.log("db preauth: ", error);
            }
        },

        stepsix: async (sessionId, text, agentId, operatorId) => {

          let bankdts = await transaction.findAll({
            where: {
              session_id: sessionId,
            },
          });
    
          // get agentId, operatorId, imei, operatorCode
          let imei = bankdts[0].getDataValue("mobile1");
          let subscriberMobile = bankdts[0].getDataValue("mobile2");
          let amount = parseInt(bankdts[0].getDataValue("amount"));
          var operatorCode = text.split("*")[5];
          
          let agentCashinFlag = await agent.cashin(agentId, subscriberMobile, amount, operatorId, imei, operatorCode);

          if(agentCashinFlag.flag){
            resp = menus.cashin.getSuccess;
          } else if(agentCashinFlag.statusCode == 400){
            resp = menus.cashin.getUnknownSubscriber;
          } else if(agentCashinFlag.statusCode == 500){
            resp = menus.cashin.getMaxLimit;
          } else if(agentCashinFlag.statusCode == 404){
            resp = menus.cashin.getUnknownAgent;
          } else {
            resp = menus.cashin.getFailed;
          }
          return resp;
    }
  }
}