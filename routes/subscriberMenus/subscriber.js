module.exports = {
    mainMenu: {
        getFirstMainMenu: "CON Welcome to Aku\n1. Check Balance\n2. Mobile Transfer\n3. Bank Transfer\n4. Bill Payments\n5. Cash Out\n6. Buy Airtime\n7. Change PIN\n8. Next",
        getSecondMainMenu: "CON Welcome to Aku\n9. Fund Aku\n10. My Aku\n## Back",
    },

    newUserMenu: {
        getNewUserMenu: "CON Welcome to your Aku. Please enter the required details to continue.\n Please enter your First Name",
        getLastName: "CON Please enter your Last Name",
        getId: "CON Please enter your ID Number",
        getEmail: "CON Please enter your Email address",
        getSuccess: (firstName, lastName) => {
            return `END Registration for ${firstName} ${lastName}, completed successfully. Dial the code again to access your account.`
        },
        getFailed: "END Registration failed, please try again",

    },

    balance: {
        agent: (accountBalance, commissionBalance) => {
            return `CON Aku Wallet Balance: N${accountBalance}\n Aku Commission Balance: N${commissionBalance}\n\n# Main Menu`
        }, 
        subscriber: (balance) => {
            return `CON Aku Wallet Balance: N${balance}\n\n# Main Menu`
        }, 
        error: "END Could not retrieve balance please try again"
    },

    myAku: {
        getMyAku: (walletCellphone, walletBalance, walletEmail, walletFirstname, walletLastname) => {
            return `CON AKUPAY WALLET\nMobile: ${walletCellphone}\nBalance: ${walletBalance}\nEmail: ${walletEmail}\nFirstname: ${walletFirstname}\nLastname: ${walletLastname}\n\n## Back\n# Main Menu`;
        } 
    },

    fundAku: {
        getFundAku: "CON Fund my Aku coming Soon!\n\n# Main Menu"
    },

    invalidInput: {
        getInvalidInput: "END Invalid Input"
    },

    systemBusy: {
        getSystemBusy: "END System busy please try again later"
    },

    bankTransfers: {
        getamount: "CON Enter amount to transfer to your bank",
        getFirstBanks: "CON Select Bank\n1.Access\n2.Diamond\n3.Ecobank\n4.FBN\n5.Fidelity\n6.FCMB\n7.GTB\n8.Providus\n9.Polaris\n10.Keystone\n11.Stanbic\n0.Next",
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
        getValidationFailed: "END Account could not be validated. Please try again\n\n# Main Menu",
    },

    atmCashout: {
        getAtm: "CON 1. ATM Cash Out",
        getComingSoon: "END Coming Soon!!, You will have to visit any ATM and select Cardless withdrawal, enter the Code you received via SMS.",
        getAmount: "CON Enter amount to Withdraw",
        getPin: "CON Enter your. 4 digit pin to authorize and complete this transaction",  
    },

    changePin: {
        getCurrentPin: "CON Enter your current PIN",
        getNewPin: "CON Enter your new 4 Digit PIN",
        getConfirmPin: "CON Confirm your 4 Digit PIN",
        getSuccess: "CON PIN successfully changed. You will need your new PIN to complete transactions\n\n#  Main Menu",
        getWrongPin: "CON Wrong PIN please try again!!\n\n#  Main Menu",
        getPinMismatch: "END PIN mismatch please try again",
    },

    airtime: {
        getOptions: "CON 1. AirtimeSelf\n2. AirtimeOthers\n\n#.  Main Menu",
        getAmount: "CON Enter amount to do Top Up",
        getConfirmAirtime: (airtime) => {
            return `CON You are about to top up ${airtime}.\n1. Confirm\n2. Cancel\n\n#.  Main Menu`            
        },
        getComingSoon: "CON Coming Soon!\n\n# Main Menu",
        getCancel: "END Airtime Top Up Cancelled.",
        otherAirtime: {
            getCell: "CON Please enter recipients phone number to send money to.",
            getAmount: "CON Enter Amount to Top Up",
            getPin: "CON Enter your 4 digit pin to authorize and complete this Airtime purchase.",
            getConfirm: (airtime1, receiver) => {
                return `CON You are about to top up ${airtime1} for ${receiver}\n1. Confirm\n2. Cancel\n\n#. Main Menu`;
            },
            getSuccess: "END Airtime purchase was successfull. Coming Soon!!",     
        }

    },

    walletTransfer: {
        getAmount: "CON Enter amount to transfer",
        getConfirmAmount: (amountss) => {
            return `CON You are about to transfer ${amountss}\n1. Confirm\n2. Cancel\n\n## Back\n# Main Menu`;
        },
        getCell: "CON Enter mobile number you're sending money to.",
        getCancel: "CON Transfer was cancelled\n\n# Main Menu",
        getConfirm: (money, phones) => {
            return `CON Confirm you are transferring NGN ${money} to ${phones}\n1. Confirm\n2. Cancel\n## Back\n# Main Menu`;
        },
        getPin: "CON Enter Pin & Transfer\n\n# Main Menu",
        getSuccess: "CON Transfer Successful!\n\n# Main Menu",
        getWrongPin: "END Incorrect PIN please try again!",
        getUnknownSubscriber: "END Subscriber is not registered please try again!",
        getFailed: "CON Transfer Failed. Please try again\n# Main Menu",         
    }
}