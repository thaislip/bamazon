const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require("colors");

var connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user: "root",
    password:"password",
    database:"bamazon"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id: ".bold + connection.threadId);
});

function appFunction() {
    connection.query("SELECT * FROM products", function(err,res){
        if (err) throw err;
    console.log("Peep our items!:\n".bold);
    console.log("\n--------------------------------\n");
    for (var i = 0; i < res.length; i++){
        console.log("id: ".bold + res[i].item_id + " | product: ".bold + res[i].product_name + " | department: ".bold + res[i].department_name + " | price: ".bold + "$".blue.bold +res[i].price + " | QOH: ".bold + res[i].stock_quantity);
    }
    console.log("\n--------------------------------\n");
    });
    salesPrompt();
}

function salesPrompt(){
    inquirer.prompt([
        {
            name:"id",
            type:"input",
            message:"Got some rare things on sale, stranger! (Enter ID number to purchase item.)\n".bold,
            validate: function(value){
                if (isNaN(value) === false) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            name:"quantity",
            type:"INPUT",
            message: "How many for ya?\n".bold,
            validate: function(value) {
                if (isNaN(value)) {
                    return false;
                }else{
                    return true;
                }
            }
        }
    ])
    .then(function(answer){
        var query = "SELECT department_name, stock_quantity, price FROM products WHERE ?"
        connection.query(query, {item_id: answer.id}, function(err, res){
            if (res[0].stock_quantity >= answer.quantity) {
                var dept = res[0].department_name;
                var adjustedQuantity = res[0].stock_quantity - answer.quantity;
                var purchasePrice = ((answer.quantity * res[0].price) * 1.07).toFixed(2);

                var query2 = "UPDATE products SET ? WHERE ?";
                    connection.query(query2, [{stock_quantity: adjustedQuantity }, {item_id: answer.id}], function(err, res){

                        if(err) throw err;
                        console.log("\n--------------------------------\n");
                        console.log("Your total is ".bold + "$" + purchasePrice + "\nYour item(s) are on the way!!".bold);
                        console.log("\n--------------------------------\n");
                    });
                appFunction();
            }
            else{
                console.log("\n--------------------------------\n");
                console.log("Not enough items on hand, stranger.".bold);
                console.log("\n--------------------------------\n");

                appFunction();
                
            }
        })
    });
}

appFunction();