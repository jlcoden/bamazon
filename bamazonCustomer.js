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
          name: "productID",
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
        var itemID = answer.productID;
        doTransaction(itemID, quantityRequested);
      });
  });
}

function doTransaction(productID, quantityRequested) {
  connection.query(
    "Select * FROM products WHERE item_id =" + productID,
    function(err, results) {
      if (err) throw err;
      if (quantityRequested <= results[0].stock_quantity) {
        var totalCost = results[0].price * quantityRequested;
        console.log("Your order is in stock!");
        console.log(
          "Your total cost for " +
            quantityRequested +
            " " +
            results[0].product_name +
            " is " +
            totalCost +
            " Thank you!"
        );

        connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
          [quantityRequested, productID]
        );
      } else {
        console.log(
          "Insufficient quantity! Sorry there is not enough " +
            results[0].product_name +
            "in stock to complete your order"
        );
      }
    }
  );
}
