module.exports = {
    payloan: {
        stepone: () => {
          return `CON Pay Bills Coming Soon!!\n# Main Menu`;
        },

        steptwo: (text) => {
            if (text.split("*")[1] && !isNaN(text.split("*")[1])) {
                resp = `CON Enter your 4 digit pin to authorize and complete this transaction`;
              } else {
                resp = `END Invalid Input`;
            }
            return resp;    
        },

        stepthree: async (text, agentid) => {
            var payloan = text.split("*")[1];
            return resp;    
        }
    }
}