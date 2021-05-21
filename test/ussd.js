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

  it('TEST Change PIN', function(){
    req.text = "7";

    mockPost('CON > Enter your current PIN', req);
});

it('TEST Change PIN', function(){
    req.text = "7*1234";

    mockPost('CON > Enter your new 4 Digit PIN', req);
});

it('Test Transfers Menu: ', function(){
    req.text = "1";
    expectedText = 'CON Transfers Menu\n' +
    '                1. Bank Transfers\n' +
    '                2. Wallet Transfers\n' +
    '                3. Wallet To Bank Transfers';

    mockPost(expectedText, req);
});

it('Test Transfers Menu: ', function(){
    req.text = "1*1";
    expectedText = 'CON Enter amount to transfer to your bank';

    mockPost(expectedText, req);
});

it('Test Transfers Menu: ', function(){
    req.text = "1*3";
    expectedText = 'CON Enter amount to transfer to your bank';

    mockPost(expectedText, req);
});

it('Tests Bank Transfer Case 1', function(){
    req.text = "1*1*10*10*0000000000";
    req.level = "account";
    req.text_position = 5;
    req.page = "1";

    expectedText = "CON You are about transferring NGN 10 to 0000000000 \n" +
    "                  1. Confirm\n" +
    "                  2. Cancel"
    mockPost(expectedText, req);
});

it('Tests Bank Transfer Case 1', function(){
    req.text = "1*1*10*10*0*0000000000";
    req.level = "account";
    req.text_position = 6;
    req.page = "2";

    expectedText = "CON You are about transferring NGN 10 to 0000000000 \n" +
    "                  1. Confirm\n" +
    "                  2. Cancel"
    mockPost(expectedText, req);
});

it('Tests Bank Transfer Case 1', function(){
    req.text = "1*1*10*10*0*0*0000000000";
    req.level = "account";
    req.text_position = 7;
    req.page = "3";

    expectedText = "CON You are about transferring NGN 10 to 0000000000 \n" +
    "                  1. Confirm\n" +
    "                  2. Cancel"
    mockPost(expectedText, req);
});

it('Tests Bank Transfer Case 1', function(){
    req.text = "1*1*10*10*0*0*0*0000000000";
    req.level = "account";
    req.text_position = 8;
    req.page = "4";

    expectedText = "CON You are about transferring NGN 10 to 0000000000 \n" +
    "                  1. Confirm\n" +
    "                  2. Cancel"
    mockPost(expectedText, req);
});

it('Test Bank Select Page 2', function(){
    req.text = "1*1*10*0";
    expectedText = 'CON Select Bank\n' +
    '                11. First City Monument Bank\n' +
    '                12. FSDH Merchant Bank Limited\n' +
    '                13. Globus Bank\n' +
    '                14. Guaranty Trust Bank\n' +
    '                15. Hackman Microfinance Bank\n' +
    '                16. Hasal Microfinance Bank\n' +
    '                17. Heritage Bank\n' +
    '                18. Jaiz Bank\n' +
    '                19. Keystone Bank\n' +
    '                20. Kuda Bank\n' +
    '                0. Next';   
    mockPost(expectedText, req);
});

it('Test Bank Select Page 3', function(){
    req.text = "1*1*10*0*0";
    expectedText = 'CON Select Bank\n' +
    '    21. Lagos Building Investment Company Plc.\n' +
    '    22. One Finance\n' +
    '    23. Parallex Bank\n' +
    '    24. Parkway - ReadyCash\n' +
    '    25. Polaris Bank\n' +
    '    26. Providus Bank\n' +
    '    27. Rubies MFB\n' +
    '    28. Sparkle Microfinance Bank\n' +
    '    29. Stanbic IBTC Bank\n' +
    '    30. Standard Chartered Bank \n' +
    '    0. Next';   
    mockPost(expectedText, req);
});

it('Test Bank Select Page 4', function(){
    req.text = "1*1*10*0*0*0";
    expectedText = 'CON Select Bank\n' +
    '    31. Sterling Bank\n' +
    '    32. Suntrust Bank\n' +
    '    33. TAJ Bank\n' +
    '    34. TCF MFB  \n' +
    '    35. Titan Bank\n' +
    '    36. Union Bank of Nigeria \n' +
    '    37. United Bank For Africa\n' +
    '    38. Unity Bank\n' +
    '    39. VFD          \n' +
    '    40. Wema Bank\n' +
    '    41. Zenith Bank\n' +
    '    42. Access Bank\n' +
    '    43. Access Bank (Diamond)';   
    mockPost(expectedText, req);
});

