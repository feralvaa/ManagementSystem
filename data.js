const mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Doctor01%",
    database: "cmDB"
});

const initialQuestions = [
    {
        type: "list",
        name: "startQ",
        message: "What would you like to do?",
        choices: ["View All Employees", "View All Employees by Deparment", "View All Employees By Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Manager", "Exit"]
    },
]




connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    start();
});


async function start() {

    inquirer
        .prompt(initialQuestions).then((initialAnsw) => {
            const result = initialAnsw.startQ
            switch (result) {
                case "View All Employees":
                    viewAllEmployees();
                    
                    break;
                case "View All Employees by Deparment":
                    viewAllByDeparment();
                    
                    break;
                case "View All Employees By Manager":
                    viewAllByManager();
                    
                    break;
                case "Add Employee":
                    addEmployee();
                    
                    break;
                case "Remove Employee":
                    removeEmployee();
                    
                    break;
                case "Update Employee Role":
                    updateRoll();
                    
                    break;
                case "Update Manager":
                    updateManager();
                    
                    break;
                case "Exit":
                    connection.end(); 
                    break;
            }

        })
}


function viewAllEmployees() {

    connection.query(
        `Select
        id, 
        first_name,
        last_name,
        manager_id, 
        title,
        salary,
        department_Name
    From 
        employeeTB
        INNER JOIN roleTB
    on employeeTB.role_id = roleTB.role_id
    INNER JOIN departmentTB
    on roleTB.department_id = departmentTB.department_id;`
        , function (err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            console.table(res);   
        });
        start();

}

function viewAllByDeparment() {

    connection.query(`SELECT * FROM departmentTB`, function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([{
                name: "departments",
                type: "list",
                message: "Select one deparment",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].department_Name);
                    }
                    return choiceArray;
                }
            }]).then(depAns => {
                const deparmentSelection = depAns.departments
                connection.query(
                    `Select
                id, 
                first_name,
                last_name,
                manager_id, 
                title,
                salary,
                department_Name
                From 
                    employeeTB
                    INNER JOIN roleTB
                on employeeTB.role_id = roleTB.role_id
                INNER JOIN departmentTB
                on roleTB.department_id = departmentTB.department_id
                WHERE department_name =? ; 
                `, [deparmentSelection], function (err, depTable) {
                    console.table(depTable)
                    
                    
                })
            })
    });
}

function viewAllByManager() {
    connection.query(`SELECT * FROM ManagerTB`, function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([{
                name: "manager",
                type: "list",
                message: "Select one Manager",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].first_name);
                    }
                    return choiceArray;
                }
            }]).then(managerAns => {
                var managerID = res.filter(ele => ele.first_name == managerAns.manager)
                // const managerSelection = managerAns.manager
                connection.query(`Select first_name, last_Name From employeeTB Where	manager_id = ?; `, [managerID[0].manager_id], function (err, managerTable) {
                    console.table(managerTable)
                    start();
                })
            })
    });
}

