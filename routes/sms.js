const express = require("express");
const soapRequest = require('easy-soap-request');
var sha512 = require('js-sha512');
const router = express.Router();

let {
  BanksDict: bankDictionary
} = require("../models/sequelize");

const gtBank = require('./helpers/gtbank');
const { smsSOS } = require("./helpers/gtbank");

router.post('/smstransfer', async (req, res) =>{
  const { text, from } = req.body;
  console.log(req.body);
  let mobile = from.substring(1);

  try {
    await smsSOS(mobile, text);
  } catch (error) {
    console.log(error);
  }

  //check if user is whitelisted
  let clientMobile = from.replace('+234', '0');
  let clientData = await gtBank.isWhitelisted(clientMobile);
  let amount = clientData[0];

  let report = await gtBank.beneficiariesSOS(
    clientMobile, '', amount, '', '', '', 'Initiated'
  );

  await gtBank.gtStoreFailed(
    clientMobile,
    text,
    "null",
    "null",
    "could not register the phone number"
  );

  if(amount >= 0){

    let registered = await gtBank.gtRegisterUser(mobile);

    if(!registered){

      let report = await gtBank.beneficiariesSOS(
        clientMobile, '', amount, '', '', '', 'could not register the phone number'
      );

      await gtBank.gtStoreFailed(
        clientMobile,
        text,
        "null",
        "null",
        "could not register the phone number"
      );

      console.log(report);
      res.send({message: 'could not register the phone number'});
    }

    // extract data
    var textData = [];
    textData = text.split(",");
    let textBankName = textData[0];
    var account = textData[1].trim();

    account = account.replace(/[o]/, 0);
    account = account.replace(/[l]/, 1);
    account = account.replace(/[s]/, 5);

    //Validating Text Data
    if(account.length !== 10 || isNaN(account)){

      let report = await gtBank.beneficiariesSOS(
        clientMobile, accountName, amount, account, textBankName, bankCode, 'invalid account'
      );

      await gtBank.gtStoreFailed(
        clientMobile,
        text,
        account,
        textBankName,
        "invalid bank account"
      );

      console.log(report);
      res.send({message: "invalid bank account"})
      return;
    };

    //Validation
    if(!/^[a-zA-Z\s]+$/.test(textBankName)){
      let report = await gtBank.beneficiariesSOS(
        clientMobile, accountName, amount, account, textBankName, bankCode, 'Bank Name Invalid'
      );

      await gtBank.gtStoreFailed(
        clientMobile,
        text,
        account,
        textBankName,
        "bank name invalid"
      );

      console.log(report);
      res.send({message: "bank name invalid"});
      return;
    }

    let bankDetails;
    let bankName, bankCode, bankSortCode = '';
    try {
      bankDetails = await bankDictionary.findOne({ where: { possible_name: bankName } });

      bankName = bankDetails? bankDetails.getDataValue('actual_name'): '';
      bankCode = bankDetails? bankDetails.getDataValue('code'): '';
      bankSortCode = bankDetails? bankDetails.getDataValue('sort_code'): '';

    } catch (error) {
      console.log(error);
    }

    if(bankDetails){
      // account validation function
      var validationResponse;
      if(bankName == 'Guaranty Trust Bank'){
        validationResponse = await gtBank.gtAccountValidation(account);
        console.log("inside request: ", validationResponse);
      } else {
        validationResponse = await gtBank.gtAccountValidationInOther(account, bankCode);
        console.log("inside request: ", validationResponse);
      }

      if(validationResponse.code == "1000"){

        //Initiate Disbursements
        let disburseResponse = await gtBank.gtDisburse(mobile, amount);

        //Succesful Disbursement
        if(disburseResponse == "1000"){

          let approveResponse = await gtBank.gtApproveDisbursement(disburseResponse[2], disburseResponse[3], mobile, validationResponse.account, account, bankName, bankCode);

          if(approveResponse == "1000"){
            let akuTransferPreauth = await gtBank.gtAkuUssdTransferPreauth(mobile, amount, bankCode);

            if(akuTransferPreauth[0] == '00'){
              let akuTransferTransaction = await gtBank.gtAkuUssdTransferTransaction(mobile, amount, bankCode, bankName, account, validationResponse.account, akuTransferPreauth[1]);

              if(akuTransferTransaction[0] == '00'){
                let transferResponse = await gtBank.gtTransfer(bankName, bankCode, bankSortCode, account, amount, Math.random().toString(36).slice(2), Math.random().toString(36).slice(2), validationResponse.account, mobile);

                if(transferResponse.code == "1000"){
                  res.send(transferResponse);
                } else {
                  let report = await gtBank.beneficiariesSOS(
                    clientMobile, validationResponse.account, amount, account, bankName, bankCode, 'Transfer Failed Please Try Again'
                  );
  
                  await gtBank.gtStoreFailed(
                    clientMobile,
                    text,
                    account,
                    bankName,
                    "Transfer Failed Please Try Again"
                  );
            
                  console.log(report);
                  res.send({message: "Transfer Failed Please Try Again"});
                }
              } else {
                let report = await gtBank.beneficiariesSOS(
                  clientMobile, validationResponse.account, amount, account, bankName, bankCode, 'AKUPAY Transaction FAILED Please try again or check with the system'
                );

                await gtBank.gtStoreFailed(
                  clientMobile,
                  text,
                  account,
                  bankName,
                  "AKUPAY Transaction FAILED Please try again or check with the system"
                );
          
                console.log(report);
                res.send({message: "AKUPAY Transaction FAILED Please try again or check with the system"});
              }
            } else {
              let report = await gtBank.beneficiariesSOS(
                clientMobile, validationResponse.account, amount, account, bankName, bankCode, 'AKUPAY PREAUTH FAILED Please try again or check with the system'
              );

              await gtBank.gtStoreFailed(
                clientMobile,
                text,
                account,
                bankName,
                "AKUPAY PREAUTH FAILED Please try again or check with the system"
              );
        
              console.log(report);
              res.send({message: "AKUPAY PREAUTH FAILED Please try again or check with the system"});
            }
          } else {
            let report = await gtBank.beneficiariesSOS(
              clientMobile, validationResponse.account, amount, account, bankName, bankCode, 'Validating Transaction failed'
            );

            await gtBank.gtStoreFailed(
              clientMobile,
              text,
              account,
              bankName,
              "Validating Transaction failed"
            );
      
            console.log(report);
            res.send({message: "Validating Transaction failed"});
          }
        } else {
          let report = await gtBank.beneficiariesSOS(
            clientMobile, validationResponse.account, amount, account, bankName, bankCode, 'Initiating Disbursement Failed'
          );

          await gtBank.gtStoreFailed(
            clientMobile,
            text,
            account,
            bankName,
            "Initiating Disbursement Failed"
          );
    
          console.log(report);
          res.send({message: "Initiating Disbursement Failed"});
        }
          
      } else{
        let report = await gtBank.beneficiariesSOS(
          clientMobile, validationResponse.account, amount, account, bankName, bankCode, 'account validation failed'
        );

        await gtBank.gtStoreFailed(
          clientMobile,
          text,
          account,
          bankName,
          "account validation failed"
        );
  
        console.log(report);
        res.send({message: "account validation failed"});
      }
    } else {
      let report = await gtBank.beneficiariesSOS(
        clientMobile, '', amount, account, bankName, bankCode, 'Bank Name Dictionary could not resolve the bank name provided'
      );

      await gtBank.gtStoreFailed(
        clientMobile,
        text,
        account,
        bankName,
        "Bank Name Dictionary could not resolve the bank name provided"
      );

      console.log(report);
      res.send({message: "Bank Name Dictionary could not resolve the bank name provided"});
    }  

  } else {
    let report = await gtBank.beneficiariesSOS(
      clientMobile, '', amount, 'null', 'null', 'null', 'mobile number is not whitelisted or has no balance left'
    );

    await gtBank.gtStoreFailed(
      clientMobile,
      text,
      'null',
      'null',
      "mobile number is not whitelisted or has no balance left"
    );

    console.log(report);
    res.send({message: 'mobile number is not whitelisted or has no balance left'});
  }  
});