it('Test Select Page 2', function(){
    req.text = "1*3*10*0";
    expectedText = 'CON Select Bank\n' +
    '                  11. First City Monument Bank\n' +
    '                  12. FSDH Merchant Bank Limited\n' +
    '                  13. Globus Bank\n' +
    '                  14. Guaranty Trust Bank\n' +
    '                  15. Hackman Microfinance Bank\n' +
    '                  16. Hasal Microfinance Bank\n' +
    '                  17. Heritage Bank\n' +
    '                  18. Jaiz Bank\n' +
    '                  19. Keystone Bank\n' +
    '                  20. Kuda Bank\n' +
    '                  0. Next';   
    mockPost(expectedText, req);
});

it('Test Select Page 3', function(){
    req.text = "1*3*10*0*0";
    expectedText = 'CON Select Bank\n' +
    '      21. Lagos Building Investment Company Plc.\n' +
    '      22. One Finance\n' +
    '      23. Parallex Bank\n' +
    '      24. Parkway - ReadyCash\n' +
    '      25. Polaris Bank\n' +
    '      26. Providus Bank\n' +
    '      27. Rubies MFB\n' +
    '      28. Sparkle Microfinance Bank\n' +
    '      29. Stanbic IBTC Bank\n' +
    '      30. Standard Chartered Bank \n' +
    '      0. Next';   
    mockPost(expectedText, req);
});

it('Test Select Page 4', function(){
    req.text = "1*3*10*0*0*0";
    expectedText = 'CON Select Bank\n' +
    '      31. Sterling Bank\n' +
    '      32. Suntrust Bank\n' +
    '      33. TAJ Bank\n' +
    '      34. TCF MFB  \n' +
    '      35. Titan Bank\n' +
    '      36. Union Bank of Nigeria \n' +
    '      37. United Bank For Africa\n' +
    '      38. Unity Bank\n' +
    '      39. VFD          \n' +
    '      40. Wema Bank\n' +
    '      41. Zenith Bank\n' +
    '      42. Access Bank\n' +
    '      43. Access Bank (Diamond)';   
    mockPost(expectedText, req);
});

it('Test Amount to transfer to your bank', function(){
    req.text = "1*3";    
    mockPost("CON Enter amount to transfer to your bank", req);
});

it('Test Amount to transfer to your bank', function(){
    req.text = "1*3*10";
    expectedText = 'CON Select Bank \n' +
    '        1. ALAT by WEMA\n' +
    '        2. ASO Savings and Loans\n' +
    '        3. Bowen Microfinance Bank\n' +
    '        4. CEMCS Microfinance Bank\n' +
    '        5. Citibank Nigeria\n' +
    '        6. Ecobank Nigeria\n' +
    '        7. Ekondo Microfinance Bank\n' +
    '        8. Eyowo\n' +
    '        9. Fidelity Bank\n' +
    '        10. First Bank of Nigeria\n' +
    '        0. Next';   
    mockPost(expectedText, req);
});

it('Test Amount to transfer to your bank', function(){
    req.text = "1*3*10*10";
    req.level = "selectbank";    
    mockPost("CON Enter bank account number", req);
});

it('Test Amount to transfer to your bank', function(){
    req.text = "1*3*10*10*0000000000";
    req.level = "ec";  
    mockPost("CON Please Enter your Employee Code", req);
});

it('Test Amount to transfer to your bank', function(){
    req.text = "1*3*10*10*0000000000*14433";
    req.level = "account";
    expectedText = 'CON You are about transferring NGN 10 to 0000000000 \n' +
    '                    1. Confirm\n' +
    '                    2. Cancel'
    mockPost(expectedText, req);
});

it('Test Amount to transfer to your bank', function(){
    req.text = "1*3*10*10*0000000000*14433*1";
    req.text_position = 6;
    req.level = "confirm";
    mockPost("END Your bank transfer is being processed", req);
});

 // BANK TRANSFERS
