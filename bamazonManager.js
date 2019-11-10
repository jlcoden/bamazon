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

        case "Add to Inventory":
          addToInventory();
          break;

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

//If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
function addToInventory() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which item they'd like to add more to
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "For which item would you like to add more inventory?"
        },
        {
          name: "addInventory",
          type: "input",
          message: "How much inventory would you like to add?"
        }
      ])

      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          } //end of if
        } //end of for
      }); //end of .then
  });
}

//   connection.query(
//     "UPDATE products SET ? WHERE ?",
//     [
//       {
//         stock_quantity: answer.addInventory
//       },
//       {
//         id: chosenItem.id
//       }
//     ],
//     function(error) {
//       if (error) throw err;
//       console.log("Inventory Updated Successfully!");
//       start();
//     }
//   );
// }

//If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
