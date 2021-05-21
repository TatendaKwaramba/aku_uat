const menus = require('./subscriber');

module.exports = {
    subscriberMenu: {
        stepone: () => {
            return menus.mainMenu.getFirstMainMenu;
        },

        steptwo: () => {
            return menus.mainMenu.getSecondMainMenu;
        }
    }
}