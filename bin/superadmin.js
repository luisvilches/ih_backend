#!/usr/bin/env node

'use strict';
const clear = require('clear');
const inquirer   = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const User = require('../models/user')
const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://ihv2:ihv2123@ih.sne18.mongodb.net/<dbname>?retryWrites=true&w=majority', err => {
    if (err) console.log(err);
    else console.log('open db');
})

async function ask(){
    const questions = [
      {
        name: 'Rut',
        type: 'input',
        message: 'Enter your rut:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your rut.';
          }
        }
      },
        {
          name: 'Name',
          type: 'input',
          message: 'Enter your name:',
          validate: function(value) {
            if (value.length) {
              return true;
            } else {
              return 'Please enter your name.';
            }
          }
        },
        {
          name: 'LastName',
          type: 'input',
          message: 'Enter your last name',
          validate: function(value) {
            if (value.length) {
              return true;
            } else {
              return 'Please enter your last name.';
            }
          }
        },
        {
          name: 'Email',
          type: 'input',
          default:'.',
          message: 'Enter of your email',
          validate: function(value) {
            return true;
          }
        }
      ];
      return inquirer.prompt(questions);
}


clear();
console.log(
    chalk.yellow(
        figlet.textSync('Create Super Admin', {
            horizontalLayout: 'default'
        })
    )
);


const run = async () => {

    let credentials = await ask();
    let user = new User({
        name: credentials.Name,
        lastname: credentials.LastName,
        rut: credentials.Rut,
        email: credentials.Email,
        phone: '0000000',
        password: 'admin123',
        username: 'sadmin',
        role: 'admin',
        roleOptions: {},
        calendar: [],
        verification: true
    })

    user.save()
        .then(response => console.log('Usuario creado'))
        .catch(err => console.log(err))
}
run();





