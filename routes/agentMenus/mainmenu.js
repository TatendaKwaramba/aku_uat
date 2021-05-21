const menus = require('./agent');

module.exports = {
    mainmenu: {
        stepone: () => {
            return menus.mainmenu.getMainMenu;
        }
    },
}