router.post('/transfer', async (req, res) =>{
  const { amount, reference, remarks, vendorcode,vendorname, vendoracctnumber, vendorbankcode } = req.body;

  let transferDate = new Date().toLocaleDateString();

  transferDate = transferDate.split("/");
  let transfer_new_date = transferDate[2]+'/'+transferDate[0]+'/'+transferDate[1];

  //populate transaction details
  let textToHash = `<transactions><transaction><amount>${amount}</amount><paymentdate>${transfer_new_date}</paymentdate><reference>${reference}</reference><remarks>${remarks}</remarks><vendorcode>${vendorcode}</vendorcode><vendorname>${vendorname}</vendorname><vendoracctnumber>${vendoracctnumber}</vendoracctnumber><vendorbankcode>${vendorbankcode}</vendorbankcode></transaction></transactions>${process.env.GTACCESSCODE}${process.env.GTUSERNAME}${process.env.GTPASSWORD}`;
  console.log(textToHash);

  //hash data
  let textHashed = sha512(textToHash);
  console.log("hashed text", textHashed);

  //populate xmlstring
  let xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fil="http://tempuri.org/GAPS_Uploader/FileUploader">
  <soapenv:Header/>
  <soapenv:Body>
  <fil:SingleTransfers>
  <!--Optional:-->
  <fil:xmlRequest><![CDATA[<SingleTransferRequest><transdetails>&lt;transactions&gt;&lt;transaction&gt;&lt;amount&gt;${amount}&lt;/amount&gt;&lt;paymentdate&gt;${transfer_new_date}&lt;/paymentdate&gt;&lt;reference&gt;${reference}&lt;/reference&gt;&lt;remarks&gt;${remarks}&lt;/remarks&gt;&lt;vendorcode&gt;${vendorcode}&lt;/vendorcode&gt;&lt;vendorname&gt;${vendorname}&lt;/vendorname&gt;&lt;vendoracctnumber&gt;${vendoracctnumber}&lt;/vendoracctnumber&gt;&lt;vendorbankcode&gt;${vendorbankcode}&lt;/vendorbankcode&gt;&lt;/transaction&gt;&lt;/transactions&gt;</transdetails>
  <accesscode>${process.env.GTACCESSCODE}</accesscode>
  <username>${process.env.GTUSERNAME}</username>
  <password>${process.env.GTPASSWORD}</password>
  <hash>${textHashed}</hash>
  </SingleTransferRequest>]]></fil:xmlRequest>
  </fil:SingleTransfers>
  </soapenv:Body>
  </soapenv:Envelope>`

  console.log(xml);

  //Soap request 
  const soapUrl = `${process.env.SOAP_URL}`;
  const soapHeaders = {
    'HOST': `${process.env.SOAP_HOST}`,
    'Content-Type': 'text/xml;charset=UTF-8',
    'soapAction': 'http://tempuri.org/GAPS_Uploader/FileUploader/SingleTransfers',
  };

  (async () => {
    const { response } = await soapRequest({ url: soapUrl, headers: soapHeaders, xml: xml, timeout: 30000 }); // Optional timeout parameter(milliseconds)
    const {body} = response;
    console.log(body);
    

    if(response.body.includes("Transaction Successful") || response.body.includes("Transaction is under processing, please use TransactionRequery to check status")){
      res.send({message: "Transaction Submitted Successfully"});
    } else if (response.body.includes("1007")){

      try {
        await beneficiariesSOS(clientMobile, accountName, amount, vendoracctnumber, vendorname, vendorcode, 'Float Insufficient Balance');
      } catch (error) {
        console.log(error);
      }

      return {
        message : "Insufficient Balance Remaining",
        code: "1007"
      };

    } else {
      res.send({message: "Failed to submit the transaction please try again"});
    }
  })();
});


module.exports = router;