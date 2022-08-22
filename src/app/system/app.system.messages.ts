angular.module('app.system.messages', [])
    //OLD
    .directive('messageThread', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', messages: '=', serviceUrl: '=' },
            templateUrl: 'app/system/messages/messagethread.html',
            link(scope: any, element) {
                load();
               function load () {
                $rootScope.$broadcast('reloadMessages', scope.messages);
               }
                scope.postMessage = () => {
                    Restangular.service(scope.serviceUrl)
                        .post({ body: scope.newMessage })
                        .then((messages) => {
                            $rootScope.$broadcast('reloadMessages', messages);
                            scope.newMessage = null;
                        });
                };
            }
        };
    }])
    //OLD
    .directive('message', ['$state', '$rootScope', 'Restangular', ($state, $rootScope, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', message: '=', serviceUrl: '=' },
            templateUrl: 'message.html',
            link(scope: any, element) {
                scope.postReply = (message) => {
                    Restangular.service(scope.serviceUrl)
                        .post({ replyToMessageId: message.id, body: message.newMessage })
                        .then((messages) => {
                            $rootScope.$broadcast('reloadMessages', messages);
                            message.newMessage = null;
                        });
                }
            }
        };
    }
    // .directive('messageThread', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
    //     return {
    //         restrict: 'A',
    //         scope: { height: '@', messageThreadId: '=' },
    //         templateUrl: 'app/system/messages/messagethread.html',
    //         link(scope: any, element) {
    //             scope.postMessage = () => {
    //                 Restangular.service('system/messages/' + scope.messageThreadId)
    //                     .post({ body: scope.newMessage })
    //                     .then((messages) => {
    //                         $rootScope.$broadcast('reloadMessages', messages);
    //                         scope.newMessage = null;
    //                     });
    //             };
    //         }
    //     };
    // }])
    // .directive('message', ['$state', '$rootScope', 'Restangular', ($state, $rootScope, Restangular) => {
    //     return {
    //         restrict: 'A',
    //         scope: { height: '@', messageThreadId: '=' },
    //         templateUrl: 'message.html',
    //         link(scope: any, element) {
    //             scope.postReply = (message) => {
    //                 Restangular.service('system/messages/' + scope.messageThreadId)
    //                     .post({ replyToMessageId: message.id, body: message.newMessage })
    //                     .then((messages) => {
    //                         $rootScope.$broadcast('reloadMessages', messages);
    //                         message.newMessage = null;
    //                     });
    //             }
    //         }
    //     };
    // }])