it("Bank Transfer Logic",async function () {

req.text = "1*1*45";
req.level = "selectbank"

if (req.text == "1*1*45") {
  chai
    .request("http://localhost:4000")
    .post("/")
    .send(req)
    .then((res) => {
      //console.log(res);
      assert.equal(
        res.text,
        'CON Select Bank \n' +
  '      1. ALAT by WEMA\n' +
  '      2. ASO Savings and Loans\n' +
  '      3. Bowen Microfinance Bank\n' +
  '      4. CEMCS Microfinance Bank\n' +
  '      5. Citibank Nigeria\n' +
  '      6. Ecobank Nigeria\n' +
  '      7. Ekondo Microfinance Bank\n' +
  '      8. Eyowo\n' +
  '      9. Fidelity Bank\n' +
  '      10. First Bank of Nigeria\n' +
  '      0. Next'
      );
      assert.equal(res.status, 200);
    })
    .catch((err) => console.log(err));
}

req.text = "1*1*10*10"; // change level to length
req.text = "account";

if (req.text == "1*1*10*10") {
  chai
    .request("http://localhost:4000")
    .post("/")
    .send(req)
    .then((res) => {
      //console.log(res);
      assert.equal(res.text, "CON Enter bank account number");
      //assert.equal(res.status, 200);
    })
    .catch((err) => console.log(err));
}

req.text = "1*1*10*10*0000000000";
req.level = "account";

if (req.text == "1*1*10*10*0000000000") {
  chai
    .request("http://localhost:4000")
    .post("/")
    .send(req)
    .then((res) => {
      //console.log(res);
      assert.equal(
        res.text,
        "CON You are about transferring NGN 10 to 0000000000 \n" +
          "                  1. Confirm\n" +
          "                  2. Cancel"
      );
      assert.equal(res.status, 200);
    })
    .catch((err) => console.log(err));
}

req.text = "1*1*10*10*0000000000*1";
req.level = "confirm";

if (req.text == "1*1*10*10*0000000000*1") {
  chai
    .request("http://localhost:4000")
    .post("/")
    .send(req)
    .then((res) => {
      //console.log(res);
      assert.equal(res.text, "CON Please Enter your PIN");
      assert.equal(res.status, 200);
    })
    .catch((err) => console.log(err));
}

req.text = "1*1*10*10*0000000000*2";
req.level = "confirm";

if (req.text == "1*1*10*10*0000000000*2") {
  chai
    .request("http://localhost:4000")
    .post("/")
    .send(req)
    .then((res) => {
      //console.log(res);
      assert.equal(res.text, "END Transfer was cancelled");
      assert.equal(res.status, 200);
    })
    .catch((err) => console.log(err));
}

});

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
  
  it("Show Start Menu", function () {
   
    testText = 'CON Welcome to your Akupay Account.Your Account Balance is undefined\n' +
    '    1 >> Make Transfers\n' +
    '    2 >> Agent CashOut\n' +
    '    3 >> Agent Cashin\n' +
    '    4 >> Buy Airtime\n' +
    '    5 >> ATM CashOut\n' +
    '    6 >> Pay Loan\n' +
    '    7 >> Change PIN';
  
    mockPost(testText, req);
  });
  
  it("First Time User", function () {
    req = {
      sessionId: sessionId,
      serviceCode: serviceCode,
      phoneNumber: "+2348059990001",
      text: "",
    };
    res = {};
  
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON Welcome to your Akupay Account. Add your 4 digit PIN"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  
    req.text = "2345";
  
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Confirm your Pin");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  
    req.text = "2345*2345";
  
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Your account PIN is successfully updated.");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  });
  
  
  // WALLET TO BANK TRANSFER
  it("TEST BANK TO WALLET TRANSFERS", function () {
  req.text = "1*3";
  
  if (req.text == "1*3") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Enter amount to transfer to your bank");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*3*10";
  
  if (req.text == "1*3*10") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          'CON Select Bank \n' +
  '        1. ALAT by WEMA\n' +
  '        2. ASO Savings and Loans\n' +
  '        3. Bowen Microfinance Bank\n' +
  '        4. CEMCS Microfinance Bank\n' +
  '        5. Citibank Nigeria\n' +
  '        6. Ecobank Nigeria\n' +
  '        7. Ekondo Microfinance Bank\n' +
  '        8. Eyowo\n' +
  '        9. Fidelity Bank\n' +
  '        10. First Bank of Nigeria\n' +
  '        0. Next'
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*3*10*10";
  req.level = "selectbank";
  
  if (req.text == "1*3*10*10") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Enter bank account number");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*3*10*10*0000000000";
  req.level = "ec";
  
  if (req.text == "1*3*10*10*0000000000") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please Enter your Employee Code");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*3*10*10*0000000000*14433";
  req.level = "account";
  
  if (req.text == "1*3*10*10*0000000000*14433") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          'CON You are about traansferring NGN 10 to 0000000000 \n' +
          '                    1. Confirm\n' +
          '                    2. Cancel'
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*3*10*10*0000000000*14433*1";
  req.text_position = 6;
  req.level = "confirm";
  
  
  if (req.text == "1*3*10*10*0000000000*14433*1") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Your bank transfer is being processed");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
   }
  });
  
   // BANK TRANSFERS
  it("Bank Transfer Logic",async function () {
  
  req.text = "1*1*45";
  req.level = "selectbank"
  
  if (req.text == "1*1*45") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          'CON Select Bank \n' +
    '      1. ALAT by WEMA\n' +
    '      2. ASO Savings and Loans\n' +
    '      3. Bowen Microfinance Bank\n' +
    '      4. CEMCS Microfinance Bank\n' +
    '      5. Citibank Nigeria\n' +
    '      6. Ecobank Nigeria\n' +
    '      7. Ekondo Microfinance Bank\n' +
    '      8. Eyowo\n' +
    '      9. Fidelity Bank\n' +
    '      10. First Bank of Nigeria\n' +
    '      0. Next'
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*1*10*10"; // change level to length
  req.text = "account";
  
  if (req.text == "1*1*10*10") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Enter bank account number");
        //assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*1*10*10*0000000000";
  req.level = "account";
  
  if (req.text == "1*1*10*10*0000000000") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON You are about transferring NGN 10 to 0000000000 \n" +
            "                  1. Confirm\n" +
            "                  2. Cancel"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*1*10*10*0000000000*1";
  req.level = "confirm";
  
  if (req.text == "1*1*10*10*0000000000*1") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please Enter your PIN");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "1*1*10*10*0000000000*2";
  req.level = "confirm";
  
  if (req.text == "1*1*10*10*0000000000*2") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Transfer was cancelled");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  });
  
    
   // CASHOUT
  it("Test Cashout Logic", function () {
  req = {
    sessionId: sessionId,
    serviceCode: serviceCode,
    phoneNumber: "+263775091262",
    text: "2",
  };
  res = {};
  
  if (req.text == "2") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          `CON Please enter the customer's mobile number \n`
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "2*26377778484";
  
  if (req.text == "2*26377778484") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please enter the amount to cashout\n");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "2*26377778484*234";
  
  if (req.text == "2*26377778484*234") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON You are about to do a cashout of 234\n" +
            "      Please Choose\n" +
            "      1. Confirm\n" +
            "      2. Cancel"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "2*26377778484*234*1";
  
  if (req.text == "2*26377778484*234*1") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please enter your pin");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "2*26377778484*234*2";
  
  if (req.text == "2*26377778484*234*2") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Cashout Cancelled");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "2*26377778484*20*1*1234";
  
  if (req.text == "2*26377778484*20*1*1234") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please Enter Your Employee Code");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "2*26377778484*20*1*1234*14433";
  
  if (req.text == "2*26377778484*20*1*1234*14433") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Cashout Did not complete successfully.");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  });
  
  // CASHIN
  it("Test Cashin Logic", function () {
  req = {
    sessionId: sessionId,
    serviceCode: serviceCode,
    phoneNumber: phone,
    text: "3",
  };
  res = {};
  
  if (req.text == "3") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON Please enter phone number to cashin into \n"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "3*26377778484";
  
  if (req.text == "3*26377778484") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON Please enter the amount you want to cashin\n"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "3*26377778484*234";
  
  if (req.text == "3*26377778484*234") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON You are about to do a cashin of 234 to 26377778484\n" +
            "      Please Choose\n" +
            "      1. Confirm\n" +
            "      2. Cancel"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "3*26377778484*234*1";
  
  if (req.text == "3*26377778484*234*1") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please enter your pin");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "3*26377778484*234*2";
  
  if (req.text == "3*26377778484*234*2") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Cashin Cancelled");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "3*26377778484*234*1*1234";
  
  if (req.text == "3*26377778484*234*1*1234") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please Enter Your Employee Code");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "3*26377778484*234*1*1234*14433";
  
  if (req.text == "3*26377778484*234*1*1234*14433") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Cashin Did not complete successfully");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  });  
  
    //WALLET TRANSFER
    it("Test Wallet Transfer", function () {
      req = {
        sessionId: sessionId,
        serviceCode: serviceCode,
        phoneNumber: phone,
        text: "1*2",
      };
      res = {};
    
      if (req.text == "1*2") {
        chai
          .request("http://localhost:4000")
          .post("/")
          .send(req)
          .then((res) => {
            //console.log(res);
            assert.equal(res.text, "CON > Enter amount to transfer");
            assert.equal(res.status, 200);
          })
          .catch((err) => console.log(err));
      }
    
      req.text = "1*2*12";
    
      if (req.text == "1*2*12") {
        chai
          .request("http://localhost:4000")
          .post("/")
          .send(req)
          .then((res) => {
            //console.log(res);
            assert.equal(
              res.text,
              "CON You are about to transfer 12\n" +
                "                1. Confirm\n" +
                "                2. Cancel"
            );
            assert.equal(res.status, 200);
          })
          .catch((err) => console.log(err));
      }
    
      req.text = "1*2*12*1";
    
      if (req.text == "1*2*12*1") {
        chai
          .request("http://localhost:4000")
          .post("/")
          .send(req)
          .then((res) => {
            //console.log(res);
            assert.equal(
              res.text,
              `CON > Enter mobile number you're sending money to.`
            );
            assert.equal(res.status, 200);
          })
          .catch((err) => console.log(err));
      }
    
      req.text = "1*2*12*1*2340100000002";
    
      if (req.text == "1*2*12*1*2340100000002") {
        chai
          .request("http://localhost:4000")
          .post("/")
          .send(req)
          .then((res) => {
            //console.log(res);
            assert.equal(
              res.text,
              "CON > Confirm you are transferring NGN 12 to 2340100000002\n" +
                "                  1. Confirm\n" +
                "                  2. Cancel"
            );
            assert.equal(res.status, 200);
          })
          .catch((err) => console.log(err));
      }
    
      req.text = "1*2*12*1*2340100000002*1";
    
      if (req.text == "1*2*12*1*2340100000002*1") {
        chai
          .request("http://localhost:4000")
          .post("/")
          .send(req)
          .then((res) => {
            //console.log(res);
            assert.equal(
              res.text,
              "CON > Please enter your Employee Code to confirm transfer"
            );
            assert.equal(res.status, 200);
          })
          .catch((err) => console.log(err));
      }
    
      req.text = "1*2*12*1*2340100000002*1*14433";
    
      if (req.text == "1*2*12*1*2340100000002*1*14433") {
        chai
          .request("http://localhost:4000")
          .post("/")
          .send(req)
          .then((res) => {
            //console.log(res);
            assert.equal(
              res.text,
              "CON > Please enter your PIN to confirm transfer"
            );
            assert.equal(res.status, 200);
          })
          .catch((err) => console.log(err));
      }
    });
  
  // BUY AIRTIME
  it("Test Buy Airtime", function () {
  req = {
    sessionId: sessionId,
    serviceCode: serviceCode,
    phoneNumber: phone,
    text: "4",
  };
  res = {};
  
  if (req.text == "4") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON 1 > AirtimeSelf\n                2 > AirtimeOthers"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*1";
  
  if (req.text == "4*1") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON > Enter amount");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*1*12";
  
  if (req.text == "4*1*12") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON You are about to top up 12.\n" +
            "              1. Confirm\n" +
            "              2. Cancel"
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*1*12*1";
  
  if (req.text == "4*1*12*1") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "END Transaction completed successfully. You will get an SMS notification shortly."
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*1*12*2";
  
  if (req.text == "4*1*12*2") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "END Airtime Top Up Cancelled.");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*2";
  
  if (req.text == "4*2") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Please enter recipients phone number");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*2*23";
  
  if (req.text == "4*2*23") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON Enter Amount to Top Up");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*2*23*2367784";
  
  if (req.text == "4*2*23*2367784") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(
          res.text,
          "CON Enter your 4 digit pin to authorize and complete this Airtime purchase."
        );
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  
  req.text = "4*2*23*2367784*1234";
  
  if (req.text == "4*2*2367784*1234") {
    chai
      .request("http://localhost:4000")
      .post("/")
      .send(req)
      .then((res) => {
        //console.log(res);
        assert.equal(res.text, "CON You are about to top up");
        assert.equal(res.status, 200);
      })
      .catch((err) => console.log(err));
  }
  }); 
  
  // ATM CASHOUT
  it("Test ATM Cashout", function () {
    req = {
      sessionId: sessionId,
      serviceCode: serviceCode,
      phoneNumber: phone,
      text: "5",
    };
    res = {};
  
    if (req.text == "5") {
      chai
        .request("http://localhost:4000")
        .post("/")
        .send(req)
        .then((res) => {
          //console.log(res);
          assert.equal(
            res.text,
            "CON > Enter amount to Withdraw (You’ll be charged Xamount for this transaction)"
          );
          assert.equal(res.status, 200);
        })
        .catch((err) => console.log(err));
    }
  
    req.text = "5*13";
  
    if (req.text == "5*13") {
      chai
        .request("http://localhost:4000")
        .post("/")
        .send(req)
        .then((res) => {
          //console.log(res);
          assert.equal(
            res.text,
            "CON > Enter your. 4 digit pin to authorize and complete this transaction"
          );
          assert.equal(res.status, 200);
        })
        .catch((err) => console.log(err));
    }
  
    req.text = "5*13*1234";
  
    if (req.text == "5*13*1234") {
      chai
        .request("http://localhost:4000")
        .post("/")
        .send(req)
        .then((res) => {
          //console.log(res);
          assert.equal(
            res.text,
            "END > Transaction completed successfully, visit any ATM and select Cardless withdrawal, enter the Code that will be sent to you shortly via SMS."
          );
          assert.equal(res.status, 200);
        })
        .catch((err) => console.log(err));
    }
  });
  
  // PAY LOAN
  it("Test PAY LOAN LOGIC", function () {
    req = {
      sessionId: sessionId,
      serviceCode: serviceCode,
      phoneNumber: phone,
      text: "6",
    };
    res = {};
  
    if (req.text == "6") {
      chai
        .request("http://localhost:4000")
        .post("/")
        .send(req)
        .then((res) => {
          //console.log(res);
          assert.equal(
            res.text,
            `CON > Your Loan balance is ${balance}
              Enter amount to Pay`
          );
          assert.equal(res.status, 200);
        })
        .catch((err) => console.log(err));
    }
  
    req.text = "6*10";
  
    if (req.text == "6*10") {
      chai
        .request("http://localhost:4000")
        .post("/")
        .send(req)
        .then((res) => {
          //console.log(res);
          assert.equal(
            res.text,
            "CON > Enter your 4 digit pin to authorize and complete this transaction"
          );
          assert.equal(res.status, 200);
        })
        .catch((err) => console.log(err));
    }
  
    req.text = "6*10*1234";
  
    if (req.text == "6*10*1234") {
      chai
        .request("http://localhost:4000")
        .post("/")
        .send(req)
        .then((res) => {
          //console.log(res);
          assert.equal(
            res.text,
            `END > Transaction completed successfully. You’ll receive an SMS notification with payment receipt number.
              And Your New Balance is 30`
          );
          assert.equal(res.status, 200);
        })
        .catch((err) => console.log(err));
    }
  });
  
  
  // Functions --------------
  
  it("should test the is registered", async function () {
    let reg = await app.isRegistered(sender);
    assert.equal(reg, "true");
  });
  
  it("should test check balance function", async function () {
    let user_mobile = "263775091262";
    assert.isArray(await app.checkUserBalance(user_mobile));
  });
  
  it('should test create transfer recipient bank function', async function(){
    let msg = await app.createRecipientBank(bank, account, bank_id, sessionId, sender).then()
    .catch(err => console.log(err));
    assert.typeOf(msg, 'string');
    });
  
    it('should test get iniate bank transfer function', async function(){
      let initiate = "http://api.akupay.ng:8400/api/v1/wallet-to-bank-ussd/transaction";
      let init_trans = {
        source: "balance",
        amount: 11,
        recipient: "RCP_uftmgm3sdohxni7",
        reason: "From USSD",
      };
      let msg = await app.initiateTransferBank(initiate, init_trans, sessionId).then()
      .catch(err => console.log(err));
      assert.typeOf(msg, 'string');
      
    });   
    
  
  it("Should Test Wallet To Bank Preauth", async function(){
    let wb_preauth_msg = await app.createRecipient(
      bank,
      account,
      bank_id,
      sessionId,
      sender,
      employee_code,
      amount
    );
  
    assert.typeOf(wb_preauth_msg, 'string');
  });
  
  it("Should Test Wallet To Bank Preauth", async function(){
    let wb_trans_msg = await app.initiateTransfer(
      sender,
      employee_code,
      amount,
      account,
      bank_code,
      bank_name,
      sender,
      preauthCode,
      sessionId
    );
  
    assert.typeOf(wb_trans_msg, 'string');
  });
  
  
  it('should test cashin preauth function', async function(){
  let msg_cashin_preauth = await app.cashin(
  sender,
  reciever,
  "10",
  "",
  sender,
  "PREAUTH",
  pin,
  employee_code,
  sessionId
  ).then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.typeOf(msg_cashin_preauth, 'string');
  });
  
  it('should test cashin trans function', async function(){
  let msg_cashin_preauth = await app.cashin(
  sender,
  reciever,
  "10",
  '1286712',
  sender,
  "TRANSACTION",
  pin,
  employee_code,
  sessionId
  ).then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.typeOf(msg_cashin_preauth, 'string');
  });
  
  it('should test cashout preauth function', async function(){
  let msg_preauth = await app.cashout(
  sender,
  reciever,
  "10",
  "",
  sender,
  "PREAUTH",
  pin,
  employee_code,
  sessionId
  ).then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.typeOf(msg_preauth, 'string');
  });
  
  it('should test cashout function', async function(){
  let preauth = '1286712';
  let msg_preauth = await app.cashout(
  sender,
  reciever,
  "10",
  '1286712',
  sender,
  "TRANSACTION",
  pin,
  employee_code,
  sessionId
  ).then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.typeOf(msg_preauth, 'string');
  });
  
  it('should test wallet transfer preauth function', async function(){
  let preauth_arr = await app.agentToAgentPreauth(sender, reciever, employee_code, amount)
                                .then()
                                .catch(err => {
                                  console.log(err);
                                });
  
  console.log("Test auth console: ",preauth_arr);
  assert.equal(preauth_arr[1], '00');
  
  let trans_arr = await app.agentToAgentTrans(sender, reciever, employee_code, amount, preauth_arr[0])
                              .then()
                              .catch(err => {
                                console.log(err);
                              });
                              
  console.log("Test trans console: ", trans_arr);
  assert.equal(trans_arr[0], '00');
  });
  
  it('should test wallet transfer preauth function', async function(){
  
  let msg_transfer = await app.transfer(
  sender,
  reciever,
  "10",
  "",
  sender,
  "PREAUTH",
  pin,
  employee_code,
  sessionId
  ).then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.typeOf(msg_transfer, 'string');
  
  
  
  });
  
  it('should test wallet transfer function', async function(){
  
  let msg_transfer = await app.transfer(
  sender,
  reciever,
  "10",
  "1286727",
  sender,
  "TRANSACTION",
  pin,
  employee_code,
  sessionId
  ).then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.typeOf(msg_transfer, 'string');
  
  });
  
  it('should test get loan balance function', async function(){
  let checkloan = "1";
  let msg_loan_bal = await app.checkLoanBalance(checkloan).then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.isArray(msg_loan_bal);
  });
  
  it('should test pay loan balance function', async function(){
  let msg_fetch_loan = await app.fetchLoanAndPay("10", "1").then(
  
  ).catch(err => {
  console.log(err);
  });
  assert.isNumber(msg_fetch_loan);
  });
  
  
  it('should test changePIN function', async function(){
  let change_pin = "http://api.akupay.ng:8100/api/v1/client/pin/2348059090647/1234/0000" 
  let msg_change_pin = await app.changeUserPIN(change_pin).then(
  
  ).catch(err =>{
    console.log(err);
  });
  assert.isString(msg_change_pin, 'string');
  });
  
  it('router tests', async function(){
  assert.exists(router);
  });

});