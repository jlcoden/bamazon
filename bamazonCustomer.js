var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3307,

  // Your username
  user: "root",

  // Your password
  password: "IcedMocha4",
  database: "bamazon"
});

start();

function start() {
  // query the database for all products available for purchase
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the products, prompt the user for which they'd like to buy
    inquirer
      .prompt([
        {
          name: "provideProductID",
          type: "input",
          message:
            "Please provide the Product ID of the product you'd like to buy"
        },
        {
          name: "confirmUnits",
          type: "input",
          message: "Please confirm how may units you would like to buy",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var quantityRequested = answer.confirmUnits;
        var itemID = answer.provideProductID;
        doTransaction(itemID, quantityRequested);
      });
  });
}
