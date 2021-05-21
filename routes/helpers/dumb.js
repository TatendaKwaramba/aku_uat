async function gtTransfer(
    vendorname,
    vendorcode,
    vendorbankcode,
    vendoracctnumber,
    amount,
    reference,
    remarks,
    accountName,
    clientMobile
  ) {
  
    console.log("gt transfer running ...");
    let transfer_date = new Date().toLocaleDateString();
    transfer_date = transfer_date.split("/");
    let transfer_new_date =
      transfer_date[2] + "/" + transfer_date[0] + "/" + transfer_date[1];
  
    //hash data
    let text_hashed = singleHashText(amount, transfer_new_date, reference, remarks, vendorcode, vendorname, vendoracctnumber, vendorbankcode);
    console.log("hashed text", text_hashed);
  
    //populate xmlstring
    let xml = await singleXmlPayload(amount, transfer_new_date, reference, remarks, vendorcode, vendorname, vendoracctnumber, vendorbankcode, text_hashed);
    console.log("xml: ", xml);
  
    //Soap request
    const soap_url = `${process.env.SOAP_URL}`;
    const soap_headers = {
      HOST: `${process.env.SOAP_HOST}`,
      "Content-Type": `${process.env.SOAP_CONTENT_TYPE}`,
      soapAction: `${process.env.SOAP_SINGLETRANS_URL}`,
    };
  
    const { response } = await soapRequest({
      url: soap_url,
      headers: soap_headers,
      xml: xml,
      timeout: 90000,
    });
    console.log(response);
  
    if (response.body.includes("Transaction Successful")) {
      try {
        await beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          vendoracctnumber,
          vendorname,
          vendorcode,
          "CREDITED"
        );
      } catch (error) {
        console.log(error);
      }
  
      return {
        message: "Transaction Successful",
        code: "1000",
      };
    } else if (response.body.includes("1100")) {
      try {
        await beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          vendoracctnumber,
          vendorname,
          vendorcode,
          "Transaction Pending"
        );
      } catch (error) {
        console.log(error);
      }
  
      return {
        message: "Transaction Pending",
        code: "1100",
      };
    } else {
      try {
        await beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          vendoracctnumber,
          vendorname,
          vendorcode,
          "FAILED"
        );
      } catch (error) {
        console.log(error);
      }
  
      return {
        message: "Transfer Failed. Please Try Again",
        code: "4000",
      };
    }
  }
  
  async function gtAccountValidation(account) {
    //populate transaction details
    let text_to_hash = `${process.env.GTACCESSCODE}${process.env.GTUSERNAME}${process.env.GTPASSWORD}${account}`;
    console.log(text_to_hash);
  
    //hash data
    let text_hashed = sha512(text_to_hash);
    console.log("hashed text", text_hashed);
  
    //populate xmlstring
    let xml = await gtValidation(text_hashed);
    console.log(xml);
  
    //Soap request
    const soap_url = `${process.env.SOAP_URL}`;
    const soap_headers = {
      HOST: `${process.env.SOAP_HOST}`,
      "Content-Type": `${process.env.SOAP_CONTENT_TYPE}`,
      soapAction: `${process.env.SOAP_GTVALIDATION_URL}`,
    };
  
    let validation_response = {
      message: "null",
      account: "null",
      code: "null",
    };
  
    const { response } = await soapRequest({
      url: soap_url,
      headers: soap_headers,
      xml: xml,
      timeout: 90000,
    });
    const { body } = response;
    console.log(response);
  
    //Extract Bank Name and Response Code
    try {
      var { code, accountName } = await gtGetResponseCode(body);
    } catch (error) {
      console.log(error);
    }  
    console.log(accountName, code);
  
    if (code == "1000") {
      validation_response.message = "Account Validated Successfully";
      validation_response.account = accountName;
      validation_response.code = code;
  
      console.log("inside function: ", validation_response);
    } else {
      validation_response.message = "Failed to validate account";
    }
    return validation_response;
  }
  
  async function gtAccountValidationInOther(account, bankcode) {
    //populate transaction details
    let text_to_hash = `${process.env.GTACCESSCODE}${process.env.GTUSERNAME}${process.env.GTPASSWORD}${bankcode}${account}`;
    console.log(text_to_hash);
  
    //hash data
    let text_hashed = sha512(text_to_hash);
    console.log("hashed text", text_hashed);
  
    //populate xmlstring
    let xml = gtOtherValidation(text_hashed, account, bankcode);
    console.log(xml);
  
    //Soap request
    const soap_url = `${process.env.SOAP_URL}`;
    const soap_headers = {
      HOST: `${process.env.SOAP_HOST}`,
      "Content-Type": `${process.env.SOAP_CONTENT_TYPE}`,
      soapAction: `${process.env.SOAP_VALIDATION_URL}`,
    };
  
    let validation_response = {
      message: "",
      account: "",
      code: "",
    };
  
    const { response } = await soapRequest({
      url: soap_url,
      headers: soap_headers,
      xml: xml,
      timeout: 90000,
    });
    const { body } = response;
    console.log(response);
  
    //Extract Bank Name and Response Code
    try {
      var { code, accountName } = await getValidationResponse(body);
    } catch (error) {
      console.log(error);
    }
    console.log(accountName, code);
    if (code == "1000") {
      validation_response.message = "Account Validated Successfully";
      validation_response.account = accountName;
      validation_response.code = code;
  
      console.log("inside function: ", validation_response);
    } else {
      validation_response.message = "Failed to validate account";
    }
    return validation_response;
  }
  
  async function gtRegisterUser(mobile) {
    let url = `${process.env.BASE_URL_100}/api/v1/client/account/${mobile}`;
    console.log(url);
    let isRegistered = "";
    try {
      await axios
        .get(url)
        .then(function (res) {
          if (res.status == "200") {
            isRegistered = res.data.status;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
  
      return isRegistered;
    } catch (error) {
      console.log(error);
    }
  }
  
  async function gtDisburse(mobile, amount) {
    // get destiantion account
    let destination = await checkUserBalance(mobile);
    let dest_account = destination[0];
    let data = [];
    data[2] = amount;
    let info = {
      agent_id: 11,
      admin_id: 1,
      sms: "Akupay: you have received a payment to your akupay account",
      type: "initiate",
      disbursements: [
        {
          id: Math.random().toString(36).slice(2),
          mobile: mobile,
          destination: dest_account,
          amount: amount,
        },
      ],
    };
  
    let url = `${process.env.BASE_URL_WEBX}/webresources/disbursement/disburse`;
  
    try {
      await axios
        .post(url, info)
        .then(function (res) {
          if (res.status == "200") {
            console.log(res);
            data[0] = res.data[0].code;
            data[1] = res.data[0].description;
            data[3] = res.data[0].transaction.id;
          }
        })
        .catch(function (error) {
          console.log("Error Auto Registration", error);
        });
    } catch (error) {
      console.log(error);
    }
    return data;
  }
  
  async function gtAkuTransferPreauth(clientMobile, amount, bankCode) {
    let data = [];
    let info = {
      clientMobile: clientMobile,
      employeeCode: "14433",
      imei: "2348059090647",
      amount: amount,
      bankCode: bankCode,
      channel: "sms",
      transactionType: "CLIENT_WALLET_TO_BANK_PREAUTH",
    };
    let url = `${process.env.BASE_URL_400}/api/v1/subscriber/wallet-to-bank/preauth`;
  
    try {
      await axios
        .post(url, info, {
          auth: {
            username: process.env.APPUSER,
            password: process.env.PASSWORD,
          },
        })
        .then(function (res) {
          if (res.status == "200") {
            console.log(res.data);
            data[0] = res.data.code;
            data[1] = res.data.preauthId;
          }
        })
        .catch(function (error) {
          console.log("Error Akupay Bank Transfer Preauth: ", error);
        });
    } catch (error) {
      console.log(error);
    }
    return data;
  }
  
  async function gtAkuTransferTransaction(
    clientMobile,
    amount,
    bankCode,
    bankName,
    account,
    accountName,
    preauthId
  ) {
    let data = [];
    let info = {
      clientMobile: clientMobile,
      employeeCode: "14433",
      amount: amount,
      accountNumber: account,
      accountName: accountName,
      bankCode: bankCode,
      bankName: bankName,
      imei: "2348059090647",
      channel: "sms",
      transactionType: "CLIENT_WALLET_TO_BANK_TRANSACTION",
      preauthCode: preauthId,
    };
    let url = `${process.env.BASE_URL_400}/api/v1/subscriber/wallet-to-bank/transaction`;
  
    try {
      await axios
        .post(url, info, {
          auth: {
            username: process.env.APPUSER,
            password: process.env.PASSWORD,
          },
        })
        .then(function (res) {
          if (res.status == "200") {
            console.log(res.data);
            data[0] = res.data.code;
            data[1] = res.data.transactionReference;
            data[2] = res.data.description;
          }
        })
        .catch(function (error) {
          console.log("Error Akupay Bank Transfer Transaction: ", error);
        });
    } catch (error) {
      console.log(error);
    }
  
    if (data[0] == "00") {
      try {
        beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          account,
          bankName,
          bankCode,
          "wallet to bank SUCCESS"
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          account,
          bankName,
          bankCode,
          "wallet to bank FAILED"
        );
      } catch (error) {
        console.log(error);
      }
    }
    return data;
  }
  
  async function gtAkuUssdTransferPreauth(clientMobile, amount, bankCode, pin) {
    let data = [];
    let info = {
      clientMobile: clientMobile,
      employeeCode: "14433",
      pin: pin,
      imei: "2348059090647",
      amount: amount,
      bankCode: bankCode,
      channel: "sms",
      transactionType: "CLIENT_WALLET_TO_BANK_PREAUTH",
    };
    let url = `${process.env.BASE_URL_400}/api/v1/subscriber/wallet-to-bank/preauth`;
  
    try {
      await axios
        .post(url, info, {
          auth: {
            username: process.env.APPUSER,
            password: process.env.PASSWORD,
          },
        })
        .then(function (res) {
          if (res.status == "200") {
            console.log(res.data);
            data[0] = res.data.code;
            data[1] = res.data.preauthId;
          }
        })
        .catch(function (error) {
          console.log("Error Akupay Bank Transfer Preauth: ", error);
        });
    } catch (error) {
      console.log(error);
    }
    return data;
  }
  
  async function gtAkuUssdTransferTransaction(
    clientMobile,
    amount,
    bankCode,
    bankName,
    account,
    accountName,
    preauthId,
    pin
  ) {
    let data = [];
    let info = {
      clientMobile: clientMobile,
      employeeCode: "14433",
      pin: pin,
      amount: amount,
      accountNumber: account,
      accountName: accountName,
      bankCode: bankCode,
      bankName: bankName,
      imei: "2348059090647",
      channel: "sms",
      transactionType: "CLIENT_WALLET_TO_BANK_TRANSACTION",
      preauthCode: preauthId,
    };
    let url = `${process.env.BASE_URL_400}/api/v1/subscriber/wallet-to-bank/transaction`;
  
    try {
      await axios
        .post(url, info, {
          auth: {
            username: process.env.APPUSER,
            password: process.env.PASSWORD,
          },
        })
        .then(function (res) {
          if (res.status == "200") {
            console.log(res.data);
            data[0] = res.data.code;
            data[1] = res.data.transactionReference;
            data[2] = res.data.description;
          }
        })
        .catch(function (error) {
          console.log("Error Akupay Bank Transfer Transaction: ", error);
        });
    } catch (error) {
      console.log(error);
    }
  
    if (data[0] == "00") {
      try {
        beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          account,
          bankName,
          bankCode,
          "wallet to bank SUCCESS"
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          account,
          bankName,
          bankCode,
          "wallet to bank FAILED"
        );
      } catch (error) {
        console.log(error);
      }
    }
    return data;
  }

  async function gtApproveDisbursement(
    amount,
    transaction_id,
    clientMobile,
    accountName,
    account,
    bankName,
    bankCode
  ) {
  
    let data = [];
    let info = {
      agent_id: 11,
      admin_id: 1,
      sms: `Congratulations! You have been pre-approved for a TraderMoni micro-loan. Funds have been disbursed to your Akupay wallet. To withdraw your money Send: “Pay Account Number, Bank Name” to 34461 e.g Pay GTBank, 0102334409. To see your balance dial *347*215# or visit www.akupay.com Your PIN is 0000`,
      type: "validate",
      disbursements: [
        {
          transId: transaction_id,
        },
      ],
    };
    let url = `${process.env.BASE_URL_WEBX}/disbursement/disburse`;
  
    try {
      await axios
        .post(url, info)
        .then(function (res) {
          if (res.status == "200") {
            console.log(res.data[0]);
            data[0] = res.data[0].code;
          }
        })
        .catch(function (error) {
          console.log("Error Approving Disbursement: ", error);
        });
    } catch (error) {
      console.log(error);
    }
  
    if (data[0] == "00") {
      try {
        beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          account,
          bankName,
          bankCode,
          "disburse to Aku SUCCESS"
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          account,
          bankName,
          bankCode,
          "disburse to Aku FAILED"
        );
      } catch (error) {
        console.log(error);
      }
    }
    return data;
  }
  
  async function isWhitelisted(mobile) {
    let url = `${process.env.BASE_URL_400}/api/v1/beneficiaries/${mobile}`;
    console.log(url);
    let data = [];
    try {
      await axios
        .get(url, {
          auth: {
            username: process.env.APPUSER,
            password: process.env.PASSWORD,
          },
        })
        .then(function (res) {
          if (res.status == "200") {
            console.log(res.data);
            data[0] = res.data.amount;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
  
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  
  async function gtStoreFailed(mobile, text, account, bankName, message) {
    var sos_url = "https://dev-sos-api.akuproducts.com/api/v1/services/webhook";
    let today = new Date();
    var d = today.getDate();
    var m = today.getMonth() + 1;
    var y = today.getFullYear();
    var h = today.getHours();
    var ms = today.getMinutes();
    var s = today.getSeconds();
  
    if (d < 10) {
      d = "0" + d;
    }
  
    if (m < 10) {
      m = "0" + m;
    }
  
    if (h < 10) {
      h = "0" + h;
    }
  
    if (m < 10) {
      ms = "0" + ms;
    }
  
    if (s < 10) {
      s = "0" + s;
    }
  
    let date = y + "-" + d + "-" + m + " " + h + ":" + ms + ":" + s;
    let sos_payload = {
      type: "sms",
      phone_number: mobile,
      sms_content: text,
      sms_type: "inbox",
      sms_sent_at: date,
      status: message,
    };
  
    try {
      await axios
        .post(sos_url, sos_payload)
        .then(function (res) {
          console.log(res);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  
    try {
      failed_transactions.create({
        mobile: mobile,
        text: text,
        account: account,
        bankName: bankName,
        message: message,
      });
    } catch (error) {
      console.log(error);
    }
  }
  
  async function checkUserBalance(mobile) {
    var data = [];
    let url = `${process.env.BASE_URL_100}/api/v1/subscriber/${mobile}`;
    try {
      await axios
        .get(url)
        .then(async (res) => {
          console.log("Fetch Results Balance Check --------- ", res.data);
          data[0] = res.data.account;
        })
        .catch(function (error) {
          console.log(error);
        });
      return data;
    } catch (error) {
      console.log(error);
    }
  }