(function() {
  'use strict';
  angular.module('formioAppBasic', [
    'ngSanitize', 
    'ui.router', 
    'ui.bootstrap', 
    'formio', 
    'ngFormioHelper', 
    'ngFormioGrid',
    'ui.grid.selection', 
    'ngDialog', 
    'ngMap',
    ])
  .config([
    '$stateProvider', 
    '$urlRouterProvider', 
    'FormioProvider', 
    'FormioAuthProvider', 
    'ResourceProvider', 
    'AppConfig', 
    '$injector',
    function(
      $stateProvider, 
      $urlRouterProvider, 
      FormioProvider, 
      FormioAuthProvider, 
      ResourceProvider, 
      AppConfig, 
      $injector, 
      ngDialog
    ) {
      FormioProvider.setBaseUrl(AppConfig.apiUrl);
      FormioAuthProvider.setForceAuth(true);
      FormioAuthProvider.setStates('auth.login', 'home');
      FormioAuthProvider.register('login', 'employee');
      FormioAuthProvider.register('mlogin', 'manager');
      $stateProvider.state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: [
        '$scope', 
        '$state', 
        '$rootScope', 
        'AppConfig', 
        '$filter', 
        'dateFunctions', 
        function(
          $scope, 
          $state, 
          $rootScope, 
          AppConfig, 
          $filter, 
          dateFunctions) {
          
          $scope.employee = [];
          $scope.employeeUrl = AppConfig.resources.employee.form;
         
          // code for date functions ------------------------------------
          var myDate = new Date();
          //var currentWeek = $filter('date')(new Date(), 'w');
          var currentYear = $filter('date')(new Date(), 'yyyy');
          $scope.weeksInYear = dateFunctions.weekNumber(currentYear,'1','1');          
          $scope.weekOptions = [];
          var newOptions = [];
          
          for (var i = 1; i <= $scope.weeksInYear; i++) {
            newOptions.push(i);
          }
          
          $scope.weekOptions = newOptions;
         
          //-----------------------------------------------

          var role = $scope.role;
          $scope.setExpenseClass = function(role) {
            switch (role) {
              case 'employee':
                return true;
              case 'manager':
                return false;
            }
            return '';
          };         
        }]
      });
      // Register all of the resources.
      angular.forEach(AppConfig.resources, function(resource, name) {
        ResourceProvider.register(name, resource.form, $injector.get(resource.resource + 'Provider'));
      });
      $urlRouterProvider.otherwise('/');
    }
  ])
  .controller('employeeGrid', [
    '$scope', 
    'ngDialog', 
    'AppConfig', 
    '$filter', 
    'Formio', 
    '$interval', 
    function(
      $scope, 
      ngDialog, 
      AppConfig, 
      $filter, 
      Formio, 
      $interval
    ) {  
      $scope.gridOptions = {
        enableSorting: true, 
        enableFiltering: true
      };

      $scope.$on('rowEdit', function(event, submission) {      
        ngDialog.open({
          template: 'views/employee/edit.html',
          showClose: true,
          closeByEscape: false,
          closeByDocument: false,
          className: 'ngdialog-theme-default project-upgrade',
          preCloseCallback: function(value) {         
            $scope.refreshGrid();                   
          },
          controller: ['$scope', function($scope) {
            $scope.resourceUrl = AppConfig.apiUrl + '/employee/submission/' + submission._id;
            $scope.$on('formSubmission', function(){
              $scope.closeThisDialog();
            }); 
          }]
        });
      });

      $scope.$on('rowView', function(event, submission) {
        ngDialog.open({
          template: 'views/employee/view.html',       
          showClose: true,
          closeByEscape: false,
          closeByDocument: false,
          className: 'ngdialog-theme-default project-upgrade',
          controller: ['$scope', function($scope) {
            $scope.employeeRecord = submission;
          }]      
        });
      });

      $scope.$on('rowDelete', function(event, submission) { 
        ngDialog.openConfirm({
          template: 'views/employee/delete.html',
          showClose: true,
          closeByEscape: false,
          closeByDocument: false,
          className: 'ngdialog-theme-default project-upgrade',
          preCloseCallback: function(value) {
            $scope.refreshGrid();
          },
          controller: ['$scope', function($scope) {
            $scope.deleteResourceUrl = AppConfig.apiUrl + '/employee/submission/' + submission._id;
            $scope.$on('cancel', $scope.closeThisDialog);
            $scope.$on('delete', function(){
              $scope.closeThisDialog();
            });                      
          }]
        });
      });
  }])  
  .controller('expenseGrid', [
    '$scope', 
    'ngDialog', 
    'AppConfig', 
    'Formio', 
    '$interval',
    '$filter', 
    'dateFunctions', 
    '$timeout', 
    '$q', 
    function(
      $scope, 
      ngDialog, 
      AppConfig, 
      Formio, 
      $interval,
      $filter, 
      dateFunctions, 
      $timeout, 
      $q
    ) {
      // Scope GridOption setting
      $scope.gridOptions = {
        enableRowSelection: true
      };

      $scope.$on('rowEdit', function(event, submission) {
        ngDialog.open({
          template: 'views/expense/edit.html',
          showClose: true,
          closeByEscape: false,
          closeByDocument: false,
          className: 'ngdialog-theme-default project-upgrade',
          preCloseCallback: function(value) {
            $scope.refreshGrid();          
          },
          controller: ['$scope', function($scope) {
            $scope.resourceUrl = AppConfig.apiUrl + '/expense/submission/' + submission._id;
            $scope.$on('formSubmission', function(){
              $scope.closeThisDialog();
            });
          }]
        });
      });
      
      $scope.$on('rowView', function(event, submission) {
        ngDialog.open({
          template: 'views/expense/view.html',       
          showClose: true,
          closeByEscape: false,
          closeByDocument: false,
          className: 'ngdialog-theme-default project-upgrade',
          controller: ['$scope', function($scope) {
            $scope.expenseRecord = submission;
            // integration of map
            $scope.position = {lat: '40.74', lng: '-74.18'};
            if (!$scope.expenseRecord) { return; }
            if ($scope.expenseRecord.data.address) {
              $scope.position.lat = $scope.expenseRecord.data.address.geometry.location.lat;
              $scope.position.lng = $scope.expenseRecord.data.address.geometry.location.lng;
            }
          }]      
        });
      });

      $scope.$on('rowDelete', function(event, submission) { 
        ngDialog.openConfirm({
          template: 'views/expense/delete.html',
          showClose: true,
          closeByEscape: false,
          closeByDocument: false,
          className: 'ngdialog-theme-default project-upgrade',
          preCloseCallback: function(value) {
            $scope.refreshGrid();
          },
          controller: ['$scope', function($scope) {
            $scope.deleteResourceUrl = AppConfig.apiUrl + '/expense/submission/' + submission._id;
            $scope.$on('cancel', $scope.closeThisDialog);
            $scope.$on('delete', function(){
              $scope.closeThisDialog();
            });                      
          }]
        });
      });

      $scope.submit = function() {
        $scope.exposeGridApi()
        .then(function(gridApi){
          $scope.pendingExpenseRecord=gridApi.selection.getSelectedRows();
          console.log($scope.pendingExpenseRecord);
          ngDialog.open({
            template: 'views/expense/expenseform.html',       
            showClose: true,
            closeByEscape: false,
            closeByDocument: false,
            className: 'ngdialog-theme-default project-upgrade',
            controller: ['$scope', function($scope, gridApi) {
              
            }]      
          });
        });
      };

      $scope.changeData = function(value){
        var datesBetween = dateFunctions.getWeekDates(value);            
        $scope.formioGridDateBetween(datesBetween.startDate,datesBetween.endDate)
        .then(function(gridApi){
          $timeout(function() {
            var gridData = $scope.gridOptions.data; 
            angular.forEach(gridData, function(row, index){
            if (row.data.status === 'pending') {              
              gridApi.selection.selectRow($scope.gridOptions.data[index]);
            }
          });    
          },100);        
        });    
      };
    }])
    .factory('dateFunctions', ['$filter', function($filter) {
      return {
        weekNumber: function(year, month, day) {
         var date = year instanceof Date ? year.valueOf() : typeof year === "string" ? new Date(year).valueOf() : dateserial(year,month,day), 
          date2 = this.dateserial(this.yearserial(date - this.serial(this.weekday(date-this.serial(1))) + this.serial(4)),1,3);
          return ~~((date - date2 + this.serial(this.weekday(date2) + 5))/ this.serial(7));
        },
        serial: function(days){
          return 86400000*days;
        },
        dateserial: function(year,month,day){
          return (new Date(year,month-1,day).valueOf());
        },
        weekday: function(date) { 
          return (new Date(date)).getDay()+1; 
        },
        yearserial: function(date) { 
          return (new Date(date)).getFullYear(); 
        },
        getWeekDates: function(rawDate){
          var currentYear = $filter('date')(new Date(), 'yyyy');
          var firstDay = new Date(currentYear, 0, 1).getDay();
          var year = currentYear;
          var week = rawDate;
          var d = new Date("Jan 01, "+year+" 01:00:00");        
          var w = d.getTime() -(3600000*24*(firstDay-1))+ 604800000 * (week-1);      
          var startDate = $filter('date')(new Date(w),'yyyy-MM-dd');
          var endDate = $filter('date')(new Date(w + 518400000),'yyyy-MM-dd');
          var datesBetween = {"startDate":startDate,"endDate":endDate};
          return datesBetween;
        }
      };
    }]);
})();