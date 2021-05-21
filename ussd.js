const express = require("express");
const router = express.Router();

const gtBank = require("./routes/helpers/gtbank");
const bankTranfersLogic = require("./routes/subscriberMenus/banktransfers");
const walletTranfersLogic = require("./routes/subscriberMenus/wallettransfer");
const subscriberMenuLogic = require("./routes/subscriberMenus/mainmenu");
const newUserLogic = require("./routes/subscriberMenus/newuser");
const cashoutLogic = require("./routes/subscriberMenus/cashout");
const selfAirtimeLogic = require("./routes/subscriberMenus/airtime");
const payloanLogic = require("./routes/subscriberMenus/payloan");
const changePinLogic = require("./routes/subscriberMenus/changep");

const agentMenuLogic = require("./routes/agentMenus/mainmenu");
const cashinLogic = require("./routes/agentMenus/cashin");
const agentCashoutLogic = require("./routes/agentMenus/cashout");
const agentWalletTransferLogic = require("./routes/agentMenus/wallettransfer");
const agentBankTransfersLogic = require("./routes/agentMenus/banktransfers");

const { registration } = require("./routes/helpers/ussdhelpers");

var level, page, textPosition, isAgent, user, agentid, operatorId, agentId = "";

router.post("/", async (req, res) => {

  var { sessionId, phoneNumber, text } = req.body;
  console.log("####################", req.body);
  let response = "";

  user = phoneNumber.includes("+")? phoneNumber.substring(1): phoneNumber; 

  // Back Logic
  textArr = text.split("*");
  if (textArr.indexOf("##") != -1) {
    let index = textArr.indexOf("##");
    console.log("go back index", index);
    text = text.split("*");
    text.splice(index - 1, 2);
    console.log("go back text data cut" + textArr + "..", text);
    text = text.join("*");
    console.log("#####", text);
  }

  // Back To Menu Logic
  if (textArr.indexOf("#") != -1) {
    if(textArr[0] == "101"){
      let index = textArr.indexOf("#");
      console.log("go back menu index", index);
      text = text.split("*");
      text.splice(1, index);
      console.log("go back menu text data cut" + textArr + "..", text);
      text = text.join("*");
      console.log("#####", text);
    } else {
      let index = textArr.indexOf("#");
      console.log("go back menu index", index);
      text = text.split("*");
      text.splice(0, index + 1);
      console.log("go back menu text data cut" + textArr + "..", text);
      text = text.join("*");
      console.log("#####", text);
    }
  }

    // Check If user exists
    if(text == ""){
      var isSubscriberRegistered = await registration.isRegistered(user);
      // isSubscriberRegistered = true;
      console.log(isSubscriberRegistered);
    }
  
    if(text == "101"){
      var operator = await registration.isOperator(user);
      agentId = operator.agentId;
      operatorId = operator.id;
      console.log(operator, operatorId, agentId, operator.agentId, operator.id);
    }

  console.log("text here: ", text);
  // -------------- Subsciber Main Menu ---------------------------
  if (text == "" && isSubscriberRegistered) {
    response = await subscriberMenuLogic.subscriberMenu.stepone();
  } 
  else if (text == "8") {
    console.log('hey I am running');
    response = await subscriberMenuLogic.subscriberMenu.steptwo();
  } 
  
  // -------------- New User Menu ----------------------------
  else if (text == "" && !isSubscriberRegistered) {
    level = "firstName";
    response = newUserLogic.newuserMenu.stepone();
  } else if (
    !isSubscriberRegistered &&
    text.split("*").length == "1" &&
    level == "firstName"
  ) {
    level = "lastName";
    response = await newUserLogic.newuserMenu.steptwo(text);
  } else if (
    !isSubscriberRegistered &&
    text.split("*").length == "2" &&
    level == "lastName"
  ) {
    level = "idNumber";
    response = await newUserLogic.newuserMenu.stepthree(text);
  } else if (
    !isSubscriberRegistered &&
    text.split("*").length == "3" &&
    level == "idNumber"
  ) {
    level = "email";
    response = await newUserLogic.newuserMenu.stepfour(text);
  } else if (
    !isSubscriberRegistered &&
    text.split("*").length == "4" &&
    level == "email"
  ) {
    response = await newUserLogic.newuserMenu.stepfive(text, user, agentId);
  } 
  
  // ----------------- Check Susbcriber Balance ----------------------
  else if (text == "1") {
    let resp = await newUserLogic.balance.subscriber(user);
    response = resp;
  }

  // ----------------- Subscriber Wallet To Bank --------------------- 
  if(text == "3"){
    level = "transfers-init";
    response = await bankTranfersLogic.banktransfers.stepone(sessionId, user, level);
  } else if (
    text.split("*")[0] == "3" &&
    text.split("*").length == "2" &&
    level == "transfers-init"
  ){
    page = "1";
    level = "selectbank";
    response = await bankTranfersLogic.banktransfers.steptwo(text);
  } else if (
    text.split("*")[0] == "3" &&
    text.split("*")[2] == "0" &&
    text.split("*").length == "3"
  ) {
    page = "2";
    level = "selectbank";
    response = await bankTranfersLogic.banktransfers.stepthree(text);
  } else if (text.split("*")[0] == "3" && level == "selectbank") {
    level = "account";
    response = await bankTranfersLogic.banktransfers.stepfour(text);
  } else if (text.split("*")[0] == "3" && level == "account") {
    level = "confirm";
    let { str, textposition } = await bankTranfersLogic.banktransfers.stepfive(text, page, textPosition, gtBank, sessionId);
    console.log("Text and position: ",str, textPosition);
    page = "done";
    textPosition = textposition;
    response = str;
  } else if (
    text.split("*")[0] == "3" &&
    text.split("*")[textPosition] == "2"
  ) {
    response = await bankTranfersLogic.banktransfers.stepsix();
  } else if (
    text.split("*")[0] == "3" &&
    text.split("*")[textPosition] == "1" &&
    level != "bank_pin"
  ) {
    level = "bank_pin";
    response = await bankTranfersLogic.banktransfers.stepseven();
  } else if(
    text.split("*")[0] == "3" &&
    level == "bank_pin" &&
    text.split("*")[text.split("*").length -1]
  ){ 
    response = await bankTranfersLogic.banktransfers.stepeight(text, sessionId, gtBank, user);
  }

  // ------------- START CASHOUT -------------------
  else if (text == "5") {
    response = cashoutLogic.atmCashout.stepone();
  } else if(
    text.split("*")[0] == "5" &&
    text.split("*")[1] == "1" &&
    text.split("*").length == "1"
  ){
    response = cashoutLogic.atmCashout.steptwo();
  } else if (
    text.split("*")[0] == "5" &&
    text.split("*")[1] == "1" &&
    text.split("*").length == "2"
  ) {
    response = cashoutLogic.atmCashout.stepthree();
  } else if (
    text.split("*")[0] == "5" &&
    text.split("*")[1] == "1" &&
    text.split("*").length == "3"
  ) {
    response = cashoutLogic.atmCashout.stepfour(text);
  } else if (
    text.split("*")[0] == "5" &&
    text.split("*")[1] == "1" &&
    text.split("*").length == "4"
  ) {
    response = cashoutLogic.atmCashout.stepfive(text);
  }

  // ---------------- START Wallet/Phone Transfer ---------------
  else if (text == "2") {
    response = await walletTranfersLogic.wallet.stepone(sessionId, phoneNumber);
  } else if (text.split("*")[0] == "2" && text.split("*").length == "2") {
    response = await walletTranfersLogic.wallet.steptwo(text, sessionId);
  } else if (
    text.split("*")[0] == "2" &&
    text.split("*")[2] == "1" &&
    text.split("*").length == "3"
  ) {
    response = await walletTranfersLogic.wallet.stepthree(text);
  } else if (
    text.split("*")[0] == "2" &&
    text.split("*")[2] == "2" &&
    text.split("*").length == "3"
  ) {
    response = await walletTranfersLogic.wallet.stepfour();
  } else if (text.split("*")[0] == "2" && 
    text.split("*").length == "4"
    ) {
    response = await walletTranfersLogic.wallet.stepfive(text, sessionId);
  } else if (
    text.split("*")[0] == "2" &&
    text.split("*")[4] == "1" &&
    text.split("*").length == "5"
  ) {
    response = await walletTranfersLogic.wallet.stepsix(text);
  } else if (
    text.split("*")[0] == "2" &&
    text.split("*")[4] == "2" &&
    text.split("*").length == "5"
  ) {
    response = await walletTranfersLogic.wallet.stepseven();
  } else if (text.split("*")[0] == "2" && text.split("*").length == "6") {
    response = await walletTranfersLogic.wallet.stepeight(text, sessionId);
  }

  // ------------------ Start Buy Airtime ---------------------
  else if (text.split("*")[0] == "6" && text.split("*").length == "1") {
    response = await selfAirtimeLogic.airtime.stepone();
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[1] == "1" &&
    text.split("*").length == "2"
  ) {
    response = await selfAirtimeLogic.airtime.steptwo(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[1] == "1" &&
    text.split("*").length == "3"
  ) {
    response = await selfAirtimeLogic.airtime.stepthree(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[3] == "1" &&
    text.split("*").length == "4"
  ) {
    response = await selfAirtimeLogic.airtime.stepfour(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[3] == "2" &&
    text.split("*").length == "4"
  ) {
    response = await selfAirtimeLogic.airtime.stepfive(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "2"
  ) {
    response = await selfAirtimeLogic.otherAirtime.stepone(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "3"
  ) {
    response = await selfAirtimeLogic.otherAirtime.steptwo(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "4"
  ) {
    response = await selfAirtimeLogic.otherAirtime.stepthree(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "5"
  ) {
    response = await selfAirtimeLogic.otherAirtime.stepfour(text);
  } else if (
    text.split("*")[0] == "6" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "6"
  ) {
    response = await selfAirtimeLogic.otherAirtime.stepfive(text);
  }

  // ------------------- START PAY LOAN -------------
  else if (text.split("*")[0] == "4" && text.split("*").length == "1") {
    response = await payloanLogic.payloan.stepone(agentid);
  } else if (text.split("*")[0] == "4" && text.split("*").length == "2") {
    response = await payloanLogic.payloan.steptwo(text);
  } else if (text.split("*")[0] == "4" && text.split("*").length == "3") {
    response = await payloanLogic.payloan.stepthree(text, agentid);
  }

  // -------------- START CHANGE PIN -------------
  else if (text.split("*")[0] == "7" && text.split("*").length == "1") {
    response = await changePinLogic.changepin.stepone(sessionId, phoneNumber);
  } else if (text.split("*")[0] == "7" && text.split("*").length == "2") {
    response = await changePinLogic.changepin.steptwo(text);
  } else if (text.split("*")[0] == "7" && text.split("*").length == "3") {
    response = await changePinLogic.changepin.stepthree();
  } else if (text.split("*")[0] == "7" && text.split("*").length == "4") {
    response = await changePinLogic.changepin.stepfour(text, phoneNumber);
  }

  // ---------------- My Aku --------------------------------------------
  else if (text == "8*10") {
    response = await newUserLogic.myaku.stepone(phoneNumber);
  }

  // ---------------- Fund My Aku --------------------------------------------
  else if (text == "8*9") {
    response = await newUserLogic.fundaku.stepone();
  }

  // -------------------- AGENT APP FLOW ---------------------------
  else if (text == "101") {
    response = await agentMenuLogic.mainmenu.stepone();
  }

  // ----------------- Check Balance -----------------------------
  else if (text.split("*")[0] == "101" && text.split("*")[1] == "1" && text.split("*").length == 2) {
    response = await newUserLogic.balance.agent(agentId);
  }

  // ------------------ START Agent Wallet Transfer ----------------------------
  else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "2"
  ) {
    response = await agentWalletTransferLogic.wallet.stepone(sessionId, phoneNumber);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "3"
  ) {
    response = await agentWalletTransferLogic.wallet.steptwo(text, sessionId);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*")[3] == "1" &&
    text.split("*").length == "4"
  ) {
    response = await agentWalletTransferLogic.wallet.stepthree(text);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*")[3] == "2" &&
    text.split("*").length == "4"
  ) {
    response = await agentWalletTransferLogic.wallet.stepfour();
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "5"
  ) {
    response = await agentWalletTransferLogic.wallet.stepfive(text, sessionId);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*")[5] == "1" &&
    text.split("*").length == "6"
  ) {
    response = await agentWalletTransferLogic.wallet.stepsix(text);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*")[5] == "2" &&
    text.split("*").length == "6"
  ) {
    response = await agentWalletTransferLogic.wallet.stepseven();
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "2" &&
    text.split("*").length == "7"
  ) {
    response = await agentWalletTransferLogic.wallet.stepeight(text, sessionId, agentId, operatorId);
  }

  // ------------------------------- START Agent Bank Transfers -------------------
  else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    text.split("*").length == "2"
  ) {
    level = "transfers-init";
    response = await agentBankTransfersLogic.banktransfers.stepone(sessionId, phoneNumber);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    text.split("*").length == "3" &&
    level == "transfers-init"
  ) {
    page = "1";
    level = "selectbank";
    response = await agentBankTransfersLogic.banktransfers.steptwo(text);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    text.split("*")[3] == "0" &&
    text.split("*").length == "4"
  ) {
    page = "2";
    level = "selectbank";
    response = await agentBankTransfersLogic.banktransfers.stepthree(text);
  }
  else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    level == "selectbank"
  ) {
    level = "account";
    response = await agentBankTransfersLogic.banktransfers.stepfour(text);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    level == "account"
  ) {
    level = "confirm";
    let { str, textposition } = await agentBankTransfersLogic.banktransfers.stepfive(text, page, textPosition, gtBank, sessionId);
    console.log("Text and position: ",str, textPosition);
    page = "done";
    textPosition = textposition;
    response = str;
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    text.split("*")[textPosition] == "2"
  ) {
    response = await agentBankTransfersLogic.banktransfers.stepsix();
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    text.split("*")[textPosition] == "1" &&
    level != "bank_pin"
  ) {
    level = "bank_pin";
    response = await agentBankTransfersLogic.banktransfers.stepseven();
  } else if(
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "3" &&
    level == "bank_pin" &&
    text.split("*")[text.split("*").length -1]
  ){ 
    response = await agentBankTransfersLogic.banktransfers.stepeight(text, sessionId, gtBank, phoneNumber, agentId, operatorId);
  }
  // ------------------- END Agent Bank Transfer ---------------------

  // ------------------- START Agent Cashin ----------------------------
  else if (
  text.split("*")[0] == "101" &&
  text.split("*")[1] == "5" && 
  text.split("*").length === 2) {
    response = await cashinLogic.cashin.stepone(user, sessionId);
  } else if (    
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "5" && 
    text.split("*").length == 3) {
      response = await cashinLogic.cashin.steptwo(text, sessionId);  
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "5" && 
    text.split("*").length == 4) {
      response = await cashinLogic.cashin.stepthree(text, sessionId);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "5" &&
    text.split("*")[4] == "2" &&
    text.split("*").length == 5
  ) {
    response = await cashinLogic.cashin.stepfour();
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "5" && 
    text.split("*").length == 5) {
      response = await cashinLogic.cashin.stepfive(text);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "5" && 
    text.split("*").length == 6) {
      response = await cashinLogic.cashin.stepsix(sessionId, text, agentId, operatorId);
  }
  // -------------------- END AGENT CASHIN --------------------

  // -------------------- START Agent Buy Airtime --------------------
    else if (    
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" && 
      text.split("*").length == "2") {
        response = await selfAirtimeLogic.airtime.stepone();
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[2] == "1" &&
      text.split("*").length == "3"
    ) {
      response = await selfAirtimeLogic.airtime.steptwo(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[2] == "1" &&
      text.split("*").length == "4"
    ) {
      response = await selfAirtimeLogic.airtime.stepthree(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[4] == "1" &&
      text.split("*").length == "5"
    ) {
      response = await selfAirtimeLogic.airtime.stepfour(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[4] == "2" &&
      text.split("*").length == "5"
    ) {
      response = await selfAirtimeLogic.airtime.stepfive(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[2] == "2" &&
      text.split("*").length == "3"
    ) {
      response = await selfAirtimeLogic.otherAirtime.stepone(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[2] == "2" &&
      text.split("*").length == "4"
    ) {
      response = await selfAirtimeLogic.otherAirtime.steptwo(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[2] == "2" &&
      text.split("*").length == "5"
    ) {
      response = await selfAirtimeLogic.otherAirtime.stepthree(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[2] == "2" &&
      text.split("*").length == "6"
    ) {
      response = await selfAirtimeLogic.otherAirtime.stepfour(text);
    } else if (
      text.split("*")[0] == "101" &&
      text.split("*")[1] == "6" &&
      text.split("*")[2] == "2" &&
      text.split("*").length == "7"
    ) {
      response = await selfAirtimeLogic.otherAirtime.stepfive(text);
    }

  // --------------- Start Cashout --------------------------
  else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "4" &&
    text.split("*").length == "2"
  ) {
    response = await agentCashoutLogic.cashout.stepone(phoneNumber, sessionId);
  } else if(
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "4" &&
    text.split("*").length == "3"
  ){
    response = await agentCashoutLogic.cashout.steptwo(text, sessionId);
  } else if (
    text.split("*")[0] === "101" &&
    text.split("*")[1] == "4" &&
    text.split("*").length == 4
  ) {
    response = await agentCashoutLogic.cashout.stepthree(text, sessionId);
  } else if (
    text.split("*")[0] === "101" &&
    text.split("*")[1] == "4" &&
    text.split("*")[4] == "1" &&
    text.split("*").length == 5
  ) {
    response = await agentCashoutLogic.cashout.stepfour();
  } else if (
    text.split("*")[0] === "101" &&
    text.split("*")[1] == "4" &&
    text.split("*")[4] == "2" &&
    text.split("*").length == 5
  ) {
    response = await agentCashoutLogic.cashout.stepfive();
  } else if (
    text.split("*")[0] === "101" &&
    text.split("*")[1] == "4" &&
    text.split("*").length == 6
  ) {
    response = await agentCashoutLogic.cashout.stepsix(text, sessionId);
  } else if (
    text.split("*")[0] === "101" &&
    text.split("*")[1] == "4" &&
    text.split("*").length == 7
  ) {
    response = await agentCashoutLogic.cashout.stepseven(text, sessionId, agentId, operatorId);
  }

  // ------------------- START AGENT PAY LOAN -------------
  else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "7" && 
    text.split("*").length == "2") {
      response = await payloanLogic.payloan.stepone(agentid);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "7" && 
    text.split("*").length == "3") {
      response = await payloanLogic.payloan.steptwo(text);
  } else if (
    text.split("*")[0] == "101" &&
    text.split("*")[1] == "7" && 
    text.split("*").length == "4") {
      response = await payloanLogic.payloan.stepthree(text, agentid);
  }

  res.set("Content-Type: text/plain");
  if (res.status == "200") {
    response = `System Busy Please try again sometime later.`;
  }

  res.send(response);
  // DONE!!!
});


module.exports = {
  router: router,
};
