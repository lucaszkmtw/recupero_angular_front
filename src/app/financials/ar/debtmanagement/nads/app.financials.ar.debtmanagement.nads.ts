angular.module('app.financials.ar.debtmanagement.nads', [])
    .config(($stateProvider) =>  {
        $stateProvider
            .state('app.financials.ar.debtmanagement.nad', {
                url: '/nad/list',
                controller: 'FinancialsDebtListManagementNadController',
                templateUrl: 'app/financials/ar/debtmanagement/nads/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'Expedientes'
                }
            })
            .state('app.financials.ar.debtmanagement.edit',
                {
                    url: '/nad/{documentId}',
                    controller: 'FinancialsDebtManagementNadController',
                    templateUrl: 'app/financials/ar/debtmanagement/nads/form.html',
                    resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                    ncyBreadcrumb: {
                        parent: 'app.financials.ar.debtmanagement.nad',
                        label: ' {{document.documentType.name}}'
                    },
                    data: {
                        requiresLogin: true,
                        edit: true
                    }

                })
            .state('app.financials.ar.debtmanagement.new',
                {
                    url: '/nad/new/{documentId}',
                    controller: 'FinancialsDebtManagementNadController',
                    templateUrl: 'app/financials/ar/debtmanagement/nads/form.html',
                    resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                    ncyBreadcrumb: {
                        parent: 'app.financials.ar.debtmanagement.nad',
                        label: '{{ "command.new.f" | translate }} {{document.documentType.name}}'
                    },
                    data: {
                        requiresLogin: true,
                        edit: true
                    }

                });
    })
    .controller('FinancialsDebtListManagementNadController', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.new');
        }

        $scope.newNad = () => {
            //TODO
        }

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            //  $state.go('app.health.treatmentrequest', { treatmentRequestId: id });
        };

        $scope.canEdit = () => {
            return $scope.params.view === 0 || $scope.session.isAdmin();
        }

        $scope.edit = (id) => {
            //  $state.go('app.health.treatmentrequestedit', { treatmentRequestId: id });
        };

        function load() {
            
            ///api/businessdocuments/documents?module=7
            Restangular.one('businessdocuments').one('documentnads').get({ module: 7 }).then(result => {
                console.log(result);
            });
            $scope.$broadcast('loadData');
        }

        load();
    })
    .controller('FinancialsDebtManagementNadController', ['$scope', "$timeout", '$translate', '$stateParams', '$state', 'Restangular', 'FileUploader', 'toastr', '$log', 'session', "dialogs"
        , ($scope: ICreditBusinessDocumentScope, $timeout, $translate, $stateParams, $state, Restangular, FileUploader, toastr, $log, session, dialogs) => {
            var id = $stateParams.documentId;
            var edit = $state.current.data && $state.current.data.edit || false;

            $scope.uploader = new FileUploader({
                scope: $scope,
                autoUpload: true,
                removeAfterUpload: false
            });

            //  $scope.options.uploadProgress = 0;

            $scope.documentTypes = [];
            $scope.documentOptions = { edit: edit };
            $scope.options = $scope.documentOptions;
            $scope.options.canEdit = () => {
                return !angular.isDefined($scope.document.approvalWorkflowId);
            };
            $scope.options.canSave = () => {
                if (!$scope.document) {
                    return false;
                }
                if ($scope.document.items.lenght === 0) {
                    return false;
                }

                return true;
                // return !angular.isDefined($scope.document.approvalWorkflowId);
            };

            $scope.openCreditSelector = () => {
       
                var item  = {  categoryId : $scope.document.categoryId, productId: null, productName: '', unitPrice: 0,voidDate:null,notificationDate:null, quantity: 1, creditors: [], debtors: [], fieldsJSON: {} };

                var modal = dialogs.create(
                    "app/financials/ar/debtmanagement/nads/modal.credits.html",
                    "selectCreditController",
                    item,
                    { size: "lg", animation: true }
                );

                modal.result.then(
                    result => {
                        var item = result;
                        console.log(item);
                        // $scope.document.netAmount = $scope.document.netAmount + item.unitPrice;
                        // $scope.document.totalAmount = $scope.document.netAmount;
                        $timeout(() => {
                            if( !$scope.document.items){
                                $scope.document.items = new Array<any>();
                            }
                            $scope.document.items.push(item);
                            calcTotals();
                            console.log($scope.document);
                         
                        });
                    },
                    () => { }
                );
            };

            $scope.addLaws = (item, index) => {
                if (item) {
                    item.issuerId = $scope.document.issuerId;
                    var modal = dialogs.create(
                        "app/financials/ar/debtmanagement/nads/modal.laws.html",
                        "selectLawController",
                        item,
                        { size: "lg", animation: true }
                    );

                    modal.result.then(
                        result => {
                            if (result) {
                                $scope.document.items.splice(index, 1);
                                $timeout(() => {
                                    $scope.document.items.push(result);
                                    // $scope.document.items.splice(index, 1);
                                    calcTotals();
                                });
                            }
                        },
                        () => { }
                    );
                }
            }

            $scope.editSelectedItem = (item, index) => {
                if (item) {
                    item.categoryId = $scope.document.categoryId;
                    var itemEdit = angular.copy(item);;
                    var modal = dialogs.create(
                        "app/financials/ar/debtmanagement/nads/modal.credits.html",
                        "selectCreditController",
                        itemEdit,
                        { size: "lg", animation: true }
                    );

                    modal.result.then(
                        result => {
                            var newItem = angular.copy(result);;
                            if (result) {
                                $timeout(() => {
                                    $scope.document.items.splice(index , 1);
                            },500);
                            
                           
                           
                            console.log('Finish edit');
                            console.log($scope.document.items);
                                $timeout(() => {
                                   // item.creditors = [];
                                   // item.debtors = [];
                                    $scope.document.items.push(newItem);
                            //     $scope.document.items[index] = newItem;
                                    
                                   
                                    // $scope.document.items.splice(index, 1);
                                    calcTotals();
                                }, 600);
                            }
                        },
                        () => {}
                    );
                }
            }

            $scope.removeSelectedItem = (item) => {

                var dlg = dialogs.confirm('Editor de Conceptos', 'Está seguro que desea eliminar este concepto?');
                dlg.result.then((btn) => {
                    $scope.document.items.splice(item, 1);
                    calcTotals();
                });

            }

            function calcTotals() {
                try{
                var total = 0;
                $scope.document.items.forEach(item => {
                    total = total + item.unitPrice;

                });
                $scope.document.netAmount = total;
                $scope.document.totalAmount = total;

                var maxNotItem :Date = null;

                $scope.document.items.forEach(element => {
                    if(element.notificationDate){
                      
                    
                    if(!maxNotItem){
                        maxNotItem = new  Date(element.notificationDate);
                    }else{
                        if(maxNotItem > new  Date(element.notificationDate) ){
                            maxNotItem = new  Date(element.notificationDate);
                        }
                    }
                }
                });
                if(maxNotItem){
                    $scope.document.notificationDate = maxNotItem;
                }
                
                 
               
            }
            catch{ console.log('Error totales');}
            }

            $scope.edit = () => {
                $scope.documentOptions.edit = true;
            }

            $scope.save = () => {
                if ( $scope.document.id) {
                    $scope.document.total = $scope.document.totalAmount;
                    var countItems = 0;
                    $scope.document.items.forEach(element => {
                        countItems = countItems + 1;
                        element.fieldsJSON = JSON.stringify(element.fieldsJSON, null, "    ");
                        console.log(element.fieldsJSON);
                    });
                    if (countItems === 0) {
                        toastr.error('Editor de documento', 'El documento debe contener al menos un concepto');
                        return;
                    }
                    $scope.document.put().then(() => {
                        toastr.success('El documento se actualizó con éxito');
                        $state.reload();
                    });
                } else {
                    $scope.document.total = $scope.document.totalAmount;
                    var countItems = 0;
                    $scope.document.items.forEach(element => {
                        countItems = countItems + 1;
                        element.fieldsJSON = JSON.stringify(element.fieldsJSON, null, "    ");
                        console.log(element.fieldsJSON);
                    });
                    if (countItems === 0) {
                        toastr.error('Editor de documento', 'El documento debe contener al menos un concepto');
                        return;
                    }
                    ///businessdocuments/documents/nad
                    Restangular.service('businessdocuments/documents/nad').post($scope.document).then((result) => {
                        toastr.success('Editor de documento', 'El documento se creó con éxito');
                        $state.go('app.financials.ar.debtmanagement.nad');
                    });
                }
            }

            $scope.submitForApproval = () => {
                Restangular.service('businessdocuments/documents/' + $scope.document.guid + '/submitforapproval').post({}).then((result) => {
                    toastr.success('Editor de documento', 'Se ha iniciado el proceso de aprobación del documento con éxito.');
                    $state.go('app.financials.ar.debtmanagement.nad');
                });
            }

            function loadDocuments() {
                ///businessdocuments/types.json?CollectionDocument=1
                Restangular.one('businessdocuments').one('types').get({ CollectionDocument: 1 }).then(result => {

                    $scope.documentTypes = result.results;

                    if (angular.isDefined($scope.document) && $scope.document.id !== null) {
                        $scope.document.documentType = _.find($scope.documentTypes, { id: $scope.document.typeId });
                    }
                });
            }
            function load() {
                loadDocuments();
                $scope.document = {id:null, items: [], netAmount: 0, totalAmount: 0, issuerId: null };
                console.log('load :' + id);
                if (id) {
                    //nessdocuments/documents/collect/70
                    Restangular.one('businessdocuments').one('documents').one('nad', id).get().then(result => {
                        $scope.document = result;
                        // if ($scope.document.issuerId != session.tenant.personId) {
                        //     $scope.document.byOrderOf = true;
                        //     $scope.document.options.receiverId = $scope.document.issuerId;
                        // }
                        //  console.log( $scope.document.items);
                        $scope.document.items.forEach(item => {
                            try {
                               
                                item.fieldsJSON = angular.fromJson(item.fieldsJSON);
                                item.productName = item.product.name;
                                console.log(item.fieldsJSON);
                            }
                            catch{
                                console.log('Error Parse String to JSON object');
                            }
                        });
                        calcTotals();
                    });
                } else {
                    $scope.document = { items: [], netAmount: 0, totalAmount: 0, issuerId: null };
                    console.log('new document');
                }
            }

            load();
        }])
        //selectLawController
        .controller(
            "selectLawController",
            ($scope, $uibModalInstance, Restangular, data) => {
                $scope.item =null;
                $scope.itemEdit = data;
                $scope.newLaw = { LawId: null, Text: '' };
                $scope.selectedType = {};
    
                load();
    
                function load() {
                    if ($scope.itemEdit) {
                        
                        $scope.item = $scope.itemEdit;
                        $scope.issuerId = $scope.item.issuerId;
                        // $scope.item.fieldsJSON =   angular.fromJson( $scope.item.fieldsJSON);
                    }

                    console.log($scope.item);
                }

                $scope.removeSelectedItem = (item) => {

                  //  var dlg = dialogs.confirm('Editor de Conceptos', 'Está seguro que desea eliminar este concepto?');
                   // dlg.result.then((btn) => {
                    $scope.item.lawTexts.splice(item, 1);
                       
                   // });
                }
    
                $scope.addLaw = function(){
                    if(!$scope.item.lawTexts){
                        $scope.item.lawTexts = new Array<any>();
                    }
                    var law = $scope.newLaw;
                   
                    Restangular.one('financials/debtmanagement/laws', law.LawId).get().then(result => {
                       
                    $scope.item.lawTexts.push( { lawId: law.LawId, text: law.Text, name: result.name });
                    $scope.newLaw.LawId = null;
                    $scope.newLaw.Text ='';
                    });
                }
    
                $scope.cancel = function () {
                    $uibModalInstance.dismiss("Canceled");
                }; // end cancel
    
                $scope.save = function () {
                    console.log($scope.item);
                    $uibModalInstance.close($scope.item);
                };
    
    
                // $scope.$watch('item.productId', function (newValue, oldValue) {
                //     console.log(newValue);
                //     if ($scope.itemEdit) {
                //         if ($scope.itemEdit.productId === newValue) {
    
                //             console.log('igual ' + $scope.itemEdit.productId + ' - ' + newValue);
                //             $scope.itemEdit = null;
                //             return;
                //         }
                //     }
                //     $scope.itemEdit = null;
                //     $scope.item.fieldsJSON = null;
                //     if (newValue) {
    
                //         Restangular.one('catalog').one('productsconfig', newValue).get().then(result => {
                //             console.log(result);
                //             if (result) {
                //                 $scope.item.productName = result.name;
                //                 $scope.selectedType = result;
                //                 parseJsonObject($scope.selectedType.fieldsJSON);
                //             }
                //         });
                //     }
    
    
                // });
    
                function parseJsonObject(objectJson) {
                    if (objectJson) {
                        try {
                            $scope.item.fieldsJSON = angular.fromJson(objectJson);
                            console.log($scope.item.fieldsJSON);
                        }
                        catch{
    
                            //   $scope.item.fieldsJSON = templateFields;
                            console.log('error parse json object' + objectJson);
                        }
                    }
                }
            }
        )
    .controller(
        "selectCreditController",
        ($scope, $uibModalInstance, Restangular, data) => {

            $scope.itemEdit = data;
            $scope.item = { productId: null, productName: '', unitPrice: 0,voidDate:null,notificationDate:null, quantity: 1, creditors: [], debtors: [], fieldsJSON: {} };
            $scope.selectedType = {};

            load();

            function load() {
                if ($scope.itemEdit) {
                    
                    $scope.item = $scope.itemEdit;
                    $scope.categoryId = $scope.item.categoryId;
                    if( !$scope.item.creditors ){
                        $scope.item.creditors = [];
                    }
                    if( !$scope.item.debtors ){
                        $scope.item.debtors = [];
                    }
                    // $scope.item.fieldsJSON =   angular.fromJson( $scope.item.fieldsJSON);
                }
            }

            $scope.cancel = function () {
                $uibModalInstance.dismiss("Canceled");
            }; // end cancel

            $scope.save = function () {
                console.log($scope.item);
                $uibModalInstance.close($scope.item);
            };


            $scope.$watch('item.productId', function (newValue, oldValue) {
                console.log(newValue);
                if ($scope.itemEdit) {
                    if ($scope.itemEdit.productId === newValue) {

                        console.log('igual ' + $scope.itemEdit.productId + ' - ' + newValue);
                        $scope.itemEdit = null;
                        return;
                    }
                }
                $scope.itemEdit = null;
                $scope.item.fieldsJSON = null;
                if (newValue) {

                    Restangular.one('catalog').one('productsconfig', newValue).get().then(result => {
                        console.log(result);
                        if (result) {
                            $scope.item.productName = result.name;
                            $scope.selectedType = result;
                            parseJsonObject($scope.selectedType.fieldsJSON);
                        }
                    });
                }


            });

            function parseJsonObject(objectJson) {
                if (objectJson) {
                    try {
                        $scope.item.fieldsJSON = angular.fromJson(objectJson);
                        console.log($scope.item.fieldsJSON);
                    }
                    catch{

                        //   $scope.item.fieldsJSON = templateFields;
                        console.log('error parse json object' + objectJson);
                    }
                }
            }
        }
    )
    .directive('nadsGrid', ($state, $log, $compile, $filter, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@', view: '=', filter: '=' },
            link(scope: any, element) {
                /*var tabsElement = '<div><uib-tabset>'
                    + '<uib-tab heading="Secretaría" select="changeView(0)"></uib-tab>'
                    + '<uib-tab heading="DDDR" select="changeView(1)"></uib-tab>'
                    + '<uib-tab heading="DCEO" select="changeView(2)"></uib-tab>'
                    + '<uib-tab heading="DGJ" select="changeView(3)"></uib-tab>'
                    + '<uib-tab heading="Fiscalía" select="changeView(4)"></uib-tab>'
                    + '</uib-tabset></div>';*/
                var gridElementName = 'nadsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);

                //element.append($compile(tabsElement)(scope));
                element.append($compile(gridElement)(scope));
                element.append($compile(pagerElement)(scope));

                scope.height = scope.height || 600;
                scope.personId = null;
                scope.showHeader = scope.showHeader || false;
                scope.view = scope.view || 0;
                scope.filter = scope.filter || null;

                scope.changeView = (view) => {
                    scope.view = view;
                    var status = 0;
                    /*
                    20 -Secretaria
30 -DDR
40 -DCEO
50 -DGJ
60 -FISCALIA
                    */
                    switch(view){
                        case 0:
                        {
                            status =20;
                            break;
                        }
                        case 1:
                        {
                            status =30;
                            break;
                        }
                        case 2:
                        {
                            status =40;
                            break;
                        }
                        case 3:
                        {
                            status =50;
                            break;
                        }
                        case 4:
                        {
                            status =60;
                            break;
                        }
                    }
                    loadData(status);
                }

                scope.canEdit = () => {
                    return scope.view === 0;
                };

                scope.edit = (id) => {
                    $state.go('app.financials.ar.debtmanagement.edit', { documentId: id });
                }

                function claimIdFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<span class="largefontcell">' + rowObject.workflowCode + '-' + rowObject.id + '</span>';
                }

                function workflowStatusFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = null;

                    if (rowObject.workflowInstanceIsTerminated) {
                        template = '<div class="label label-danger" style="display: block;">'
                            + 'Cancelado'
                            + '</div>';
                    } else {
                        template = '<div class="label label-primary" style="display: block;">'
                            + rowObject.workflowActivityName
                            + '</div>';
                    }

                    if (!rowObject.workflowActivityIsFinal) {
                        template += '<div class="label label-info" style= "display: block; margin-top: 2px;">'
                            + rowObject.roles
                            + '</div>';
                    }

                    return template;
                }

                function claimDataFormatter(cellvalue: any, options: any, rowObject: any) {
                    var createDate = $filter('amDateTime')(rowObject.workflowInstanceCreateDate);
                    var date = $filter('amDateTime')(rowObject.date);
                    return 'Solicitud de prestación | <small>Paciente</small> <a data-ui-sref="app.system.person({ personId: ' + rowObject.personId + ' })" title="Ver ficha">' + rowObject.personName + '</a><br><small>Creada el ' + createDate + '</small><br><small>Fecha ' + date + '</small></td>';
                }

                function claimActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var result = '<a href="#" data-ui-sref="app.financials.ar.debtmanagement.edit({ documentId: ' + rowObject.id + ' })" class="btn btn-white btn-sm"><i class="fa fa-folder"></i> Ver </a>';
                    if (scope.canEdit()) {
                        result += '<button type="button" data-ng-click="edit(' + rowObject.id + ')" class="btn btn-white btn-sm"><i class="fa fa-pencil"></i> Editar</button>';
                    }

                    return result;
                }



                function workflowProgressFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<small> Completa al: ' + rowObject.workflowInstanceProgress + ' % </small><div class="progress progress-mini"><div style="width:' + rowObject.workflowInstanceProgress + '%;" class="progress-bar"></div></div>';
                }

                var colNames = ['Fecha', 'Numero de Nad.', 'Deudor', 'Total', ''];
                var colModel: Array<any> = [
                   // { name: 'typeName', index: 'typeName', width: 90, fixed: true, search: false,align: 'center' },
                    { name: 'documentDate', index: 'documentDate', width: 100, fixed: true, search: false, formatter: 'date',align: 'center' },
                    { name: 'number', index: 'number', width: 150, fixed: true, search: false,align: 'center' },
                    //{ name: 'issuerName', index: 'issuerName', width: 190, fixed: true, search: false, align: 'center' },
                    { name: 'receiverName', index: 'receiverName', width: 190, fixed: true, search: false, align: 'center' },
                    //{ name: 'categoryName', index: 'categoryName', width: 190, fixed: true, search: false, align: 'center' },
                    { name: 'total', index: 'total', width: 120, fixed: true, search: false, align: 'right' },
                    { name: 'actions', index: 'actions', width: 150, fixed: true, search: false, formatter: claimActionsFormatter }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    datatype: 'local',
                    height: scope.height,
                    autowidth: true,
                    shrinkToFit: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    rowNum: 100,
                    loadBeforeSend: function (jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    jsonReader: {
                        page: obj => {
                            var page = (obj.offset / 100) + 1;
                            return page;
                        },
                        total: obj => {
                            var total = (obj.total <= 100) ? 1 : (((obj.total / 100) >> 0) + (obj.total % 100 > 0 ? 1 : 0));
                            return total;
                        },
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });

                        if (scope.personId) {
                            gridElement.jqGrid('setGridParam', { postData: { personId: scope.personId } });
                        }
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            /*
                            var stateName = 'app.health.requestedit';
                            $state.go(stateName, { requestId: rowId });
                            */
                        }

                        return false;
                    },
                    loadComplete: () => {
                        $compile(angular.element('#' + gridElementName))(scope);
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');

                // if (!scope.showHeader) {
                //     var header = $('#gview_' + gridElementName + ' .ui-jqgrid-hdiv').hide();
                // }

                gridElement.addClass('ui-jqgrid-noborders');

                function loadData(status) {
                    // Restangular.one('businessdocuments').one('documents').get({ module:7 })
                    var url = '/api/businessdocuments/documentnads.json?module=7&status=' +status;
                    gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: API_HOST + url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$on('loadData', (event, personId) => {
                    if (personId) {
                        scope.personId = personId;
                    }
                    loadData(status);
                });
            }
        };
    });
