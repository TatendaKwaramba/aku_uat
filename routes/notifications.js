const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post('/', async (req, res) => {
    console.log("-------notifications--------", req.body);

    if(req.body.phoneNumber){
        let { phoneNumber, serviceCode, durationInMillis, status, date} = req.body;

        let duration = durationInMillis?durationInMillis/1000: "0";
        var today = date?date.slice(0, 10): "";
        var hours = date?date.slice(11, 19): "";        
        var datetime = today + " " + hours;
        let data = {
            "type": "ussd",
            "phone_number": phoneNumber?phoneNumber.substring(1): "",
            "service_code": serviceCode?serviceCode: "",
            "duration": ""+duration+"",
            "transaction_date": datetime,
            "status": status?status: "",
        };

        var url = 'https://dev-sos-api.akuproducts.com/api/v1/services/webhook';
        try {
            await axios
            .post(url, data)
            .then(function (res) {
            console.log(res.data);
            })
            .catch(function (error) {
            console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
        
        res.send({"success": data});
    } else {
        res.send({"message": "Request Has No Data"});  
    }
});

module.exports = router;