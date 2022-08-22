angular.module('app.system.location', ['app.system'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider

            .state('app.system.location', {
                url: '/location',
                abstract: true,
                template: '<ui-view/>'
            })

            .state('app.system.location.address', {
                url: '/address',
                controller: 'AddressesListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/location/address/list.html'
            })
            .state('app.system.location.addressnew', {
                url: '/address/new',
                controller: 'AddressEditController',
                templateUrl: 'app/location/address/edit.html'
            })
            .state('app.system.location.addressedit', {
                url: '/address/{addressId}',
                controller: 'AddressEditController',
                templateUrl: 'app/location/address/edit.html'
            })

            .state('app.system.location.place', {
                url: '/place',
                controller: 'PlacesListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/location/place/list.html'
            })
            .state('app.system.location.placenew', {
                url: '/place/new',
                controller: 'PlaceEditController',
                templateUrl: 'app/location/place/edit.html'
            })
            .state('app.system.location.placeedit', {
                url: '/place/{placeId}',
                controller: 'PlaceEditController',
                templateUrl: 'app/location/place/edit.html'
            })
    }])
    .controller('AddressesListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []

        };

        $scope.new = () => {
            $state.go('app.location.addressnew');
        }

        $scope.app.title = $translate.instant('info.address');
    }
    ])

    .controller('AddressEditController', ['$scope', '$translate', '$stateParams', 'Restangular', '$state', ($scope, $translate, $stateParams, Restangular, $state) => {

        var id = $stateParams.addressId;

        function load() {
            if (id) {
                Restangular.one('location').one('address', id).get().then(result => {
                    $scope.address = result;
                    $scope.app.title = $translate.instant('info.address');
                });
            }
        }

        load();

        $scope.save = () => {
            if ($scope.address.id) {
                $scope.address.save().then(() => {
                    $state.go('app.location.address');
                });
            } else {
                Restangular.service('location/address').post($scope.address).then(() => {
                    $state.go('app.location.address');
                });
            }
        };

        $scope.delete = function () {
            if ($scope.address.id) {
                $scope.address.remove().then(() => {
                    $state.go('app.location.address');
                });
            }
        }
    }
    ])

    .directive('addressGrid', ($state, $document, $translate) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'addressGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 250;
                var colNames = ['', $translate.instant('info.street'), $translate.instant('info.streetnumber'), $translate.instant('info.floor'), $translate.instant('info.appartment')];
                var colModel: Array<any> = [
                    {
                        name: 'editCommand',
                        index: 'editCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: () => { return '<i class="fa fa-search-plus fa-fw hand"></i>'; }
                    },
                    { name: 'street', index: 'street' },
                    { name: 'streetNumber', index: 'streetNumber' },
                    { name: 'floor', index: 'floor' },
                    { name: 'appartment', index: 'appartment' }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/location/address.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    jsonReader: {
                        page: obj => ((obj.offset / 100) + 1),
                        total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.location.addressedit';
                            $state.go(stateName, { addressId: rowId });
                        }

                        return false;
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');
            }
        };
    })

    .directive('placeLookup', [() => {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attr: any, ctrl:any) => {
                if (!ctrl) return;

                var required = attr.required ? attr.required : false;
                ctrl.$render = () => {
                    element.val(scope.$eval(attr.ngModel));

                    element.select2({
                        placeholder: 'Seleccione un lugar',
                        allowClear: !required,
                        initSelection: (element1, callback) => {
                            var url = '/api/locaton/places/' + ctrl.$modelValue;
                            $.getJSON(url, { format: 'json' }, data => {
                                callback({ id: data.id, text: data.name });
                            });
                        },
                        ajax: {
                            url: '/api/location/places/lookup?format=json',
                            dataType: 'json',
                            quietMillis: 100,
                            data: (term, page) => {
                                return {
                                    q: term,
                                    pageSize: 15,
                                    page: page
                                };
                            },
                            results: (data, page) => {
                                var more = (page * 10) < data.total;
                                return { results: data.data, more: more };
                            }
                        }
                    });
                };

                element.bind('change', () => {
                    scope.$apply(() => {
                        var data = element.select2('data');
                        ctrl.$setViewValue(data ? data.id : null);
                    });
                });

                attr.$observe('disabled', value => {
                    element.select2(value && 'disable' || 'enable');
                });
            }
        };
    }])

    .directive('placeGrid', ($state, $document, $translate, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'placeGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 250;
                var colNames = ['', $translate.instant('info.name'), $translate.instant('info.type'), $translate.instant('info.parent')];
                var colModel: Array<any> = [
                    {
                        name: 'editCommand',
                        index: 'editCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: () => { return '<i class="fa fa-search-plus fa-fw hand"></i>'; }
                    },
                    { name: 'name', index: 'name' },
                    { name: 'placeTypeName', index: 'placeTypeName' },
                    {
                        name: 'placeParentId', index: 'placeParentId', formatter: (cellValue) => {
                            // TO CHANGE LATER
                            var res = {
                                name: ""
                            };
                            Restangular.one('location').one('places', cellValue).get().then(function (result) {
                                res.name = result.name;
                                return res.name;
                            });
                            return res.name;
                        }
                    }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/location/places.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    jsonReader: {
                        page: obj => ((obj.offset / 100) + 1),
                        total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.location.placeedit';
                            $state.go(stateName, { placeId: rowId });
                        }

                        return false;
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');
            }
        };
    })

    .controller('PlacesListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []

        };

        $scope.new = () => {
            $state.go('app.location.placenew');
        }

        $scope.app.title = $translate.instant('info.place');
    }
    ])

    .controller('PlaceEditController', ['$scope', '$translate', '$stateParams', 'Restangular', '$state', ($scope, $translate, $stateParams, Restangular, $state) => {

        var id = $stateParams.placeId;

        function load() {
            if (id) {
                Restangular.one('location').one('places', id).get().then(result => {
                    $scope.place = result;
                    $scope.app.title = $translate.instant('info.place');
                });
            }
        }

        Restangular.one('location').one('places/lookup').get().then(function (result) {
            $scope.placeParents = result.data;

        });

        load();

        $scope.save = () => {
            if ($scope.place.id) {
                $scope.place.save().then(() => {
                    $state.go('app.location.place');
                });
            } else {
                Restangular.service('location/places').post($scope.place).then(() => {
                    $state.go('app.location.place');
                });
            }
        };

        $scope.delete = function () {
            if ($scope.place.id) {
                $scope.place.remove().then(() => {
                    $state.go('app.location.place');
                });
            }
        }
    }
    ])
; 