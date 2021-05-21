let { Transaction: transaction } = require("../../models/sequelize");
const menus = require('./subscriber');
const { walletTransfers } = require("../helpers/ussdhelpers");

var db_error = false;
module.exports = {
    wallet: {
        stepone: async (sessionId, phoneNumber) => {
            let wallet_user = phoneNumber.includes("+")? phoneNumber.substring(1): phoneNumber;

            await transaction
              .create({
                session_id: sessionId,
                transaction_type: "PHONE TRANSFER",
                mobile1: wallet_user,
              })
              .then()
              .catch((SequelizeDatabaseError) => {
                db_error = true;
                console.log("db wallet transfer start: ", SequelizeDatabaseError);
              });
            if(!db_error){
              return menus.walletTransfer.getAmount;
            } else {
              return menus.systemBusy.getSystemBusy;
            }
            
        },

        steptwo: async (text, sessionId) => {
            let amount = text.split("*")[1];

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
              .then()
              .catch((SequelizeDatabaseError) => {
                db_error = true;
                console.log("db wallet amount: ", SequelizeDatabaseError);
              });
        
            if(!db_error){
              if (text.split("*")[1] && !isNaN(text.split("*")[1])) {
                resp = menus.walletTransfer.getConfirmAmount(amount);
              } else {
                resp = menus.invalidInput.getInvalidInput;
              }
            } else {
              resp = menus.systemBusy.getSystemBusy;
            }

            return resp;
        },

        stepthree: (text) => {
            if (text.split("*")[2] && !isNaN(text.split("*")[2])) {
              resp = menus.walletTransfer.getCell;
            } else {
              resp = menus.invalidInput.getInvalidInput;
            }
            return resp;
        },

        stepfour: () => {
            return menus.walletTransfer.getCancel;
        },

        stepfive: (text, sessionId) => {
            let money = text.split("*")[1];
            let phones = text.split("*")[3];
            //Store the phone number
            transaction
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
              .then()
              .catch((SequelizeDatabaseError) => {
                console.log("db wallet phone: ", SequelizeDatabaseError);
              });
        
            if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
              resp = menus.walletTransfer.getConfirm(money, phones);
              
            } else {
              resp = menus.invalidInput.getInvalidInput;
              console.log(resp);
            }
            
            return resp;
        },

        stepsix: (text) => {
          if (text.split("*")[4] && !isNaN(text.split("*")[4])) {
            resp = menus.walletTransfer.getPin;
          } else {
            resp = menus.invalidInput.getInvalidInput;
          }
          return resp;
        },

        stepseven: () => {
          resp = menus.walletTransfer.getCancel;
          return resp;
        },

        stepeight: async (text, sessionId) => {
          
          let pin = text.split("*")[5];
          if(pin){
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

          try {
            var senderMobile = bankdts[0].getDataValue("mobile1");
            var receiverMobile = bankdts[0].getDataValue("mobile2");
            var amount = parseInt(bankdts[0].getDataValue("amount"));
          } catch (error) {
            console.log(error);
          }

          let walletTransferFlag = await walletTransfers.subscriberWalletTransfer(senderMobile, receiverMobile, amount, pin);  
          console.log(walletTransferFlag.flag);

          if (walletTransferFlag.flag) {
            // return success
            resp = menus.walletTransfer.getSuccess;
          } else if(walletTransferFlag.statusCode == 500){
            resp = menus.walletTransfer.getWrongPin;
          }else if(walletTransferFlag.statusCode == 400){
            resp = menus.walletTransfer.getUnknownSubscriber;
          } else {
            resp = menus.walletTransfer.getFailed;
          }
          return resp;
        }
      }
    }
}