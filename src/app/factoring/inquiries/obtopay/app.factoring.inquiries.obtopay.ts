angular.module('app.factoring.inquiries.obtopay', [])
   .config(['$stateProvider', $stateProvider => {
        $stateProvider
        .state('app.factoring.inquiries.obtopay', {
            url: '/obtopay',
            controller: 'inquiriesObtopayController',
            templateUrl: 'app/factoring/inquiries/obtopay/list.html',
            resolve: loadSequence('jqueryui', 'ui.footable' ),
            ncyBreadcrumb: {
                label: 'factoring.inquiries',
                parent: 'app.dashboard'
            }
        })
        .state('app.factoring.inquiries.obtopayview', {
            url: '/obtopay/{clientId}',
            controller: 'inquiriesObtopayController',
            templateUrl: 'app/factoring/inquiries/obtopay/view.html',
            resolve: loadSequence('jqueryui', 'ui.footable'),
            ncyBreadcrumb: {
                label: 'factoring.inquiries',
                parent: 'app.dashboard'
            }
        });
    }])
    .controller('inquiriesObtopayController', ['$scope', '$stateParams', '$translate', '$state', 'Restangular', ($scope ,$stateParams, $translate, $state, toastr, Restangular) => {
        var id = $stateParams.clientId;

        function load(){
            $scope.client = { 
                personId: 35706,
                personCode: "30707735976",
                personName: "Big Bloom S.A.",
                porfolio: [],
                actualposition: [],
                expobpay: [],
                limits: [],
                profitability: [],
                portfoliosobtopay : {
                    businesspartners: [{
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
                    balance:15000.00 },
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
        }

        function loadClient(clientId) {
            if (clientId) {
                $scope.client = { 
                    personId: 35706,
                    personCode: "30707735976",
                    personName: "Big Bloom S.A.",
                    porfolio:[],
                    actualposition:[],
                    expobpay:[],
                    limits: [],
                    profitability: [],
                    portfoliosobtopay : {
                        businesspartners: [{
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
                            balance:15000.00 },
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
                            balance:2000}
                            ],
                            meta:17000.00 
                        }
                };
            } else {
                load();
            }
        }

        $scope.viewlistobtopay = () => {
              $state.go("app.factoring.inquiries.obtopay");
        }

        loadClient(id);
    }]);