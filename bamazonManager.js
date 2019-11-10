var mysql = require("mysql");
var inquirer = require("inquirer");

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

runMenu();

function runMenu() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View Products for Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product"
        //  "exit"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
        case "View Products for Sale":
          viewProducts();
          break;

        case "View Low Inventory":
          viewLowInventory();
          break;

        //    case "Add to inventory":
        //        addToInventory();
        //       break;

        // case "Add new product":
        //   addToProduct();
        //   break;
        case "exit":
          connection.end();
          break;
      }
    });
}

function viewProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(
        "Item ID: " +
          res[i].item_id +
          " || Product Name: " +
          res[i].product_name +
          " || Department Name: " +
          res[i].department_name +
          " || Price: " +
          res[i].price +
          " || Stock Quantity: " +
          res[i].stock_quantity
      );
    }
  });
  runMenu();
}

function viewLowInventory() {
  var query =
    "SELECT * FROM products Group By item_id HAVING stock_quantity < 5";
  connection.query(query, function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(
        "Item ID: " +
          res[i].item_id +
          " || Product Name: " +
          res[i].product_name +
          " || Department Name: " +
          res[i].department_name +
          " || Price: " +
          res[i].price +
          " || Stock Quantity: " +
          res[i].stock_quantity
      );
    }
    runMenu();
  });
}
