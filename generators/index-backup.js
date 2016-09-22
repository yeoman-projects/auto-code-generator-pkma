'use strict';
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var yamljs = require('yamljs');
var fs = require('fs');
var chalk = require('chalk');

module.exports = yeoman.Base.extend({

  initializing: function() {

    try {
      fs.lstatSync('config.yml');
    } catch (e) {
      console.log(chalk.red.bold('Missing config.yml. Please add the file to the installation directory'));
      process.exit(1);
    }

    this.configYMLObject = yamljs.load('config.yml');



    /**
     *Get the POJO details from the configYMLObject
     */
    this.applicationPOJOs = [];

    var POJOS = this.configYMLObject.POJO;
    var classNames = Object.keys(POJOS);

    if (classNames !== undefined && classNames.length > 0) {
      //Loop through the classNames to get the details from POJOS
      for (var classNamesIndex = 0; classNamesIndex < classNames.length; classNamesIndex++) {
        var className = classNames[classNamesIndex];

        //Create a class to push into applicationPOJOs list
        var classDetails = {
          className: className,
          variables: []
        }

        //Get all the variables for the class name
        var variables = POJOS[className].variables;

        //If there are no variables, then just create the class without variables else, 
        //loop through the list of variables to arrange them properly to create the class.
        if (variables !== undefined && variables.length > 0) {

          //Iterate through the variables list
          for (var variablesIndex = 0; variablesIndex < variables.length; variablesIndex++) {

            //Get the variable Details
            var variableDetails = variables[variablesIndex];

            //Get the first variable name. Usually, only one variable
            var variableName = Object.keys(variableDetails)[0];

            //Create the method name for the variable Name
            var fieldInJavaBeanMethod;
            if (variableName.length > 1) {
              var firstLetter = variableName.charAt(0);
              var secondLetter = variableName.charAt(1);
              if (firstLetter === firstLetter.toLowerCase() && secondLetter === secondLetter.toUpperCase()) {
                fieldInJavaBeanMethod = firstLetter.toLowerCase() + variableName.slice(1);
              } else {
                fieldInJavaBeanMethod = _.upperFirst(variableName);
              }
            } else {
              fieldInJavaBeanMethod = _.upperFirst(variableName);
            }

            //Push rest of the class details
            classDetails.variables.push({
              variableName: variableName,
              variableType: variableDetails[variableName].type,
              variableDefaultValue: variableDetails[variableName].default,
              variableMethodName: fieldInJavaBeanMethod
            });
          }
        }

        this.applicationPOJOs.push(classDetails);
      }
    }

    //Check for projectName field
    if (this.configYMLObject.projectName) {
      this.projectName = this.configYMLObject.projectName;
    } else {
      console.log(chalk.red.bold('projectName field missing, please add the variable and its value in config.yml file.'));
      process.exit(1);
    }

    //Check for projectTLA field
    if (this.configYMLObject.projectTLA) {
      this.tla = this.configYMLObject.projectTLA;
    } else {
      console.log(chalk.red.bold('projectTLA field missing, please add the variable and its value in config.yml file.'));
      process.exit(1);
    }

    //Check for packageName field
    if (this.configYMLObject.packageName) {
      this.packageName = this.configYMLObject.packageName;
      if (!(/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(this.packageName))) {
        console.log(chalk.red.bold('The package name you have provided is not a valid Java package name.'));
        process.exit(1);
      }
    } else {
      console.log(chalk.red.bold('packageName field missing, please add the variable and its value in config.yml file.'));
      process.exit(1);
    }

    //Check for methodURL field
    if (this.configYMLObject.methodURL) {
      this.methodURL = this.configYMLObject.methodURL;
    } else {
      console.log(chalk.red.bold('methodURL field missing, please add the variable and its value in config.yml file.'));
      process.exit(1);
    }

    //Check for restEndURL field
    if (this.configYMLObject.restEndURL) {
      this.url = this.configYMLObject.restEndURL;
    } else {
      console.log(chalk.red.bold('restEndURL field missing, please add the variable and its value in config.yml file.'));
      process.exit(1);
    }

    //Check for entityClass field
    if (this.configYMLObject.entityClass) {
      this.entityClass = this.configYMLObject.entityClass;
    } else {
      console.log(chalk.red.bold('entityClass field missing, please add the variable and its value in config.yml file.'));
      process.exit(1);
    }

    //Setting the generatorName
    this.generatorName = 'generator-jhipster-usm-server';
    this.projectName = 'USM-SERVER';
    this.projectWebsite = 'https://github.com/mshashi/generator-custom-dashboard';
    this.projectAuthor = 'ITOS';

  },
  prompting: function() {
    var done = this.async();
    this.log("\nPlease verify the below details: ");

    this.log("\nProjectName: " + this.projectName);
    this.log("\nProjectTLA: " + this.tla);
    this.log("\nPackage: " + this.packageName);
    this.log("\nRestURL: " + this.methodURL);
    this.log("\nExternalRestURL: " + this.url);
    this.log("\nEntityClassName: " + this.entityClass);
    this.log("\nEntity Beans:");
    for (var i = 0; i < this.applicationPOJOs.length; i++) {
      this.log(this.applicationPOJOs[i]);
      this.log("\n");
    }

    this.response = [];

    var prompts = [{
      type: 'confirm',
      name: 'confirmCreation',
      message: 'Are all the above details verified?',
      default: true
    }];

    this.prompt(prompts, function(props) {
      this.confirmCreation = props.confirmCreation;
      done();
    }.bind(this));

  },
  writing: {
    app: function() {
      if (this.confirmCreation) {

        var underscoreParams = {
          evaluate: /\<\%([\s\S]+?)\%\>/g,
          interpolate: /\<\%\=([\s\S]+?)\%\>/g,
          escape: /\<-([\s\S]+?)\>/g
        };
        var baseProjectPath = 'base-project/';

        var genericTemplateFiles = ['_pom.xml'];
        var packagePath = this.packageName.replace(/\./g, '/');
        var javaSrcPath = baseProjectPath + 'src/main/java/'
        var javaSrcTestPath = baseProjectPath + 'src/test/java/'
        var javaPath = 'src/main/java/' + packagePath + '/';
        var javaTestPath = 'src/test/java/' + packagePath + '/';
        this.host = this.configYMLObject && this.configYMLObject.host ? this.configYMLObject.host : {
          dev: '',
          local: ''
        };

        //console.log(this.configYMLObject);

        // if(this.configYMLObject){
        //   host.dev = this.configYMLObject.host && this.configYMLObject.host.dev ? this.configYMLObject.host.dev: '';
        //   host.local = this.configYMLObject.local && this.configYMLObject.host.local ? this.configYMLObject.host.local: '';
        // }

        for (var f in genericTemplateFiles)
          this.template(baseProjectPath + genericTemplateFiles[f], genericTemplateFiles[f].substr(1, 500), this);

        // Directories
        this.directory(baseProjectPath + 'src/main/webapp/', 'src/main/webapp/');
        this.directory(baseProjectPath + 'src/test/resources/', 'src/test/resources/');
        this.directory(baseProjectPath + 'src/main/java/package/', 'src/main/java/' + packagePath + '/');
        this.directory(baseProjectPath + 'src/test/java/package/', 'src/test/java/' + packagePath + '/');


        // src/main/webapp files
        this.template(baseProjectPath + '_web.xml', 'src/main/webapp/WEB-INF/web.xml', this);
        this.template(baseProjectPath + 'src/main/webapp/config/config.properties', 'src/main/webapp/config/config.properties', this);


        // src/main/resources files
        this.template(baseProjectPath + 'src/main/resources/logback.xml', 'src/main/resources/logback.xml', this);
        this.template(baseProjectPath + 'src/main/resources/log4j2.xml', 'src/main/resources/log4j2.xml', this);
        this.template(baseProjectPath + 'src/main/resources/_dev.properties', 'src/main/resources/dev.properties', this);
        this.template(baseProjectPath + 'src/main/resources/_local.properties', 'src/main/resources/local.properties', this);
        this.template(baseProjectPath + 'src/main/resources/spring/application-config.xml', 'src/main/resources/spring/application-config.xml', this);
        this.template(baseProjectPath + 'src/main/resources/spring/mvc-config.xml', 'src/main/resources/spring/mvc-config.xml', this);
        this.template(baseProjectPath + 'src/main/resources/spring/usm-application-context.xml', 'src/main/resources/spring/usm-application-context.xml', this);


        // src/main/java files
        this.template(javaSrcPath + 'package/util/USMDashboardMapper.java', javaPath + 'util/USMDashboardMapper.java', this);
        this.template(javaSrcPath + 'package/controller/ApplicationController.java', javaPath + 'controller/ApplicationController.java', this);
        this.template(javaSrcPath + 'package/controller/BaseController.java', javaPath + 'controller/BaseController.java', this);

        for (var index = 0; index < this.applicationPOJOs.length; index++) {
          var applicationPOJO = this.applicationPOJOs[index];
          console.log(applicationPOJO);

          this.template(javaSrcPath + 'Entity.java', javaPath + 'dto/' + applicationPOJO.className + '.java', {
            packageName: this.packageName,
            className: applicationPOJO.className,
            fields: applicationPOJO.variables
          });
        }
        this.template(javaSrcPath + 'package/service/ApplicationService.java', javaPath + 'service/ApplicationService.java', this);


        // src/test/java files
        this.template(javaSrcTestPath + 'package/controller/ApplicationControllerTest.java', javaTestPath + 'controller/ApplicationControllerTest.java', this);
        this.template(javaSrcTestPath + 'package/service/ApplicationServiceTest.java', javaTestPath + 'service/ApplicationServiceTest.java', this);

        // src/test/resources files
        this.template(baseProjectPath + 'src/test/resources/config/config.test.properties', 'src/test/resources/config/config.test.properties', this);

      }else{
        process.exit(1);
      }
    },

    projectfiles: function() {}
  }
});