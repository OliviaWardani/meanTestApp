var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
	
  $http.get("auth/getUser").then(function(result) {     
      if(result.data != ''){
          $rootScope.authenticated = true;
          $rootScope.current_user = result.data.username;
      }else{
          $rootScope.authenticated = false;
          $rootScope.current_user = '';
          $rootScope.isadmin = false;
      }
     $rootScope.currentUser = result.data;
  })
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
		$rootScope.editedUser = '';
        $rootScope.loggedUser = '';
        $rootScope.isadmin = false;
	};
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		})
		//the administrator display
		.when('/user', {
			templateUrl: 'administrator.html',
			controller: 'administratorController'
		})
		//the user setting display
		.when('/user/update', {
			templateUrl: 'userSetting.html',
			controller: 'userSettingController'
		})
        .when('/user/editProfile', {
			templateUrl: 'editProfile.html',
			controller: 'editProfileController'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/posts/:id');
});

app.factory('userService', function($resource){
  return $resource('/user/:id', null,
                  {
      'update':{method:'PUT'}
  });
});

app.factory('changePasswordService', function($resource){
  return $resource('/user/changePassword/:id', null,
                  {
      'update':{method:'PUT'}
  });
});

app.controller('mainController', function(postService, $scope, $rootScope){
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};
    
    $scope.deletePost = function(post){
       postService.delete({ id: post._id }, function() {
           $scope.posts = postService.query();
        });
    } 
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.loggedUser = data.user;
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        if (data.user.isadmin == 'yes') {
        	$rootScope.isadmin = true;
        }
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $rootScope.loggedUser = data.user;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});

app.controller('userSettingController', function($location, $rootScope, $scope, changePasswordService){
	if($rootScope.loggedUser === undefined){
        $location.path('/');
    }
    $scope.user = $rootScope.loggedUser;
    $scope.user.password = '';
    
    $scope.save = function (user){ 
        var userName = user.username;
        
         changePasswordService.update({ id: user._id }, user,function(data) {
         if(data.state == 'failure'){
            $scope.user.username = userName;
            $scope.error_message = data.message;
          }
          else{
               $location.path('/'); 
          }           
        });
    };
    
    $scope.cancelEditing = function(){
         $location.path('/'); 
    }
});

app.controller('administratorController', function($location, $rootScope, $scope, userService){
    
     if($rootScope.authenticated == false){
          $location.path('login');    
     }
    
    $scope.users = userService.query();
    
    $scope.deleteUser = function(user){       
       userService.delete({ id: user._id }, function() {
           $scope.users = userService.query();
        });
    } 
    
    $scope.editProfile = function(user){  
        $rootScope.editedUser = user;
        $location.path('user/editProfile');     
    } 
});

app.controller('editProfileController', function($location, $rootScope, $scope, userService){
    
    if($rootScope.editedUser === undefined){
        $location.path('/user');
    }
    $scope.user = $rootScope.editedUser;
    $scope.user.password = '';
    
    $scope.save = function (user){ 
        var userName = user.username;
        
         userService.update({ id: user._id }, user,function(data) {
         if(data.state == 'failure'){
            $scope.user.username = userName;
            $scope.error_message = data.message;
          }
          else{
               $location.path('user'); 

          }           
        });
    };
    
    $scope.cancelEditing = function(){
         $location.path('user'); 
    }

});