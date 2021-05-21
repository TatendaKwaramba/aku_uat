const assert = require('chai').assert;
const app = require('../ussd');
const transaction = require("../models/transaction");
var bank = require("../models/banks");
const banktransfer = require("../models/bankTransfers");
const router = require('../ussd');
const https = require('https');
const sinon = require('sinon');
const { query } = require('express');
const { expect } = require('chai');
const nock = require('nock');
const chaiHttp = require('chai-http');
const { send } = require('process');
const chai = require('chai')
    , should = chai.should();
const server = require('../app').app;


chai.use(chaiHttp);


var sender = '2348059090647';
var phone = '+2348059090647';
var serviceCode = "*384*24828#";
var reciever = '263773806130';
var sessionId = Math.random().toString(36).slice(2);
var account = '0000000000';
var bank_id = '10';
var bank_code = '011';
var bank_name = 'First Bank Of Nigeria';
var pin = '1234';
var employee_code = '14433';
var amount = "500";
var preauthCode = "7D219F4DEC03AD8CAF02E6B46E037FF51443350000000000002348059090647ussd";

var testText = "";

var req = {
  phoneNumber: phone,
  sessionId: sessionId,
  serviceCode: serviceCode,
  text: "",
};

var res = {};

function mockPost(expectedText, data){

  chai
  .request("http://localhost:4000")
  .post("/")
  .send(data)
  .then((res) => {
    assert.equal(
      res.text,
      expectedText
    );
    assert.equal(res.status, 200);
  }).catch((err) => console.log(err));

}


describe('USSD', function(){
  
    it('Test First Time User: Confirm PIN', function(){
        req.text = "null";
        req.phoneNumber = "+2348059090777";

        mockPost("END Invalid Input", req); 
    });

    it('Test Transfers MENU: ', function(){
      req.text = "1";
      expectedText = 'CON Transfers Menu\n' +
      '                1. Bank Transfers\n' +
      '                2. Wallet Transfers\n' +
      '                3. Wallet To Bank Transfers';

      mockPost(expectedText, req);
    });

    it('TEST Bank Transfer: Enter Amount', function(){
      req.text = "1*1";
      mockPost("CON Enter amount to transfer to your bank", req);

      req.text = "1*1*c";
      mockPost("END Invalid Input!! \n", req);

      req.text = "1*1*10*rg";
      req.level= "account";
      mockPost("END Invalid account number", req);

      req.text = "1*1*45*10*0000000000*1";
      req.level= "confirm";
      mockPost("CON Please Enter your PIN", req);

      req.text = "1*1*45*10*0000000000*1*1234";
      req.level= "transfer";
      mockPost("END Transfer Failed to complete", req);
    });

    it('Cashin validation', function(){
      req.text = "3*26d*";
      mockPost('END Invalid Input!! \n', req);

      req.text = "3*263*rg";
      mockPost('END Invalid Input!! \n', req);

      req.text = "3*263*10*1*12f4";
      mockPost('END Invalid Input!! \n', req);

      req.text = "3*263*10*1*1234*14433";
      mockPost('END Cashin Transaction is being processed you will receive a message shortly', req);
    });

    it('Cashout', function(){
      req.text = "2*r";
      mockPost('END Invalid Input!! \n', req);

      //amount
      req.text = "2*263*5u";
      mockPost('END Invalid Input!! \n', req);

      //confirm
      req.text = "2*263*56*";
      mockPost('END Invalid Input!! \n', req);
    });

    it('Wallet Transfer', function(){

      //you are about to
      req.text = "1*2*5f";
      mockPost('Invalid Input!!', req);

      //enter mobile number after confirm
      req.text = "1*2*56*1";
      mockPost(`CON > Enter mobile number you're sending money to.`, req);

      //cancel transfer
      req.text = "1*2*56*2";
      mockPost('END Transfer was cancelled', req);

      //confirm transfer
      req.text = "1*2*56*2*26d";
      mockPost('END Invalid Input', req);

      //cancel transfer
      req.text = "1*2*56*2*263*2";
      mockPost('cancel', req);

      //employee confirm
      req.text = "1*2*56*2*263*1s";
      mockPost('employee', req);

      //finish
      req.text = "1*2*56*2*263*1*14433";
      mockPost('END > Transfer processed successfully', req);

      //finish
      req.text = "1*2*56*2*263*1*14433";
      mockPost('END > Transfer failed.', req);
    });

    it('AIRTIME', function(){

      req.text = "4*1*34f";
      mockPost("END Invalid Input", req);

      req.text = "4*2*26r";
      mockPost("END Invalid Input", req);

      req.text = "4*2*263*3r";
      mockPost("END Invalid Input", req);

      req.text = "4*2*263*34*1234";
      expectedText = 'CON You are about to top up 34 for 263\n' +
      '              1. Confirm\n' +
      '              2. Cancel';
      mockPost(expectedText, req);

      req.text = "4*2*263*34*12r4";
      mockPost("END Invalid Input", req);

      req.text = "4*2*263*34*1234*1";
      mockPost("END Airtime purchase was successfull. You will get an SMS notification shortly.", req);
    });

    it('ATM CASHOUT', function(){
      
      req.text = "5*4r";
      mockPost("END Invalid Input", req);

      req.text = "5*45*123r";
      mockPost("END Invalid Input", req);
    });

    it('PAY LOAN', function(){

      req.text = "6*10";
      req.phoneNumber = "263773806130";
      mockPost("END Invalid Input", req);

      req.text = "6*10*1234";
      req.phoneNumber = "263773806130";
      mockPost("END > Loan Payment Failed. Retry", req);
    
    });

    it('CHANGE PIN', function(){

      req.text = "7";
      mockPost("CON > Enter your current PIN", req);

      req.text = "7*1234";
      mockPost("CON > Enter your new 4 Digit PIN", req);

      req.text = "7*123r";
      mockPost("END Invalid Input", req);

      req.text = "7*1234*0000";
      mockPost("CON > Reenter your 4 Digit PIN", req);

      req.text = "7*0000*1234*1234";
      mockPost("END PIN successfully changed. You’ll need your new PIN to complete transactions", req);

      req.text = "7*1111*0000*0000";
      mockPost("END Wrong PIN please try again!!", req);
    });



});