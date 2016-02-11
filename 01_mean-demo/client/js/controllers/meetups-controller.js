app.controller('meetupsController', ['$scope', '$resource', function ($scope, $resource) {   
    var Meetup = $resource('/api/meetups');
    
    Meetup.query(function (results) {
       $scope.meetups = results; 
    });
    
    $scope.meetups = []
    
    $scope.createMeetup = function() {      
//        $scope.meetups.push({ name: $scope.meetupName })
//        $scope.meetupName = '';
    var meetup = new Meetup();
    meetup.name = $scope.meetupName;
    meetup.$save(function (result) {
        $scope.meetups.push(result);
        $scope.meetupName = '';
    });
    }
}]);