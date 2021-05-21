const soapRequest = require("easy-soap-request");
var sha512 = require("js-sha512");
const axios = require("axios");
const dotenv = require("dotenv").config();

// DB Models
const {
  FailedTransaction: failed_transactions,
  Banks: banks,
  BankTransfer: bankTransfer,
} = require("../../models/sequelize");

async function beneficiariesSOS(
  clientMobile,
  accountName,
  amount,
  account,
  bankName,
  bankCode,
  status
) {
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

  let date = y + "-" + m + "-" + d + " " + h + ":" + ms + ":" + s;
  let sos_payload = {
    type: "beneficiary",
    phone_number: clientMobile ? clientMobile : "null",
    first_name: accountName ? accountName : "null",
    last_name: accountName ? accountName : "null",
    amount_credited: amount ? amount : "null",
    date_of_transaction: date ? date : "null",
    account_number: account ? account : "null",
    bank_name: bankName ? bankName : "null",
    bank_code: bankCode ? bankCode : "null",
    status: status ? status : "null",
  };

  try {
    await axios
      .post(sos_url, sos_payload)
      .then(function (res) {
        console.log(res.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
}

function singleHashText(
  amount,
  transfer_new_date,
  reference,
  remarks,
  vendorcode,
  vendorname,
  vendoracctnumber,
  vendorbankcode
) {
  let text = `<transactions><transaction><amount>${amount}</amount><paymentdate>${transfer_new_date}</paymentdate><reference>${reference}</reference><remarks>${remarks}</remarks><vendorcode>${vendorcode}</vendorcode><vendorname>${vendorname}</vendorname><vendoracctnumber>${vendoracctnumber}</vendoracctnumber><vendorbankcode>${vendorbankcode}</vendorbankcode></transaction></transactions>${process.env.GTACCESSCODE}${process.env.GTUSERNAME}${process.env.GTPASSWORD}`;
  return sha512(text);
}

function singleXmlPayload(
  amount,
  transfer_new_date,
  reference,
  remarks,
  vendorcode,
  vendorname,
  vendoracctnumber,
  vendorbankcode,
  text_hashed
) {
  let payload = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fil="http://tempuri.org/GAPS_Uploader/FileUploader">
  <soapenv:Header/>
  <soapenv:Body>
  <fil:SingleTransfers>
  <!--Optional:-->
  <fil:xmlRequest><![CDATA[<SingleTransferRequest><transdetails>&lt;transactions&gt;&lt;transaction&gt;&lt;amount&gt;${amount}&lt;/amount&gt;&lt;paymentdate&gt;${transfer_new_date}&lt;/paymentdate&gt;&lt;reference&gt;${reference}&lt;/reference&gt;&lt;remarks&gt;${remarks}&lt;/remarks&gt;&lt;vendorcode&gt;${vendorcode}&lt;/vendorcode&gt;&lt;vendorname&gt;${vendorname}&lt;/vendorname&gt;&lt;vendoracctnumber&gt;${vendoracctnumber}&lt;/vendoracctnumber&gt;&lt;vendorbankcode&gt;${vendorbankcode}&lt;/vendorbankcode&gt;&lt;/transaction&gt;&lt;/transactions&gt;</transdetails>
  <accesscode>${process.env.GTACCESSCODE}</accesscode>
  <username>${process.env.GTUSERNAME}</username>
  <password>${process.env.GTPASSWORD}</password>
  <hash>${text_hashed}</hash>
  </SingleTransferRequest>]]></fil:xmlRequest>
  </fil:SingleTransfers>
  </soapenv:Body>
  </soapenv:Envelope>`;

  return payload;
}

function gtValidation(text_hashed) {
  let payload = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fil="http://tempuri.org/GAPS_Uploader/FileUploader">
  <soapenv:Header/>
  <soapenv:Body>
     <fil:GetAccountInGTB>
        <!--Optional:-->
        <fil:xmlString><![CDATA[<GetAccountInGTB>
     <customerid>${process.env.GTACCESSCODE}</customerid>
     <username>${process.env.GTUSERNAME}</username>
     <password>${process.env.GTPASSWORD}</password>
     <accountnumber>${account}</accountnumber>
    <hash>${text_hashed}</hash>
    </GetAccountInGTB>]]></fil:xmlString>
     </fil:GetAccountInGTB>
  </soapenv:Body>
  </soapenv:Envelope>`;

  return payload;
}

function gtGetResponseCode(body) {
  account_start_index = parseInt(body.search("&lt;ACCOUNTNAME&gt;")) + 19; //skip 19
  account_end_index = body.search("&lt;/ACCOUNTNAME&gt;");

  code_start_index = parseInt(body.search("&lt;CODE&gt;")) + 12;
  code_end_index = body.search("&lt;/CODE&gt;");

  accountName = body.slice(account_start_index, account_end_index);
  code = body.slice(code_start_index, code_end_index);
  return {
    code,
    accountName,
  };
}

function gtOtherValidation(text_hashed, account, bankcode) {
  let payload = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fil="http://tempuri.org/GAPS_Uploader/FileUploader">
  <soapenv:Header/>
  <soapenv:Body>
     <fil:GetAccountInOtherBank>
        <!--Optional:-->
        <fil:xmlString><![CDATA[<GetAccountInOtherBank>
     <customerid>${process.env.GTACCESSCODE}</customerid>
     <username>${process.env.GTUSERNAME}</username>
     <password>${process.env.GTPASSWORD}</password>
     <accountnumber>${account}</accountnumber>
     <Bankcode>${bankcode}</Bankcode>
    <hash>${text_hashed}</hash>
    </GetAccountInOtherBank>]]></fil:xmlString>
     </fil:GetAccountInOtherBank>
  </soapenv:Body>
  </soapenv:Envelope>`;

  return payload;
}

function getValidationResponse(body) {
  account_start_index = parseInt(body.search("&lt;ACCOUNTNAME&gt;")) + 19; //skip 19
  account_end_index = body.search("&lt;/ACCOUNTNAME&gt;");

  code_start_index = parseInt(body.search("&lt;CODE&gt;")) + 12;
  code_end_index = body.search("&lt;/CODE&gt;");

  accountName = body.slice(account_start_index, account_end_index);
  code = body.slice(code_start_index, code_end_index);
  return {
    code,
    accountName,
  };
}

module.exports = {
  gtAccountValidation: async (account) => {
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
      validation_response.code = "404"
    }
    console.log('validation response guys: ', validation_response)
    return validation_response;
  },

  gtAccountValidationInOther: async (account, bankcode) => {
    try {
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

      var validation_response = {
        message: "",
        account: "",
        code: "",
      };

      var { response } = await soapRequest({
        url: soap_url,
        headers: soap_headers,
        xml: xml,
        timeout: 90000,
      });

      const { body } = response;
      console.log(response);

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
      validation_response.code = "404";
    }
    return validation_response;
  },

  gtTransfer: async (
    vendorname,
    vendorcode,
    vendorbankcode,
    vendoracctnumber,
    amount,
    reference,
    remarks,
    accountName,
    clientMobile
  ) => {
    try {
      let transfer_date = new Date().toLocaleDateString();
      transfer_date = transfer_date.split("/");
      let transfer_new_date =
        transfer_date[2] + "/" + transfer_date[0] + "/" + transfer_date[1];

      //hash data
      let text_hashed = singleHashText(
        amount,
        transfer_new_date,
        reference,
        remarks,
        vendorcode,
        vendorname,
        vendoracctnumber,
        vendorbankcode
      );
      console.log("hashed text", text_hashed);

      //populate xmlstring
      let xml = await singleXmlPayload(
        amount,
        transfer_new_date,
        reference,
        remarks,
        vendorcode,
        vendorname,
        vendoracctnumber,
        vendorbankcode,
        text_hashed
      );
      console.log("xml: ", xml);

      //Soap request
      const soap_url = `${process.env.SOAP_URL}`;
      const soap_headers = {
        HOST: `${process.env.SOAP_HOST}`,
        "Content-Type": `${process.env.SOAP_CONTENT_TYPE}`,
        soapAction: `${process.env.SOAP_SINGLETRANS_URL}`,
      };

      var { response } = await soapRequest({
        url: soap_url,
        headers: soap_headers,
        xml: xml,
        timeout: 90000,
      });

      console.log(response);

      if (response.body.includes("Transaction Successful")) {
        await beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          vendoracctnumber,
          vendorname,
          vendorcode,
          "CREDITED"
        );

        return {
          message: "Transaction Successful",
          code: "1000",
        };
      } else if (response.body.includes("1100")) {
        await beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          vendoracctnumber,
          vendorname,
          vendorcode,
          "Transaction Pending"
        );

        return {
          message: "Transaction Pending",
          code: "1100",
        };
      } else {
        await beneficiariesSOS(
          clientMobile,
          accountName,
          amount,
          vendoracctnumber,
          vendorname,
          vendorcode,
          "FAILED"
        );

        return {
          message: "Transfer Failed. Please Try Again",
          code: "4000",
        };
      }
    } catch (error) {
      console.log(error);
    }
  },

  gtRegisterUser: async (mobile) => {
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
  },

  gtFailedTransactions: async (
    mobile,
    text,
    account,
    bank_name,
    account_name
  ) => {
    let url = `https://sos-api.akuproducts.com/api/v1/services/failed-transactions`;
    let req_body = {
      phone_number: mobile,
      message_content: text,
      account_number: account,
      bank_name: bank_name,
      account_name: account_name,
    };
    let headers = {
      "secret-key": process.env.smssecretkey,
    };
    let data = [];
    console.log(url, req_body);

    try {
      await axios
        .post(url, req_body, {
          headers: headers,
        })
        .then(function (res) {
          if (res.status == "200") {
            console.log(res.data);
            data[0] = res.data.status;
          }
        })
        .catch(function (error) {
          console.log(error);
        });

      return data;
    } catch (error) {
      console.log(error);
    }
  },

  gtStoreFailed: async (mobile, text, account, bankName, message) => {
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
  },

  gtGetBankDetails: async (bank_id, session_id, account, amount) => {
    let data = [];
    try {
      bank_details = await banks.findOne({ where: { id: bank_id } });
      data[0] = bank_details.getDataValue("code");

      try {
        bankTransfer
          .create({
            session_id: session_id,
            transfer_code: data[0],
            recipient_code: account,
            message: amount,
          })
          .then()
          .catch((SequelizeDatabaseError) => {
            console.log("db store code: ", SequelizeDatabaseError);
          });
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
    return data;
  },

  beneficiariesSOS: async (
    clientMobile,
    accountName,
    amount,
    account,
    bankName,
    bankCode,
    status
  ) => {
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

    let date = y + "-" + m + "-" + d + " " + h + ":" + ms + ":" + s;
    let sos_payload = {
      type: "beneficiary",
      phone_number: clientMobile ? clientMobile : "null",
      first_name: accountName ? accountName : "null",
      last_name: accountName ? accountName : "null",
      amount_credited: amount ? amount : "null",
      date_of_transaction: date ? date : "null",
      account_number: account ? account : "null",
      bank_name: bankName ? bankName : "null",
      bank_code: bankCode ? bankCode : "null",
      status: status ? status : "null",
    };

    try {
      await axios
        .post(sos_url, sos_payload)
        .then(function (res) {
          console.log(res.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  },

  smsSOS: async (mobile, message) => {
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

    let date = y + "-" + m + "-" + d + " " + h + ":" + ms + ":" + s;
    let sos_payload = {
      type: "sms",
      phone_number: mobile,
      sms_content: message,
      sms_type: "inbox",
      sms_sent_at: date,
      status: "initiated",
    };

    try {
      await axios
        .post(sos_url, sos_payload)
        .then(function (res) {
          console.log(res.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  },
};
