var mysql = require("mysql");
var inquirer = require("inquirer");

// connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  //port
  port: 3307,

  //username
  user: "root",

  //password
  password: "IcedMocha4",
  database: "bamazon"
});

start();

//function to start
function start() {
  // query the database for all products available for purchase and display those products
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      console.log(
        "Item ID: " +
          results[i].item_id +
          " || Product Name: " +
          results[i].product_name +
          " || Department Name: " +
          results[i].department_name +
          " || Price: " +
          results[i].price +
          " || Stock Quantity: " +
          results[i].stock_quantity
      );
    }
    // prompt the user for which product they'd like to buy
    inquirer
      .prompt([
        {
          name: "productID",
          type: "input",
          message:
            //prompt to provide product id
            "Please provide the Product ID of the product you'd like to buy"
        },
        {
          name: "confirmUnits",
          type: "input",
          //prompt to confirm how many units
          message: "Please confirm how may units you would like to buy",
          //validate it's a number
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      //take provided information from answer and do transaction
      .then(function(answer) {
        // get the information of the chosen item
        var quantityRequested = answer.confirmUnits;
        var itemID = answer.productID;
        doTransaction(itemID, quantityRequested);
      });
  });
}

//function that does the purchase transaction.
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
        //query database to subtract stock quantity from product and units purchased
        connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
          [quantityRequested, productID]
        );
        connection.end();
        //if not enough product in stock throw error
      } else {
        console.log(
          "Insufficient quantity! Sorry there is not enough " +
            results[0].product_name +
            " in stock to complete your order"
        );
      }
    }
  );
}
