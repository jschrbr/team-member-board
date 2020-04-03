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
let id = 0;

const question_begin = [
  {
    type: "input",
    name: "title",
    message: "Enter the project name: "
  }
];

function getCredential(role) {
  const question_credential = [
    {
      type: "input",
      name: "name",
      message: `Enter the ${role}'s name: `
    },
    {
      type: "input",
      name: "email",
      message: `Enter the ${role}'s email: `
    }
  ];
  return question_credential;
}

const question_manager = [
  ...getCredential("manager"),
  {
    type: "input",
    name: "desc",
    message: "Enter the managers office number: "
  }
];

const question_select = [
  {
    type: "list",
    name: "select",
    message: "Select the employee's role: ",
    choices: ["Engineer", "Intern"]
  }
];

const question_recursive = [
  {
    type: "confirm",
    name: "askAgain",
    message: "Want to enter another employee (just hit enter for YES)?",
    default: true
  }
];

const question_intern = [
  ...getCredential("intern"),
  {
    type: "input",
    name: "desc",
    message: "Enter the intern's school name: "
  },
  ...question_recursive
];

const question_engineer = [
  ...getCredential("engineer"),
  {
    type: "input",
    name: "desc",
    message: "Enter the engineers GitHub username: "
  },
  ...question_recursive
];

function createHTML(employees) {
  console.log("Generating HTML");
  const html = render(...employees);
  console.log("Writing to file");
  writeFileAsync(outputPath, html);
  console.log("Success");
}

function ask() {
  inquirer.prompt([...question_begin, ...question_manager]).then(answers => {
    const { title, name, email, desc } = answers;
    const employees = [title, [new Manager(name, id++, email, desc)]];
    askEmployee(employees);
  });
}

function askEmployee(employees) {
  prompt(question_select).then(answers => {
    if (answers.select === "Intern") {
      askAgain(employees, question_intern, answers.select);
    } else {
      askAgain(employees, question_engineer, answers.select);
    }
  });
}

function askAgain(employees, ask, role) {
  inquirer.prompt(ask).then(answers => {
    const { name, email, desc } = answers;
    let emp = {};
    if (role === "Intern") {
      emp = new Intern(name, id++, email, desc);
    } else {
      emp = new Engineer(name, id++, email, desc);
    }
    employees[1].push(emp);
    if (answers.askAgain) {
      askEmployee(employees);
    } else {
      createHTML(employees);
    }
  });
}

ask();
