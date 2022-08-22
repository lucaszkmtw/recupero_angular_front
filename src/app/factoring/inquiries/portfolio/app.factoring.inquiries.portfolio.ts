angular.module('app.factoring.inquiries.portfolio', [])
   .config(['$stateProvider', $stateProvider => {
        $stateProvider
        .state('app.factoring.inquiries.portfolio', {
            url: '/portfolio',
            controller: 'factoringPortfolioController',
            templateUrl: 'app/factoring/inquiries/portfolio/portfolio-list.html',
            resolve: loadSequence('jqueryui', 'ui.footable'),
            ncyBreadcrumb: {
                label: 'factoring.inquiries.portfolio',
                parent: 'app.factoring.inquiries'
            }
        });
    }])
    .controller('factoringPortfolioController', ['$scope', '$stateParams', '$translate', '$state', 'Restangular', ($scope ,$stateParams, $translate, $state, toastr, Restangular) => {
        var porfolioObj = { 
            portfoliosdecline : [],
            portfoliosbyclient : {
                businesspartners: [
                    {
                        id: 10799,
                        typeId: 1,
                        code: "4",
                        personId: 35706,
                        personCode: "30707735976",
                        personName: ", Big Bloom S.A.",
                        type:"juridica",
                        email: "email@email.com",
                        phone:"0800-666-555",
                        originador: "Jimena Babio",
                        ins:"Cheque",
                        balance:15000.00 
                    }, 
                    {
                        id: 10800,
                        typeId: 1,
                        code: "5",
                        personId: 47222,
                        personCode: "30658050733",
                        personName: ", Ekover S.A.",
                        type:"juridica",
                        email: "email@email.com",
                        phone:"0800-666-555",
                        originador: "Jimena Babio",
                        ins:"Cheque",
                        balance:2000
                    }
                ],
                meta:17000.00 
            },
            portfoliosobtopay : {
                businesspartners: [
                    {
                        id: 10799,
                        typeId: 1,
                        code: "4",
                        personId: 35706,
                        personCode: "30707735976",
                        personName: ", Big Bloom S.A.",
                        type:"juridica",
                        email: "email@email.com",
                        phone:"0800-666-555",
                        originador: "Jimena Babio",
                        ins:"Cheque",
                        balance:15000.00 
                    },
                    {
                        id: 10800,
                        typeId: 1,
                        code: "5",
                        personId: 47222,
                        personCode: "30658050733",
                        personName: ", Ekover S.A.",
                        type:"juridica",
                        email: "email@email.com",
                        phone:"0800-666-555",
                        originador: "Jimena Babio",
                        ins:"Cheque",
                        balance:2000
                    }
                ],
                meta:17000.00 
            }
        };
             
        function loadPortfolio() {
            $scope.porfolio = porfolioObj;
        }

        loadPortfolio();
    }])
    .directive('porfoliosDecline', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@',  porfoliosDecline: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/portfolio/portfoliodecline.html',
            link(scope: any, element) {
              
            }
        };
    }])
    .directive('porfoliosByclient', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: { height: '@',  clientInstance: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/portfolio/portfoliobyclient.html',
            link(scope: any, element) {
              scope.viewCheckingAccount = function (id) {
                 
                      $state.go("app.factoring.inquiries.client", { clientId: id });
                 }
            }
        };
    }])
    .directive('porfoliosObtopay', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@',  obtopayInstance: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/portfolio/portfolioobtopay.html',
            link(scope: any, element) {
               scope.viewCheckingAccount = function (id) {
                 
                      $state.go("app.factoring.inquiries.obtopayview", { clientId: id });
                 }
            }
        };
    }]);