"use strict";

const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const util = require("util");
const writeFileAsync = util.promisify(fs.writeFileSync);
const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");
const render = require("./lib/htmlRenderer");
const prompt = inquirer.createPromptModule();
let id = 1;

const question_begin = [
  {
    type: "input",
    name: "title",
    message: "Enter the project name: ",
  },
];

const question_select = [
  {
    type: "list",
    name: "select",
    message: "Select the employee's role: ",
    choices: ["Engineer", "Intern"],
  },
];

const question_recursive = [
  {
    type: "confirm",
    name: "askAgain",
    message: "Want to enter another employee (just hit enter for YES)?",
    default: true,
  },
];

function getCredential(role) {
  const question_credential = [
    {
      type: "input",
      name: "name",
      message: `Enter the ${role}'s name: `,
    },
    {
      type: "input",
      name: "email",
      message: `Enter the ${role}'s email: `,
    },
  ];
  let desc = { type: "input", name: "desc" };
  switch (role) {
    case "manager":
      desc.message = "Enter the managers office number: ";
      question_credential.push(desc);
      break;
    case "engineer":
      desc.message = "Enter the engineers GitHub username: ";
      question_credential.push(desc, ...question_recursive);
      break;
    case "intern":
      desc.message = "Enter the intern's school name: ";
      question_credential.push(desc, ...question_recursive);
      break;
    default:
      break;
  }
  return question_credential;
}

function createHTML(employees) {
  console.log("Generating HTML");
  const html = render(...employees);
  console.log("Writing to file");
  writeFileAsync(outputPath, html);
  console.log("Success");
}

function askAgain(employees, ask, role) {
  prompt(ask).then((answers) => {
    const { name, email, desc } = answers;
    let employee = {};
    if (role === "Intern") {
      employee = new Intern(name, id++, email, desc);
    } else {
      employee = new Engineer(name, id++, email, desc);
    }
    employees[1].push(employee);
    if (answers.askAgain) {
      askEmployee(employees);
    } else {
      createHTML(employees);
    }
  });
}

function askEmployee(employees) {
  prompt(question_select).then((answers) => {
    if (answers.select === "Intern") {
      askAgain(employees, getCredential("intern"), answers.select);
    } else {
      askAgain(employees, getCredential("engineer"), answers.select);
    }
  });
}

function ask() {
  prompt([...question_begin, ...getCredential("manager")]).then((answers) => {
    const { title, name, email, desc } = answers;
    const employees = [title, [new Manager(name, id++, email, desc)]];
    askEmployee(employees);
  });
}

ask();
