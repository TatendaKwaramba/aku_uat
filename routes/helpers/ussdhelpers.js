const axios = require("axios");
const uuid = require('uuid');
const dotenv = require('dotenv').config();

module.exports = {
  registration: {
    isRegistered: async (mobile) => {
      let subscriberMobile = `${process.env.SERVICE_SUBSCRIBER}/api/v1/subscriber-mobile/${mobile}`;
      let flag = false;
      try {
        await axios
          .get(subscriberMobile)
          .then((res) => {
            let {data} = res;
            if (data.status == "ACTIVE") {
              console.log("Subscriber: ", data);
              flag = true;
            } else {
              console.log("False: ", res);
            }
          })
          .catch(function (error) {
            console.log("isRegistered?:", error);
          });
          return flag;
      } catch (error) {
        console.log(error);
      }
    },

    myAku: async (mobile) => {
      let subscriberMobile = `${process.env.SERVICE_SUBSCRIBER}/api/v1/subscriber-mobile/${mobile}`;
      let subscriberBalance = `http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/subscriber-balance/${mobile}`;
      let info = {};
      try {
        await axios
          .get(subscriberMobile)
          .then((res) => {
            let {data} = res;
            if (data.status == "ACTIVE") {
              console.log("Subscriber: ", data);
              info.mobile = data.mobile;
              info.fname = data.firstname;
              info.lname = data.lastname;
              info.email = data.email;
              info.registrationDate = data.registrationDate;
            } else {
              console.log("False: ", res);
            }
          })
          .catch(function (error) {
            console.log("isRegistered?:", error);
          });
          
          await axios
          .get(subscriberBalance)
          .then((res) => {
            info.amount = res.data.amount;
          })
          .catch(function (error) {
            console.log("Subscriber Balance:", error);
          });
      } catch (error) {
        console.log(error);
      }
      return info;
    },

    selfRegistration: async (mobile, email, firstname, lastname, idNumber, agentId) => {
      let url = `http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/self-registration`;
      let originalRef = uuid.v4(); // generate code here
      let flag = false;
      let data = {
        mobile,
        email,
        firstname,
        lastname,
        idNumber,
        subscriberProfile: 1,
        agentId: 5,
        originalRef,
        channel: "USSD"
      };
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Self Registration: ", data);
            if(data.status == "COMPLETE"){
              console.log("returned true");
              flag = true;
            } else {
              console.log("returned false");
              flag = false;
            }
          })
          .catch(function (error) {
            console.log("Self Registration: ", error);
          });
      } catch (error) {
        console.log(error);
      }
      return flag;
    },

    isAgent: async (mobile) => {
      let agentMobile = `http://138.68.87.244:8400/api/v1/retrieve-agent/mobile/${mobile}`;
      let flag;
      try {
        await axios
          .get(agentMobile)
          .then((res) => {
            let {data} = res;
            if (data.status == "ACTIVE") {
              flag = true;
            } else {
              flag = false;
            }
          })
          .catch(function (error) {
            console.log("Agent Is Registered?:", error);
          });
      } catch (error) {
        console.log(error);
      }
      return flag;
    },

    isOperator: async (mobile) => {
      let agentMobile = `http://138.68.87.244:8400/api/v1/retrieve-operator-mobile/${mobile}`;
      let operator = {};
      try {
        await axios
          .get(agentMobile)
          .then((res) => {
            let {data} = res;
            if (data.status == "ACTIVE") {
              operator.status = true;
              operator.id = data.id;
              operator.agentId = data.agentId;
            } else {
              flag = false;
            }
          })
          .catch(function (error) {
            console.log("Is Operator? :", error);
          });
      } catch (error) {
        console.log(error);
      }
      return operator;
    },

    changePin: async (mobile, oldPin, newPin) => {
      mobile = mobile.startsWith('263')? mobile.replace('263', '234'): mobile;
      let agentMobile = `http://api-akupay.jugaad.co.zw:8300/api/v1/subscriber-change-pin/${mobile}/${oldPin}/${newPin}`;
      let flag = false;
      try {
        await axios
          .put(agentMobile)
          .then((res) => {
            let {data} = res;
            console.log(res);
            if (res.status == 200) {
              flag = true;
            } else {
              flag = false;
            }
          })
          .catch(function (error) {
            console.log("SUbscriber Change Pin :", error);
          });
      } catch (error) {
        console.log(error);
      }
      return flag;
    },
  },

  balance: {
    subscriberBalance: async (mobile) => {
      let subscriberMobile = `http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/subscriber-balance/${mobile}`;
      let amount = 0;
      try {
        await axios
          .get(subscriberMobile)
          .then((res) => {
            amount = res.data.amount;
          })
          .catch(function (error) {
            console.log("Subscriber Balance:", error);
          });
      } catch (error) {
        console.log(error);
      }
      return amount;
    },

    agentBalance: async (agentId) => {
      let agentMobile = `http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/agent-balance-id/${agentId}`;
      let details = {};
      try {
        await axios
          .get(agentMobile)
          .then((res) => {
            details.accountBalance = res.data.accountBalance? res.data.accountBalance: "0";
            details.commissionBalance = res.data.commissionBalance? res.data.commissionBalance: "0";
            details.totalAmount = res.data.totalAmount? res.data.totalAmount: "0";
          })
          .catch(function (error) {
            console.log("Agent Balance:", error);
          });
      } catch (error) {
        console.log(error);
      }
      return details;
    },
  },

  walletTransfers: {
    subscriberWalletTransfer: async (senderMobile, receiverMobile, amount, pin) => {
      let url = 'http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/wallet-transfer';
      let data = {
        senderMobile,
        receiverMobile,
        amount,
        pin,
        channel: "USSD"
      };
      let info = {};
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Subscriber Wallet Transfer: ", data);
            if(data.status == "COMPLETE"){
              info.flag = true;
            }
          })
          .catch(function (error) {
            console.log("Subscriber Wallet Transfer Catch Response: ", error);
            info.flag = false;
            
            try {
              info.statusCode = error.response.data.statusCode  
            } catch (error) {
              console.log(error)
            }
          });
      } catch (error) {
        console.log("Catch Error: ", error);
        info.flag = false;
        info.statusCode = error.response.status;
      } 
      console.log("Inside: ", info);
      return info; 
    },

    agentWalletTransfer: async (senderAgentId, receiverAgentMobile, amount, operatorId, operatorCode) => {
      let url = 'http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/agent-transfer';
      let info = {};
      let data = {
        senderAgentId,
        receiverAgentMobile,
        amount,
        operatorId,
        operatorCode,
        channel: "USSD"
      };
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Agent Wallet Transfer: ", data);
            if(data.status == "COMPLETE"){
              info.flag = true;
            }
          })
          .catch(function (error) {
            console.log("Agent Wallet Transfer Catch Response: ", error.response, error.response.data);
            info.flag = false;
            
            try {
              info.statusCode = error.response.data.statusCode  
            } catch (error) {
              console.log(error)
            }
          });
      } catch (error) {
        console.log(error);
      }
      return info;
    },
  },

  walletToBank: {
    subscriberWalletToBank: async (subscriberMobile, bank, bankCode, bankAccount, amount, pin) => {
      let url = 'http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/wallet-to-bank';
      let data = {
        subscriberMobile,
        bank,
        bankCode,
        bankAccount,
        amount,
        pin,
        channel: "USSD"
      }

      let info = {};
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Subscriber Wallet To Bank Transfer: ", data);
            if(data.status == "COMPLETE"){
              info.flag = true;
              info.akuTransferTransactionReference = data.transactionId;
            }
          })
          .catch(function (error) {
            console.log("Subscriber Wallet To Bank Transfer Catch Response: ", error.response, error.response.data);
            info.flag = false;
            
            try {
              info.statusCode = error.response.data.statusCode  
            } catch (error) {
              console.log(error)
            }
          });
      } catch (error) {
        console.log(error);
      }
      return info;
    },

    subscriberBankToWallet: async (subscriberMobile, bank, bankCode, bankAccount, amount, pin) => {
      let url = `http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/bank-to-wallet`;
      let flag = false;
      let data = {
        subscriberMobile,
        bank,
        bankCode,
        bankAccount,
        amount,
        pin,
        channel: "USSD"
      }
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Subscriber Bank To Wallet Transfer: ", data);
            if(data.status == "COMPLETE"){
              flag = true;
            } else {
              flag = false;
            }
          })
          .catch(function (error) {
            console.log("Subscriber Bank To Wallet Transfer: ", error);
          });
      } catch (error) {
        console.log(error);
      }
      return flag;
    },

    agentWalletToBank: async (agentId, bankId, amount, operatorId, operatorCode) => {
      let url = 'http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/agent-wallet-to-bank';
      let details = {};
      let data = {
        agentId,
        bankId,
        amount,
        operatorId,
        operatorCode,
        channel: "USSD"
      };
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Agent Wallet To Bank Transfer: ", data);
            if(data.status == "COMPLETE"){
              details.status = true;
              details.transactionId = data.transactionId
            }
          })
          .catch(function (error) {
            console.log("Agent Wallet To Bank Transfer Catch Response: ", error.response, error.response.data);
            details.status = false;
            try {
              details.statusCode = error.response.data.statusCode
            } catch (error) {
              
            }
          });
      } catch (error) {
        console.log(error);
      }
      return details;
    },
  },

  agent: {
    cashin: async (agentId, subscriberMobile, amount, operatorId, imei, operatorCode) => {
      let url = `http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/cash-in`;
      let info = {};
      let data = {
        agentId,
        subscriberMobile,
        amount,
        operatorId,
        imei,
        operatorCode,
        channel: "USSD"
      };
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Agent Cashin: ", data);
            if(data.status == "COMPLETE"){
              info.flag = true;
            }
          })
          .catch(function (error) {
            console.log("Agent Cashin Catch Response: ", error.response);
            info.flag = false;
            
            try {
              info.statusCode = error.response.data.statusCode  
            } catch (error) {
              console.log(error)
            }
          });
      } catch (error) {
        console.log(error);
      }
      return info;
    },

    cashout: async (agentId, subscriberMobile, pin, amount, operatorId, imei, operatorCode) => {
      let url = encodeURI(`http://api-akupay.jugaad.co.zw:8105/api/v1/transactions/cash-out`);
      let info = {};
      let data = {
        agentId,
        subscriberMobile,
        pin,
        amount,
        operatorId,
        imei,
        operatorCode,
        channel: "USSD"
      };
      console.log(data);
    
      try {
        await axios
          .post(url, data)
          .then((res) => {
            let { data } = res;
            console.log("Agent Cashout: ", data);
            if(data.status == "COMPLETE"){
              info.flag = true;
            }
          })
          .catch(function (error) {
            console.log("Agent Cashout Catch Response: ", error.response, error.response.data);
            info.flag = false;
            
            try {
              info.statusCode = error.response.data.statusCode  
            } catch (error) {
              console.log(error)
            }
          });
      } catch (error) {
        console.log(error);
      }
      return info;
    },
  }
}