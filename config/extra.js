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

describe('Extra TESTS', function(){

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
    

});