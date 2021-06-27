let {
    Transaction: transaction,
    BanksDict: bankdictionary,
    BankTransfer: banktransfer,
  } = require("../../models/sequelize");
const menus = require('./agent');

const { walletToBank } = require("../helpers/ussdhelpers");
  
  let dbStatus = false;
  module.exports = {
    banktransfers: {
      stepone: async (sessionId, phoneNumber) => {
        try {
          await transaction
            .create({
              session_id: sessionId,
              mobile1: phoneNumber,
            });
          dbStatus = true;
        } catch (error) {
          console.log("Show error:", error);
        }
  
        if(dbStatus){
          resp = menus.bankTransfers.getamount;
        } else {
          resp = menus.systemBusy.getSystemBusy;
        }
        return resp;
      },
  
      steptwo: (text) => {
        if (text.split("*")[2] && !isNaN(text.split("*")[2])) {
          return menus.bankTransfers.getFirstBanks;
        } else {
          return menus.invalidInput.getInvalidInput;
        }
      },
  
      stepthree: (text) => {
        if (text.split("*")[3] && !isNaN(text.split("*")[3])) {
          return menus.bankTransfers.getSecondBanks;
        } else {
          return menus.invalidInput.getInvalidInput;
        }
      },
  
      stepfour: (text) => {
        if (
          !text.endsWith("0") &&
          text.split("*")[text.split("*").length - 1] <= process.env.numberOfBanks
        ) {
          return menus.bankTransfers.getAccount;
        } else {
          return menus.invalidInput.getInvalidInput;
        }
      },
  
      stepfive: async (text, page, textPosition, gtBank, sessionId) => {
        console.log("Step Five Starting" + text + page + textPosition + gtBank + sessionId);
        var bankDataAccount;
        var bankDataBank;
        var bankDataAmount = text.split("*")[2];
  
        var getBankData = [];
        //set account
        switch (page) {
          case "1":
            // code block
            bankDataAccount = text.split("*")[4];
            bankDataBank = text.split("*")[3];
            textPosition = 5;
  
            //await bank details
            getBankData = await gtBank.gtGetBankDetails(
              bankDataBank,
              sessionId,
              bankDataAccount,
              bankDataAmount
            );
  
            break;
          case "2":
            // code block
            bankDataAccount = text.split("*")[5];
            bankDataBank = text.split("*")[4];
            textPosition = 6;
  
            //await bank details
            getBankData = await gtBank.gtGetBankDetails(
              bankDataBank,
              sessionId,
              bankDataAccount,
              bankDataAmount
            );
  
            break;
          default:
            // code block
            break;
        }
  
        console.log("text position ", textPosition);
        if (!bankDataAccount && isNaN(bankDataAccount)) {
          return menus.invalidInput.getInvalidInput;
        } else {
          return {
            str: menus.bankTransfers.getConfirm(bankDataAccount, bankDataAmount),
            textposition: textPosition,
          };
        }
      },
  
      stepsix: () => {
        return menus.bankTransfers.getCancel;
      },
  
      stepseven: () => {
        return menus.bankTransfers.getPin;
      },
  
      stepeight: async (text, sessionId, gtBank, phoneNumber, agentId, operatorId) => {
        // get bank data
        let operatorCode = text.split("*")[text.split("*").length - 1];
        var resp;
  
        const { bankCode, bankAccount, bankAmount } = await getSessionData(banktransfer, sessionId);
        
        //  get bank dictionary data
        const { bankName, bankSortCode } = await getAdditionalData(bankdictionary, bankCode);
  
        // do account validation
        if (bankName == "Guaranty Trust Bank") {
          var { accountName, responseCode } = await internalAccountValidation(gtBank, bankAccount);
        } else {
          var { accountName, responseCode} = await externalAccountValidation(gtBank, bankAccount, bankCode);
        }
        
        if (responseCode == "404"){
          resp = menus.bankTransfers.getValidationFailed
          return resp;
        }

        if(responseCode == "1000"){
          // run wallet to bank
          let details = await walletToBank.agentWalletToBank(agentId, bankCode, parseInt(bankAmount), operatorId, operatorCode);
          let akuTransferTransactionReference = details.transactionId;
          let walletToBankFlag = details.status;

          // if success then gtTransfer
          if(walletToBankFlag){
            // run the gtTransfer
            var {code} = await gtBank.gtTransfer(
              bankName,
              bankCode,
              bankSortCode,
              bankAccount,
              bankAmount,
              akuTransferTransactionReference,
              akuTransferTransactionReference,
              phoneNumber
            );
            // return success to the user
            if(code == "1000"){
              // success
              resp = menus.bankTransfers.getSuccess(accountName);
            } else if(code == "1100"){
              // pending
              resp = menus.bankTransfers.getPENDING;
            } else {
              // failed
              resp = menus.bankTransfers.getFailed;
            }
          } else if(details.statusCode = 404){
            // wrong pin
            resp = menus.bankTransfers.getWrongPin;
          } else {
            // transfer failed
            resp = menus.bankTransfers.getFailed;
          }
        } else {
          //return bank validation failed
          resp = menus.bankTransfers.getValidationFailed;
        }
        return resp;
      },
    },
  };

  async function getSessionData(banktransfer, sessionId) {
    let data = {};
    try {
      var sessionData = await banktransfer.findOne({
        where: { session_id: sessionId },
      });
    } catch (error) {
      console.log(error);
    }
  
    data.bankCode = sessionData
      ? sessionData.getDataValue("transfer_code")
      : null;
    data.bankAccount = sessionData
      ? sessionData.getDataValue("recipient_code")
      : null;
    data.bankAmount = sessionData
      ? sessionData.getDataValue("message")
      : null;
    
    return data;
  }
  
  async function getAdditionalData(bankdictionary, bankCode) {
    try {
      var additionalData = await bankdictionary.findOne({
        where: { code: bankCode },
      });
      console.log(additionalData)
    } catch (error) {
      console.log(error);
    }
  
    let data = {};
    data.bankName = additionalData
      ? additionalData.getDataValue("actual_name")
      : null;
    data.bankSortCode = additionalData
      ? additionalData.getDataValue("sort_code")
      : null;
  
    return data;
  }
  
  async function internalAccountValidation(gtBank, bankAccount) {
    try {
      var { account: accountName, code: responseCode } = await gtBank.gtAccountValidation(
        bankAccount
      );  
      return { accountName, responseCode };
    } catch (error) {
      console.log(error);
    }
  }
  
  async function externalAccountValidation(gtBank, bankAccount, bankCode) {
    try {
      var { account: accountName, code: responseCode } = await gtBank.gtAccountValidationInOther(
        bankAccount,
        bankCode
      );
      return { accountName, responseCode };
    } catch (error) {
      console.log(error);
    }
  }
  