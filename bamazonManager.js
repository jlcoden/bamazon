var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  //my port nymber
  port: 3307,

  // username
  user: "root",

  // password
  password: "IcedMocha4",
  database: "bamazon"
});

//initiate runMenu
runMenu();

//runMenu function
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
        "Add New Product",
        "exit"
      ]
    })
    //based on answer, the following functions will be called
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

        case "Add New Product":
          addToProduct();
          break;
        case "exit":
          connection.end();
          break;
      }
    });
}
//viewProduct function, function to display products for sale
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
    console.log("-----------------------------------");
  });
  runMenu();
}

//function to view Low Inventory
function viewLowInventory() {
  //query database to show all products with stock_quantity less than 5
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
      console.log("-----------------------------------");
    }
    runMenu();
  });
}

//function to allow user to add to the inventory of the different products
function addToInventory() {
  // query the database for all products
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    //ask user which item they'd like to add more quantity to
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
        var quantityIncrease = answer.addInventory;
        // get the information of the chosen item
        var chosenItem = answer.choice;
        //query database to select chosen item and then add the additional stock_quanity.
        connection.query(
          "UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_name = ?",
          [quantityIncrease, chosenItem]
        );
        console.log("Inventory Updated Successfully!");
        //query database to show the updated stock_quantity since addtional stock was added
        connection.query(
          "SELECT * FROM products WHERE product_name = ?",
          [chosenItem],
          function(err, results) {
            if (err) throw err;

            for (var i = 0; i < results.length; i++) {
              console.log(
                "Total Inventory for " +
                  chosenItem +
                  " is now " +
                  results[i].stock_quantity
              );
              console.log("-----------------------------------");
            }
            runMenu();
          }
        );
      }); //end of .then
  });
}

//function to add a new product
function addToProduct() {
  inquirer
    .prompt([
      {
        name: "productName",
        type: "input",
        message: "What is the product name of the product you'd like to add?"
      },
      {
        name: "departmentName",
        type: "input",
        message: "What is the product's department?"
      },
      {
        name: "price",
        type: "input",
        message: "What is the price of the product?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "stockQuantity",
        type: "input",
        message: "What is the stock quantity?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])

    .then(function(answer) {
      // insert a new product into the db
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.productName,
          department_name: answer.departmentName,
          price: answer.price || 0,
          stock_quantity: answer.stockQuantity || 0
        },
        function(err) {
          if (err) throw err;
          console.log("Your product was successfully added!");
          // re-prompt menu options
          runMenu();
        }
      );
    });
}
