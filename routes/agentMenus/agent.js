module.exports = {
    mainmenu: {
        getMainMenu: "CON Welcome Akupay Agent\n1. Check Balance\n2. Mobile Transfer\n3. Bank Transfer\n4. Cashout\n5. Cashin\n6. Airtime",
    },

    airtime: {

    },

    invalidInput: {
        getInvalidInput: "END Invalid Input"
    },

    systemBusy: {
        getSystemBusy: "END System busy please try again later"
    },

    bankTransfers: {
        getamount: "CON Enter amount to transfer to your bank",
        getFirstBanks: "CON Select Bank\n1.Access\n2.Diamond\n3.Ecobank\n4.FBN\n5.Fidelity\n6.FCMB\n7.GTBank\n8.Providus\n9.Polaris\n10.Keystone\n11.Stanbic\n0.Next",
        getSecondBanks: "CON Select Bank\n12.Sterling\n13.UBA\n14.Union\n15.Unity\n16.Wema\n17.Heritage\n18.Citibank\n19.Titan\n20.Globus\n21.SunTrust\n22.Standard\n23.Zenith",
        getAccount: "CON Enter bank account number",
        getConfirm: (bankDataAccount, bankDataAmount) => {
            return `CON You are about transferring NGN ${bankDataAmount} to ${bankDataAccount}\n1. Confirm\n2. Cancel\n\n#  Main Menu`;
        },
        getCancel: "END Transfer was cancelled",
        getPin: "CON Please enter your PIN",
        getSuccess: (accountName) => {
            return `CON ${accountName} Your bank transfer is being processed.\n\n# Main Menu`
        },
        getPENDING: "END Bank Transfer Transaction PENDING, please check your balance later",
        getFailed: "END Transaction failed. Please try again",
        getWrongPin: "CON Incorrect PIN please try again\n\n# Main Menu",
        getValidationFailed: "CON Account could not be validated. Please try again\n# Main Menu",
    },

    cashin: {
        getRecipient: "CON Please enter phone number to cashin into \n",
        getAmount: "CON Please enter the amount you want to cashin\n",
        getConfirm: (text) => {
            return `CON You are about to do a cashin of ${
                text.split("*")[3]
              } to ${text.split("*")[2]}\nPlease Choose\n1. Confirm\n2. Cancel`
        },
        getCancel: "END You have cancelled your cashin transaction",
        getEmployeeCode: "CON Enter Agent Code",
        getUnknownSubscriber: "END Subscriber is not registered",
        getMaxLimit: "END Transaction Limit Exceeded",
        getUnknownAgent: "END Wrong Agent Code",
        getSuccess: "END Cashin Transaction is being processed you will receive a message shortly",
        getFailed: "END Cashin did not complete successfully. Please try again sometime."
    },

    cashout: {
        getAmount: "CON Please enter the amount to cashout\n",
        getRecipient: "CON Enter Recipient phone number.\n\n## Back\n# Main Menu",
        getConfirm: (amount, recipientNumber) => {
            return `CON You are about to do a cashout of ${amount} to ${recipientNumber}\nPlease Choose\n1. Confirm\n2. Cancel\n\n## Back\n# Main Menu`;
        },
        getPIN: "CON Enter your pin to authorize this transaction.\n\n# Main Menu",
        getCancel: "END Cashout Cancelled\n# Main Menu",
        getAgentCode: "CON Enter Agent Code",
        getWrongPin: "CON Incorrect Subscriber PIN Please try again\n\n# Main Menu",
        getAuthFailed: "END Authentication Failed. Please try again",
        getSuccess: "END Cashout Transaction is being processed you will receive a message shortly\n\n# Main Menu",
        getWrongCode: "CON Incorrect agent code please try again\n# Main Menu",
        getFailed: "CON Cashout Failed. Please try again sometime\n# Main Menu",
        getUnknownSubscriber: "END Subscriber is not registered/ Incorrect pin",
    },

    walletTransfer: {
        getAmount: "CON Enter amount to transfer",
        getConfirm: (amountss) => {
            return `CON You are about to transfer ${amountss}\n1. Confirm\n2. Cancel\n\n## Back\n# Main Menu`
        },
        getRecipient: "CON Enter mobile number you're sending money to.",
        getCancel: "CON Transfer was cancelled\n# Main Menu",
        getConfirmAll: (money, phones) => {
            return `CON Confirm you are transferring NGN ${money} to ${phones}\n1. Confirm\n2. Cancel\n\n## Back\n# Main Menu`
        },
        getPin: "CON Enter Pin & Transfer\n\n# Main Menu",
        getAgentNull: "END Agent does not exist",
        getSuccess: "CON Transfer Successful!\n# Main Menu",
        getWrongPin: "END Incorrect PIN please try again!",
        getFailed: "CON Transfer Failed. Please try again\n# Main Menu"
    }
}