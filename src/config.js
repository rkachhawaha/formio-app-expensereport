//var APP_URL = 'http://voirqgunrcsemml.localhost:3000';
//var API_URL = 'http://voirqgunrcsemml.localhost:3000';
var APP_URL = 'http://voirqgunrcsemml.form.io';
var API_URL = 'http://voirqgunrcsemml.form.io';

// Parse query string
var query = {};
location.search.substr(1).split("&").forEach(function(item) {
  query[item.split("=")[0]] = item.split("=")[1] && decodeURIComponent(item.split("=")[1]);
});

APP_URL = query.appUrl || APP_URL;
API_URL = query.apiUrl || API_URL;

angular.module('formioAppBasic').constant('AppConfig', {
  appUrl: APP_URL,
  apiUrl: API_URL,
  forms: {
    userForm: APP_URL + '/user',
    userLoginForm: APP_URL + '/user/login',
    userRegisterForm: APP_URL + '/user/register',
    employeeLoginForm: APP_URL + '/employee/login',
    managerLoginForm: APP_URL + '/manager/login'
  },
  resources: {
    user: {
      form: APP_URL + '/user',
      resource: 'UserResource'
    },
    employee: {
      form: APP_URL + '/employee',
      resource: 'EmployeeResource'
    },
    expense: {
      form: APP_URL + '/expense',
      resource: 'ExpenseResource'
    }
  }
});
