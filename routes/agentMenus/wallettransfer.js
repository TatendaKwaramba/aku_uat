let { Transaction: transaction } = require("../../models/sequelize");

const { walletTransfers } = require("../helpers/ussdhelpers");
const menus = require('./agent');

let dbStatus = false;
module.exports = {
    wallet: {
        stepone: async (sessionId, phoneNumber) => {
            let wallet_user;
            wallet_user = phoneNumber.includes("+")? phoneNumber.substring(1): phoneNumber; 
            
            try {
              await transaction
              .create({
                session_id: sessionId,
                transaction_type: "PHONE TRANSFER",
                mobile1: wallet_user,
              })
              dbStatus = true;  
            } catch (error) {
              console.log(error);
            }

            if(dbStatus){
              resp = menus.walletTransfer.getAmount;
            } else {
              resp = menus.systemBusy.getSystemBusy;
            }
            return resp;
        },

        steptwo: async (text, sessionId) => {
            let amountss = text.split("*")[2];
            console.log("S5 Data Entered: ", text);

            try {
              await transaction
              .update(
                {
                  amount: amountss,
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
                resp = menus.walletTransfer.getConfirm(amountss);
              } else {
                resp = menus.invalidInput.getInvalidInput;
              }
            } else {
              resp = menus.systemBusy.getSystemBusy;              
            }  
            return resp;
        },

        stepthree: (text) => {
            if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
              resp = menus.walletTransfer.getRecipient;
            } else {
              resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },

        stepfour: () => {
            return menus.walletTransfer.getCancel;
        },

        stepfive: async (text, sessionId) => {
            let money = text.split("*")[2];
            let phones = text.split("*")[4];

            try {
              await transaction
              .update(
                {
                  mobile2: phones,
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
              if (text.split("*")[4] && !isNaN(text.split("*")[4])) {
                resp = menus.walletTransfer.getConfirmAll(money, phones);
              } else {
                resp = menus.invalidInput.getInvalidInput;
              }
            } else {
              resp = menus.systemBusy.getSystemBusy;              
            }  
            return resp;
        },

        stepsix: (text) => {
          if (text.split("*")[5] && !isNaN(text.split("*")[5])) {
            resp = menus.walletTransfer.getPin;
          } else {
            resp = menus.invalidInput.getInvalidInput;
          }
          return resp;
        },

        stepseven: () => {
          return menus.walletTransfer.getCancel;
        },

        stepeight: async (text, sessionId, agentId, operatorId) => {
          
          let operatorCode = text.split("*")[6];
          if(operatorCode){
          let bankdts = await transaction
            .findAll({
              where: {
                session_id: sessionId,
              },
            })
            .then()
            .catch((SequelizeDatabaseError) => {
              console.log("db wallet fetch: ", SequelizeDatabaseError);
            });

          // Get operatorId, operatorCode, agentId
          let receiverAgentMobile = bankdts[0].getDataValue("mobile2");
          let amount = parseInt(bankdts[0].getDataValue("amount")); // use if expression for nulls

          let walletTransferFlag = await walletTransfers.agentWalletTransfer(agentId, receiverAgentMobile, amount, operatorId, operatorCode);  
          console.log(walletTransferFlag);
          if (walletTransferFlag.flag) {
            resp = menus.walletTransfer.getSuccess;
          } else if(walletTransferFlag.statusCode == 400){
            // agent does not exist
            resp = menus.walletTransfer.getAgentNull;
          } else if(walletTransferFlag.statusCode == 404){
            // wrong pin
            resp = menus.walletTransfer.getWrongPin;
          } else {
            resp = menus.walletTransfer.getFailed;
          }
          return resp;
        }
      }
    }
}