function addEmployee() {

    inquirer
        .prompt([{
            name: "first_name",
            type: "Input",
            message: "What´s the employee first name?"
        },
        {
            name: "last_name",
            type: "Input",
            message: "What´s the employee last name?"
        },
        {
            name: "salary",
            type: "Input",
            message: "What´s the employee salary?"
        }
        ]).then(answers => {
            connection.query(`SELECT * FROM ManagerTB`, function (err, result) {
                if (err) throw err;
                inquirer
                    .prompt([{
                        name: "manager",
                        type: "list",
                        message: "Select one Manager",
                        choices: function () {
                            var managerArray = ["No Manager"];
                            for (var i = 0; i < result.length; i++) {
                                managerArray.push(result[i].first_name);
                            }

                            return managerArray;
                        }
                    }]).then(managerAns => {

                        connection.query(`SELECT * FROM roleTB`, function (err, roleResult) {
                            if (err) throw err;
                            inquirer
                                .prompt([{
                                    name: "role",
                                    type: "list",
                                    message: "Select one role",
                                    choices: function () {
                                        var roleArray = [];
                                        for (var i = 0; i < roleResult.length; i++) {
                                            roleArray.push(roleResult[i].title);
                                        }
                                        return roleArray;
                                    }
                                }]).then(roleAns => {
                                    var first_name_TB = answers.first_name
                                    var last_name_TB = answers.last_name
                                    var managerID_TB = result.filter(ele => ele.first_name == managerAns.manager)
                                    var roleID_TB = roleResult.filter(ele => ele.title == roleAns.role)

                                    connection.query(
                                        "INSERT INTO employeeTB SET ?",
                                        {
                                            first_name: first_name_TB,
                                            last_name: last_name_TB,
                                            role_id: roleID_TB[0].role_id,
                                            manager_id: managerID_TB[0].manager_id
                                        },
                                        function (err) {
                                            if (err) throw err;
                                            console.log("Your new employee added succesfully!");
                                            start();
                                        })
                                })
                        })
                    })

            })
        })

}

function removeEmployee() {
    connection.query(`SELECT first_name, last_name  FROM employeeTB`, function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([{
                name: "employee",
                type: "list",
                message: "Select employee to remove",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        var completeName = res[i].last_name
                        choiceArray.push(completeName);
                    }
                    return choiceArray;
                }
            }]).then(answer => {
                connection.query("DELETE FROM employeeTB WHERE last_name=?", [answer.employee],
                    function (err) {
                        if (err) throw err;
                        console.log("Your new employee deleted succesfully!");
                        start();
                    })

            })

    })
}

function updateRoll() {
    connection.query(`SELECT last_name, role_id  FROM employeeTB`, function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([{
                name: "employee",
                type: "list",
                message: "Select employee to remove",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].last_name);
                    }
                    return choiceArray;
                }
            }]).then(result => {
                connection.query(`SELECT * FROM roleTB`, function (err, roleResult) {
                    if (err) throw err;
                    inquirer
                        .prompt([{
                            name: "role",
                            type: "list",
                            message: "Select one role",
                            choices: function () {
                                var roleArray = [];
                                for (var i = 0; i < roleResult.length; i++) {
                                    roleArray.push(roleResult[i].title);
                                }
                                return roleArray;
                            }
                        }]).then(roleAns => {
                            const roleID_TB = roleResult.filter(ele => ele.title == roleAns.role)
                            const query = "UPDATE employeeTB SET role_id=" + roleID_TB[0].role_id + " WHERE last_name=?"

                            connection.query(query, [result.employee], function (err, roleResult) {
                                if (err) throw err;
                                console.log("role updated!")
                                start();
                            })
                        })
                })
            })
    })
}



function updateManager() {
    connection.query(`SELECT last_name, manager_id  FROM employeeTB`, function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([{
                name: "employee",
                type: "list",
                message: "Select employee",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].last_name);
                    }
                    return choiceArray;
                }
            }]).then(result => {
                connection.query(`SELECT * FROM ManagerTB`, function (err, managerResult) {
                    if (err) throw err;
                    inquirer
                        .prompt([{
                            name: "manager",
                            type: "list",
                            message: "Select one manager",
                            choices: function () {
                                var managerArray = [];
                                for (var i = 0; i < managerResult.length; i++) {
                                    managerArray.push(managerResult[i].last_name);
                                }
                                return managerArray;
                            }
                        }]).then(managerAns => {
                            const managerID_TB = managerResult.filter(ele => ele.last_name == managerAns.manager)
                            const query = "UPDATE employeeTB SET manager_id=" + managerID_TB[0].manager_id + " WHERE last_name=?"

                            connection.query(query, [result.employee], function (err, managerResult) {
                                if (err) throw err;
                                console.log("manager updated!")
                                start();
                            })
                        })
                })
            })
    })
}