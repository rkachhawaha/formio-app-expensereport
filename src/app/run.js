angular.module('formioAppBasic').run([
  '$rootScope',
  '$state',
  'FormioAuth',
  'AppConfig',
  function(
    $rootScope,
    $state,
    FormioAuth,
    AppConfig
  ) {

    // Initialize authentication.
    FormioAuth.init();

    // Add the forms to the root scope.
    angular.forEach(AppConfig.forms, function(url, form) {
      $rootScope[form] = url;
    });

    // Determine if the current state is active.
    $rootScope.isActive = function(state) {
      return $state.current.name.indexOf(state) !== -1;
    };
  }
]);
