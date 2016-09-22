'use strict';
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var yamljs = require('yamljs');
var fs = require('fs');
var chalk = require('chalk');
var Jsonix = require('jsonix').Jsonix;
var xmls2js = require('xml2js');

module.exports = yeoman.Base
		.extend({

			initializing : function() {

				try {
					fs.lstatSync('config.yml');
				} catch (e) {
					console
							.log(chalk.red
									.bold('Missing config.yml. Please add the file to the installation directory'));
					process.exit(1);
				}

				this.configYMLObject = yamljs.load('config.yml');

				this.packageName = 'com.prokarma.jhipster.codeathon';
				this.projectName = 'CodeAThonDemo';

				/**
				 * Entity creation from the generated po.js file
				 */
				var xsdObjects = eval(fs.readFileSync('PO.js') + '').typeInfos;
				this.xsdObjects = [];
				for (var index = 0; index < xsdObjects.length; index++) {
					var xsdObject = xsdObjects[index];

					var pojo = {
						name : xsdObject.localName,
						variables : []
					}

					for (var variableIndex = 0; variableIndex < xsdObject.propertyInfos.length; variableIndex++) {
						var variable = xsdObject.propertyInfos[variableIndex];
						var variableName = variable.name;
						var variableType = null;

						switch (variable.typeInfo) {
						case 'Float':
							variableType = 'Float';
							break;
						case 'Integer':
							variableType = 'Integer';
							break;
						case 'Boolean':
							variableType = 'Boolean';
							break;
						case 'Long':
							variableType = 'Long';
							break;
						case 'String':
							variableType = 'String';
							break;
						default:
							variableType = 'String';
							break;
						}

						var variableMethodName;
						if (variableName.length > 1) {
							var firstLetter = variableName.charAt(0);
							var secondLetter = variableName.charAt(1);
							if (firstLetter === firstLetter.toLowerCase()
									&& secondLetter === secondLetter
											.toUpperCase()) {
								variableMethodName = firstLetter.toLowerCase()
										+ variableName.slice(1);
							} else {
								variableMethodName = _.upperFirst(variableName);
							}
						} else {
							variableMethodName = _.upperFirst(variableName);
						}

						pojo.variables.push({
							variableName : variableName,
							variableType : variableType,
							variableMethodName : variableMethodName
						});
					}
					this.xsdObjects.push(pojo);
				}

				this.parsedConfigurations = {};

				var defaults = this.configYMLObject.Environments.Defaults;
				var dev = this.configYMLObject.Environments.Develeopment;
				var test = this.configYMLObject.Environments.Test;
				var prod = this.configYMLObject.Environments.Production;

				this.parsedConfigurations.dsConfigs = [];

				/**
				 * Getting data source configurations
				 */
				// This is for getting the default configurations of datasource.
				var defaultDSConfig = defaults.DataSourceConfiguration;
				this.parsedConfigurations.dsConfigs
						.push({
							id : defaultDSConfig.id,
							defaultConfig : {
								driverName : defaultDSConfig.driver_class_name,
								poolConfig : {
									initialsize : defaultDSConfig.pool_confiuration.DBCP_POOL.initialsize,
									maxTotal : defaultDSConfig.pool_confiuration.DBCP_POOL.maxTotal,
									maxIdle : defaultDSConfig.pool_confiuration.DBCP_POOL.maxIdle,
									minIdle : defaultDSConfig.pool_confiuration.DBCP_POOL.minIdle,
									maxWaitTime : defaultDSConfig.pool_confiuration.DBCP_POOL.maxWaitTime,
									defaultQueryTimeout : defaultDSConfig.pool_confiuration.DBCP_POOL.defaultQueryTimeout

								}
							}
						})

				// This is for getting the dev configurations of datasource.
				var devDSConfig = dev.DataSourceConfiguration;
				var parsedConfigForDev = _.find(
						this.parsedConfigurations.dsConfigs,
						function(dsConfig) {
							return dsConfig.id === devDSConfig.id;
						});
				parsedConfigForDev.dev = {
					url : devDSConfig.url,
					userName : devDSConfig.userName,
					password : devDSConfig.password

				}

				// This is for getting the test configurations of datasource.
				var testDSConfig = test.DataSourceConfiguration;
				var parsedConfigForTest = _.find(
						this.parsedConfigurations.dsConfigs,
						function(dsConfig) {
							return dsConfig.id === testDSConfig.id;
						});
				parsedConfigForTest.test = {
					url : testDSConfig.url,
					userName : testDSConfig.userName,
					password : testDSConfig.password

				}

				// This is for getting the prod configurations of datasource.
				var prodDSConfig = prod.DataSourceConfiguration;
				var parsedConfigForProd = _.find(
						this.parsedConfigurations.dsConfigs,
						function(dsConfig) {
							return dsConfig.id === prodDSConfig.id;
						});
				parsedConfigForProd.prod = {
					url : prodDSConfig.url,
					userName : prodDSConfig.userName,
					password : prodDSConfig.password

				}

				/**
				 * Parsing rest invokers
				 */

				this.restInvokers = [];

				this.restInvokersClassImports = [];

				var defaultServiceTargets = defaults.RestInvokers.ServiceTargets;

				for (var index = 0; index < defaultServiceTargets.length; index++) {
					var serviceTargetDetails = defaultServiceTargets[index].ServiceTarget;
					var restEndPointDetails = {}

					var methodName = serviceTargetDetails.id.charAt(0)
							.toLowerCase()
							+ serviceTargetDetails.id.slice(1);
					restEndPointDetails.methodName = methodName;

					restEndPointDetails.httpMethodType = serviceTargetDetails.http_method;

					restEndPointDetails.restEndPointUrl = serviceTargetDetails.url;

					if (serviceTargetDetails.request_schema_uri) {
						var parser = new xmls2js.Parser();
						parser
								.parseString(
										(fs
												.readFileSync(serviceTargetDetails.request_schema_uri) + ''),
										function(err, result) {
											restEndPointDetails.requestBody = result['xsd:schema']['xsd:complexType'][0]['$'].name;
										});
						this.restInvokersClassImports
								.push(restEndPointDetails.requestBody);
					}

					if (serviceTargetDetails.reply_schema_uri) {
						var parser = new xmls2js.Parser();
						parser
								.parseString(
										(fs
												.readFileSync(serviceTargetDetails.reply_schema_uri) + ''),
										function(err, result) {
											restEndPointDetails.replyBody = result['xsd:schema']['xsd:complexType'][0]['$'].name;
										});
						this.restInvokersClassImports
								.push(restEndPointDetails.replyBody);
					}

					restEndPointDetails.connectionTimeout = serviceTargetDetails.connection_timeout;

					restEndPointDetails.readTimeout = serviceTargetDetails.read_timeout;

					this.restInvokers.push(restEndPointDetails);

				}

			},
			writing : {
				app : function() {

					var basePath = 'base-project/';
					var resourcesPath = 'src/main/resources/';
					var javaPath = 'src/main/java/';
					var testPath = 'src/main/test/';
					var packageStruct = 'com/prokarma/jhipster/codeathon/';
					var webappPath = 'src/main/webapp/';

					var underscoreParams = {
						evaluate : /\<\%([\s\S]+?)\%\>/g,
						interpolate : /\<\%\=([\s\S]+?)\%\>/g,
						escape : /\<-([\s\S]+?)\>/g
					};
					var baseProjectPath = 'base-project/';

					var genericTemplateFiles = [ '_pom.xml' ];

					for ( var f in genericTemplateFiles)
						this.template(
								baseProjectPath + genericTemplateFiles[f],
								genericTemplateFiles[f].substr(1, 500), this);

					this.template(basePath + '_web.xml', webappPath
							+ 'WEB-INF/web.xml', this);
					this.template(basePath + webappPath
							+ 'config/config.properties', webappPath
							+ 'config/config.properties', this);

					this.template(basePath + resourcesPath + 'logback.xml',
							'src/main/resources/logback.xml', this);
					this.template(basePath + resourcesPath + 'log4j2.xml',
							resourcesPath + 'log4j2.xml', this);

					this.template(basePath + resourcesPath
							+ 'spring/application-config.xml', resourcesPath
							+ 'spring/application-config.xml', this);
					this.template(basePath + resourcesPath
							+ 'spring/mvc-config.xml', resourcesPath
							+ 'spring/mvc-config.xml', this);
					this.template(basePath + resourcesPath
							+ 'spring/application-context.xml', resourcesPath
							+ 'spring/application-context.xml', this);

					this
							.template(
									basePath + resourcesPath
											+ '_application.properties.default',
									resourcesPath
											+ 'application.properties.default',
									{
										driverName : this.parsedConfigurations.dsConfigs[0].defaultConfig.driverName,
										initialsize : this.parsedConfigurations.dsConfigs[0].defaultConfig.poolConfig.initialsize,
										maxTotal : this.parsedConfigurations.dsConfigs[0].defaultConfig.poolConfig.maxTotal,
										maxIdle : this.parsedConfigurations.dsConfigs[0].defaultConfig.poolConfig.maxIdle,
										minIdle : this.parsedConfigurations.dsConfigs[0].defaultConfig.poolConfig.minIdle,
										maxWaitTime : this.parsedConfigurations.dsConfigs[0].defaultConfig.poolConfig.maxWaitTime,
										defaultTimeout : this.parsedConfigurations.dsConfigs[0].defaultConfig.poolConfig.defaultQueryTimeout
									});

					this
							.template(
									basePath + resourcesPath
											+ '_dev.database.properties',
									resourcesPath + 'dev.database.properties',
									{
										url : this.parsedConfigurations.dsConfigs[0].dev.url,
										userName : this.parsedConfigurations.dsConfigs[0].dev.userName,
										password : this.parsedConfigurations.dsConfigs[0].dev.password
									});

					this
							.template(
									basePath + resourcesPath
											+ '_test.database.properties',
									resourcesPath + 'test.database.properties',
									{
										url : this.parsedConfigurations.dsConfigs[0].test.url,
										userName : this.parsedConfigurations.dsConfigs[0].test.userName,
										password : this.parsedConfigurations.dsConfigs[0].test.password
									});

					this
							.template(
									basePath + resourcesPath
											+ '_prod.database.properties',
									resourcesPath + 'prod.database.properties',
									{
										url : this.parsedConfigurations.dsConfigs[0].prod.url,
										userName : this.parsedConfigurations.dsConfigs[0].prod.userName,
										password : this.parsedConfigurations.dsConfigs[0].prod.password
									});
					this.template(basePath + resourcesPath
							+ 'spring/_database.xml', resourcesPath
							+ 'spring/database.xml');

					// Entity creation
					for (var i = 0; i < this.xsdObjects.length; i++) {
						var xsdObject = this.xsdObjects[i];

						this.template(basePath + javaPath + 'Entity.java',
								javaPath + packageStruct + 'dto/'
										+ xsdObject.name + ".java", {
									packageName : this.packageName,
									className : xsdObject.name,
									fields : xsdObject.variables
								})
					}

					this
							.template(
									basePath
											+ javaPath
											+ 'package/controller/ApplicationController.java',
									javaPath
											+ packageStruct
											+ 'controller/ApplicationController.java',
									{
										packageName : this.packageName,
										restInvokersClassImports : this.restInvokersClassImports,
										restInvokers : this.restInvokers

									});
					this.template(basePath + javaPath
							+ 'package/controller/BaseController.java',
							javaPath + packageStruct
									+ 'controller/BaseController.java', {
								packageName : this.packageName
							});

					this.template(basePath + javaPath
							+ 'package/util/JacksonMapper.java', javaPath
							+ packageStruct + 'util/JacksonMapper.java', {
						packageName : this.packageName

					});

				}

			}

		});
