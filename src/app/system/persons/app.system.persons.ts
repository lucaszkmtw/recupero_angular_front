angular.module('app.system.persons', ['app.core', 'app.system'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.system.persons', {
                url: '/persons',
                controller: 'PersonsListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/system/persons/list.html',
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.persons'
                }
            })
            .state('app.system.personnew', {
                url: '/persons/new',
                controller: 'PersonEditController',
                resolve: loadSequence('icheck', 'ui-mask'),
                templateUrl: 'app/system/persons/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.persons',
                    label: 'system.person.new'
                }
            })
            .state('app.system.personedit', {
                url: '/persons/{personId}/edit',
                controller: 'PersonEditController',
                resolve: loadSequence('icheck', "angularFileUpload",
                "ui-mask",
                "imageviewer",
                "jqGrid",
                "toastr",
                "ngCkeditor",
                "ngMap"),
                templateUrl: 'app/system/persons/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.persons',
                    label: 'system.person'
                }
            })
            .state('app.system.person', {
                url: '/persons/{personId}',
                controller: 'PersonViewController',
                templateUrl: 'app/system/persons/view.html',
                resolve: loadSequence('icheck', "angularFileUpload",
                "ui-mask",
                "imageviewer",
                "jqGrid",
                "toastr",
                "ngCkeditor",
                "ngMap"),
                ncyBreadcrumb: {
                    parent: 'app.system.persons',
                    label: 'system.person'
                }
            });
    }
    ])
    .factory('PersonService', [() => {
        var emailTypes: Array<IHasIdAndName> = [
            { id: 1, name: 'emailtype.custom' },
            { id: 2, name: 'emailtype.home' },
            { id: 3, name: 'emailtype.work' },
            { id: 4, name: 'emailtype.other' }
        ];

        var phoneTypes: Array<IHasIdAndName> = [
            { id: 1, name: 'phonetype.custom' },
            { id: 2, name: 'phonetype.home' },
            { id: 3, name: 'phonetype.work' },
            { id: 4, name: 'phonetype.other' }
        ];

        var addressTypes: Array<IHasIdAndName> = [
            { id: 1, name: 'addresstype.custom' },
            { id: 2, name: 'addresstype.home' },
            { id: 3, name: 'addresstype.work' },
            { id: 4, name: 'addresstype.other' },
            { id: 5, name: 'addresstype.registered' }
        ];

        return {
            emailTypes: emailTypes,
            phoneTypes: phoneTypes,
            addressTypes: addressTypes,
            getEmailTypeName: (id: number) => {
                var emailType: IHasIdAndName = _.find(emailTypes, { id: id });
                return emailType.name;
            },
            getPhoneTypeName: (id: number) => {
                var phoneType: IHasIdAndName = _.find(phoneTypes, { id: id });
                return phoneType.name;
            },
            getAddressTypeName: (id: number) => {
                var addressType: IHasIdAndName = _.find(addressTypes, { id: id });
                return addressType.name;
            }
        }
    }])
    .controller('PersonsListController', ($scope, $translate, $state, Restangular,$timeout) => {
        $scope.defaultGroupName = 'Todos las Personas';
        $scope.checkedItems = [];
        
        $scope.params = {
            selectedItems: [],
             filter: ''
        };
    
        $scope.detailPerson = {};
        
        $scope.search = () => {
            $scope.$broadcast('refresh');
        };

        $scope.runAction = (actionId) => {
            $scope.$broadcast('action', { actionId: actionId, ids: $scope.checkedItems });
        }

        // $scope.$on('selectionChanged',
        //     (event, args) => {
        //    //     $timeout(() => {
        //             $scope.checkedItems = args.ids;
        //       //  });
        //     });

        $scope.selectAll = () => {
            $scope.$broadcast('selectAll')
        }

        $scope.unSelectAll = () => {
            $scope.$broadcast('unSelectAll')
        }

        $scope.new = () => {
            $state.go('app.system.personnew');
        }
    })
    .controller('PersonViewController', ($scope, $translate, $stateParams, Restangular, $state, NgMap) => {
        var id = $stateParams.personId;
        $scope.slickConfig1Loaded = true;
        $scope.personImages = [];
        $scope.singleImage =[];
        $scope.googleMapsUrl =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY";
   
      $scope.places = [];
      $scope.googleMapsUrl =
        "https://maps.google.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY&libraries=drawing";
  
      $scope.map = { center: [-34.61512668346219, -58.414306640625], zoom: 4 };
      $scope.showMap = false;
      $scope.isEnableEditTemplate = false;

      $scope.editProfile = function(){
        $scope.isEnableEditTemplate =true;
        $scope.$broadcast('changeTemplateViewMode');
      }

      $scope.saveProfile = function() {
          //TODO SAVE JSON TEMPLATE
        $scope.isEnableEditTemplate =false;
        $scope.$broadcast('changeTemplateViewMode');
      }

      
      $scope.reRednerMap = function() {
        $scope.showMap = true;
        google.maps.event.trigger($scope.map, "resize");
      };
      $scope.onMapLoaded = function() {
        NgMap.getMap({ id: "placeSelectMap" }).then(function(map) {
          $scope.map = map;
          google.maps.event.trigger(map, "resize");
          map.setZoom(4);
        });
        $scope.showMap = true;
      };

      $scope.$on("$routeChangeSuccess", function() {
        NgMap.getMap({ id: "placeSelectMap" }).then(function(map) {
          google.maps.event.trigger(map, "resize");
          map.setZoom(4);
        });
        $scope.showMap = true;
      });
      
      NgMap.getMap({ id: "placeSelectMap" }).then(function(map) {
        $scope.showMap = true;
        google.maps.event.trigger(map, "resize");
        map.setZoom(4);
      });
      $scope.onMapOverlayCompleted = function(e) {
        var type = e.type;
        var overlay = e.overlay;
        var data = {
          type: type,
          geo: null
        };

        switch (type) {
          case "polygon":
            data.geo = e.overlay.getPath().getArray();
            break;
          case "rectangle":
            console.info("@todo: get information from 'overlay' to data.geo");
            break;
          case "circle":
            console.info("@todo: get information from 'overlay' to data.geo");
            break;
        }
      };
      $scope.currentProjectPosition = [-34.61512668346219, -58.414306640625];
        $scope.slickConfig = {
            dots: true,
            slidesToShow: 2,
            slidesToScroll: 2,
            infinite: true,
          };
        $scope.methods = {};
        $scope.openGallery = function(){
            $scope.methods.open();
        };
        $scope.nextImg = function(){
            $scope.methods.next();
        };
        
        $scope.prevImg = function(){
            $scope.methods.prev();
        };
        $scope.conf = {
            imgAnim : 'fadeup'
        };
        $scope.thumbnails = true;
        $scope.opened = function(){
            console.info('Gallery opened!');
        }
        $scope.closed = function(){
            console.warn('Gallery closed!');
        }
        function getImages(){
            $scope.personImages.forEach(item => {
                $scope.singleImage.push({
                    id:item.id,
                    desc:item.name,
                    url : item.guid,
                    thumbUrl : item.guid,
                    bubbleUrl : item.guid
                });
        });
    }
        function load() {
            if (id) {
                Restangular.all('system').one('persons', id).get().then(result => {
                    $scope.person = result;
                    $scope.person.entityTypeId = 9; //Hardcode
                    $scope.person.entityModelName = "person";
                    $scope.person.folderGuid =  '29f559a8111f46b4a965868948384dbc'; //harcode
                });

                $scope.personImages =   [{id:1,name:'front',guid:'Content/img/Product_1470647972_3.jpg',createDate:new Date(),type:1 },
                {id:2,name:'deccript',guid:'Content/img/cohenlogo.jpg',createDate:new Date(),type:1 },
                {id:3,name:'deccript',guid:'Content/img/logofinapro.png',createDate:new Date(),type:1 },
                {id:4,name:'deccript',guid:'Content/img/logonavarro.png',createDate:new Date(),type:1 },
                {id:5,name:'deccript',guid:'Content/img/cuboproyecto.png',createDate:new Date(),type:1 },
                {id:6,name:'deccript',guid:'Content/img/laptop.png',createDate:new Date(),type:1 },
                {id:7,name:'front',guid:'Content/img/Product_1470647972_3.jpg',createDate:new Date(),type:1 },
                {id:8,name:'deccript',guid:'Content/img/cohenlogo.jpg',createDate:new Date(),type:1 },
                {id:9,name:'deccript',guid:'Content/img/logofinapro.png',createDate:new Date(),type:1 },
                {id:10,name:'deccript',guid:'Content/img/logonavarro.png',createDate:new Date(),type:1 },
                {id:11,name:'deccript',guid:'Content/img/cuboproyecto.png',createDate:new Date(),type:1 }];

                getImages();
            }
        }

        load();

        $scope.edit = () => {
            $state.go('app.system.personedit', { personId: id });
        }

        
    })
    .controller('PersonEditController', ($scope, $translate, $stateParams, Restangular, $state, PersonService , dialogs,toastr) => {
        var id = $stateParams.personId;
        $scope.personService = PersonService;

        $scope.emailAddressChanged = (email) => {
            if (email.address != null && _.last<any>($scope.person.emails).address != null) {
                $scope.person.emails.push({ address: null, typeId: PersonService.emailTypes[1].id });
            }
        };

        $scope.removeEmail = (email) => {
            var index = $scope.person.emails.indexOf(email);
            $scope.person.emails.splice(index, 1);
        }

        $scope.phoneNumberChanged = (phone) => {
            if (phone.number != null && _.last<any>($scope.person.phones).number != null) {
                $scope.person.phones.push({ number: null, typeId: PersonService.phoneTypes[1].id });
            }
        };

        $scope.removePhone = (phone) => {
            var index = $scope.person.phones.indexOf(phone);
            $scope.person.phones.splice(index, 1);
        }

        $scope.addressChanged = (address) => {
            if (address.street != null && _.last<any>($scope.person.addresses).street != null) {
                $scope.person.addresses.push({ address: { name: null, street: null, streetNumber: null, floor: null, appartment: null }, typeId: PersonService.addressTypes[1].id });
            }
        };

        $scope.removeAddress = (address) => {
            var index = $scope.person.addresses.indexOf(address);
            $scope.person.addresses.splice(index, 1);
        }

        $scope.view = () =>{
            $state.go("app.system.person", { personId: id });
        }
        $scope.save = () => {
            if ($scope.person.emails.length > 0 && _.last<any>($scope.person.emails).address == null) {
                $scope.person.emails.splice(-1, 1);
            }

            if ($scope.person.phones.length > 0 && _.last<any>($scope.person.phones).number == null) {
                $scope.person.phones.splice(-1, 1);
            }

            if ($scope.person.addresses.length > 0 && _.last<any>($scope.person.addresses).address.street == null) {
                $scope.person.addresses.splice(-1, 1);
            }

            if (id) {
                $scope.person.put().then(() => {
                    $state.go('app.system.persons');
                });
            } else {
                Restangular.service('system/persons').post($scope.person).then((result) => {
                    $state.go('app.system.persons');
                });
            }
        }
        $scope.editImage = function(imageUrl){
            if($scope.person.folderGuid){
    
            var editorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-image-editor.html",
              "SystemLayoutBuilderImageEditorController",
              {imageValue : imageUrl, folderGuid:$scope.person.folderGuid},
              { size: "lg", animation: true, windowClass: "zindex" }
            );
    
            editorModal.result
              .then(result => {
                var imageValue = result.imageValue;
               
                $scope.person.profilePictureUrl = imageValue;
    
              })
              .finally(function() {
                editorModal.$destroy();
              });
            }
          }

        function load() {
            console.log('Edit de Persona' + id);
            if (id) {
                Restangular.all('system').one('persons', id).get().then(result => {
                    $scope.person = result;
                    if ($scope.person.isValid === null){
                        $scope.person.isValid = true;
                    }
                    $scope.person.folderGuid =  '29f559a8111f46b4a965868948384dbc'; //harcode
                    $scope.person.emails.push({ address: null, typeId: PersonService.emailTypes[1].id });
                    $scope.person.phones.push({ number: null, typeId: PersonService.phoneTypes[1].id });
                    $scope.person.addresses.push(
                        {
                            address: { name: null, street: null, streetNumber: null, floor: null, appartment: null, zipCode: null },
                            typeId: PersonService.addressTypes[1].id
                        });

                        $scope.person.entityTypeId = 9; //Hardcode
                        $scope.person.entityModelName = "person";

                        console.log($scope.person.addresses);
                });
            } else {
                $scope.person = {
                    isOrganization: false,
                    isValid: true,
                    code: null,
                    emails: [{ address: null, typeId: PersonService.emailTypes[1].id }],
                    phones: [{ number: null, typeId: PersonService.phoneTypes[1].id }],
                    addresses: [{ address: { name: null, street: null, streetNumber: null, floor: null, appartment: null }, typeId: PersonService.addressTypes[1].id }]
                };
            }
        }

        load();
    })
    .controller('SystemPersonEditModalController', ($log, $scope, $uibModalInstance, Restangular, PersonService) => {
        $scope.params = { step: 1 };
        $scope.personService = PersonService;

        $scope.person = {
            isOrganization: false,
            code: null,
            emails: [{ address: null, typeId: PersonService.emailTypes[1].id }],
            phones: [{ number: null, typeId: PersonService.phoneTypes[1].id }],
            addresses: [{ address: { name: null, street: null, streetNumber: null, floor: null, appartment: null }, typeId: PersonService.addressTypes[1].id }]
        };

        $scope.emailAddressChanged = (email) => {
            if (email.address != null && _.last<any>($scope.person.emails).address != null) {
                $scope.person.emails.push({ address: null, typeId: PersonService.emailTypes[1].id });
            }
        };

        $scope.removeEmail = (email) => {
            var index = $scope.person.emails.indexOf(email);
            $scope.person.emails.splice(index, 1);
        }

        $scope.phoneNumberChanged = (phone) => {
            if (phone.number != null && _.last<any>($scope.person.phones).number != null) {
                $scope.person.phones.push({ number: null, typeId: PersonService.phoneTypes[1].id });
            }
        };

        $scope.removePhone = (phone) => {
            var index = $scope.person.phones.indexOf(phone);
            $scope.person.phones.splice(index, 1);
        }

        $scope.save = () => {
            if ($scope.person.emails.length > 0 && _.last<any>($scope.person.emails).address == null) {
                $scope.person.emails.splice(-1, 1);
            }

            if ($scope.person.phones.length > 0 && _.last<any>($scope.person.phones).number == null) {
                $scope.person.phones.splice(-1, 1);
            }

            if ($scope.person.addresses.length > 0 && _.last<any>($scope.person.addresses).address.street == null) {
                $scope.person.addresses.splice(-1, 1);
            }

            Restangular.service('system/persons').post($scope.person).then((result) => {
                $uibModalInstance.close(result);
            });
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    })
   .directive('systemPersonsGrid', ($log, $compile, $state, $document, dialogs, Restangular, $http, $timeout, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@',width:'@', isModalSelector: '@', selectedItems: '=', filter: '=' },
            link(scope: any, element) {
                const gridElementName = 'systemPersonsGrid';
                const pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                const pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 600;
                scope.width = scope.width || 850;


                function nameFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _strcontent ;
                   
                   if(!angular.isDefined(scope.isModalSelector)){
                        _strcontent = '<div class="boldfontcell" style="margin-left: 20px;" >';
                       _strcontent += '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/someone_small.jpg);"></div>';
                        _strcontent += '<a ui-sref="app.system.person({ personId: ' + rowObject.id + '})"><span>' + rowObject.name + '</span></a></div>';
                    }
                    else{
                    
                         _strcontent = '<div class="boldfontcell" style="margin-left: 20px;" ><a ><span  data-ng-click="$event.preventDefault(); selectPerson(' + rowObject.id +',  \'' +rowObject.name + '\' )" class="fa fa-plus" title="seleccionar" style="color:gray;height: 30px"></span> </a> ';
                       
                        _strcontent += '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/someone_small.jpg);"></div>';
                          _strcontent += ' <a ><span id="name">' + rowObject.name + '</span></a></div>';
                    }

                    return _strcontent;
                }
                function imageFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _strcontent ;
                     _strcontent = '<div class="boldfontcell" style="margin-left: 20px;" >';
                     _strcontent += '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/someone_small.jpg);"></div>';
                     _strcontent += ' <spam style="visibility:hidden">Content/img/someone_small.jpg</spam></div>'
                      return _strcontent;
                }
                scope.selectPerson = (id, name) => {
                    Restangular
                    .one('/system/persons', id)
                    .get()
                    .then((result) => {
                        scope.selectedPerson= {person :result};
                        scope.$emit('selectionPersonModalChanged',  scope.selectedPerson);
                    });   
                       
                }


                function numberFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _number = rowObject.number || '';
                    return '<div class="largefontcell"><div class="contact-cell" >' + _number + '</div></div>';
                }

                function personCodeFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _code = rowObject.code || '';
                    return '<div class="largefontcell">' + _code + '</div>';
                }

                scope.eliminarPersona = (rowId) => {
                    if (!confirm("Desea eliminar la persona seleccionada?")) {
                        return;
                    }

                    Restangular
                        .one('/system/persons', rowId)
                        .remove({
                            Id: rowId
                        })
                        .then((result) => {
                            gridElement.trigger('reloadGrid');
                        });   
                }
                
                function menuFormatter(cellvalue: any, options: any, rowObject: any) {
                    if(angular.isDefined(scope.isModalSelector))return "";
                    return '<div class="btn-group" uib-dropdown style="position: absolute">' +
                        '<a href uib-dropdown-toggle id="menu_' + rowObject.id + '"><i class="fa fa-ellipsis-v" ></i></a>' +
                        '<ul class="dropdown-menu pull-right" uib-dropdown-menu role="menu" aria-labelledby="menu_' + rowObject.id + '" style="margin-right:10px">' +
                        '<li role="menuitem" ><a href="#" ui-sref="app.system.person({ personId: ' + rowObject.id + '})">Ver </a></li>' +
                        '<li role="menuitem" ><a href="#" ui-sref="app.system.person/{ personId: ' + rowObject.id + '}/edit">Editar </a></li>' +
                       
                        '<li role="menuitem" ><a href ng-click="$event.preventDefault(); eliminarPersona(' + rowObject.id + ')">Remover </a></li> ' +
                        '</ul></div> ';
                };

                const colNames = [ '', 'Nombre',  'CUIT', ''];
                const colModel: Array<any> = [
                    {
                        name: 'id',
                        index: 'id',
                        hidden: true,
                        key: true
                    },
                    // {
                    //     name: 'imageUrl',
                    //     value:'Content/img/someone_small.jpg',
                    //     formatter:  imageFormatter,
                    //     width: 40
                    // },
                     {
                        name: 'name',
                        index: 'nameContains',
                        sortable: true,
                        search: true,
                        formatter: nameFormatter
                    },
                   {
                        name: 'code',
                        index: 'codeContains',
                        sortable: true,
                        search: true,
                        formatter: personCodeFormatter
                    },
                    {
                        name: 'menu',
                        formatter:  menuFormatter,
                        fixed: true,
                        width: 35
                    }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/system/persons.json',
                    datatype: 'json',
                    height: scope.height,
                    width: scope.width,
                    rowHeight: 100,
                    autowidth: !angular.isDefined(scope.isModalSelector),
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    hoverrows: false,
                    pager: pagerElementName,
                    viewrecords: true,
                    rowNum: 100,
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    jsonReader: {
                        page: obj => ((obj.offset / 100) + 1),
                        total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },
                    loadComplete: () => {
                        //No usar esta línea porque trae problemas con angular. Se resetea lista de tildados desde scope padre.
                        //scope.$emit('selectionChanged', { ids: gridElement.getGridParam('selarrrow') });
                        $compile(angular.element('#' + gridElementName))(scope);
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow: () => {
                        return !angular.isDefined(scope.isModalSelector);
                    },
   
                    multiselect: false,
                    multiboxonly: false,
                    onCellSelect: (rowId, iCol) => {
                            // if(angular.isDefined(scope.isModalSelector)){                  
                            //     var rowData =gridElement.jqGrid('getRowData', rowId);
                                
                            //        scope.$emit('selectionPersonModalChanged', { data: rowData});

                            // }
                    },
                    onSelectRow: (rowId,  e) => {
                      if (angular.isDefined(e)) {
                        
                            scope.$emit('selectionChanged', { ids: gridElement.getGridParam('selarrrow') });
                        }

                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                //gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');
                
                $('.ui-jqgrid-hdiv').hide();

                scope.$on('refresh', () => {
                    gridElement.setGridParam({ url: API_HOST + '/api/system/persons' + '.json?nameContains=' + scope.filter });
                    gridElement.trigger('reloadGrid');
                });

				
                //@params: { actionId: ..., ids: [] }
                scope.$on('action', (event, params) => {

                    var ids = _.map(params.ids, (id) => {
                        return (_.isString(id)) ? _.toInteger(id) : id;
                    });

                    switch (params.actionId) {
                        // case 1:
                        //     var modalInstance = dialogs.create('/app/crm/contacts/start-campaign-modal.html',
                        //         'StartCampaignDialogCtrl',
                        //         { ids: ids },
                        //         'lg');
                        //     modalInstance.result.then((obj) => { }, () => { });
                        //     break;
                        // case 2:
                        //     var modalInstance = dialogs.create('app/crm/contacts/categorizationmodal.html', 'multipleCategorizationDialogCtrl', { contactIds: ids }, { size: 'md', animation: false });
                        //     modalInstance.result.then((result) => { }, () => {
                        //         //gridElement.trigger('reloadGrid');
                        //     });

                    }
                    
                });
                
                scope.$on('selectAll', () => {
           
                    gridElement.jqGrid('resetSelection');
                    var ids = gridElement.jqGrid('getDataIDs');

                    for (var i = 0, il = ids.length; i < il; i++) {
                        gridElement.jqGrid('setSelection', ids[i], true);
                    }
                    
                    //scope.$emit('selectionChanged', gridElement.getGridParam('selarrrow'));

                    var url = gridElement.getGridParam('url').replace("contactsbygroup", "contactsbygroupids");
                    
                    $http.get(url).then((data) => {
                        var ids = _.map(data.data.results, (obj) => {
                            return obj["id"];
                        });
                        
                        $timeout(() => {
                           
                            scope.$emit('selectionChanged', { ids: ids });
                        });
                    });
                    
                });

                scope.$on('unSelectAll', () => {
              
                    gridElement.jqGrid('resetSelection');
                    scope.$emit('selectionChanged', { ids: gridElement.getGridParam('selarrrow') });
                });
            }
        };
    })

    .directive('systemPersonLookup', () => {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: { ngModel: '=' },
            link: (scope, element, attr: any, ctrl:any) => {
                if (!ctrl) return;

                var required = attr.required ? attr.required : false;
                var model = scope.$eval(attr.ngModel);
                if (model) {
                    element.val(model);
                }

                element.select2({
                    theme: 'bootstrap',
                    width: 'element',
                    placeholder: 'Seleccione una persona',
                    allowClear: !required,
                    ajax: {
                        url: '/api/system/persons/lookup.json',
                        dataType: 'json',
                        quietMillis: 100,
                        data: (params, page) => {
                            return {
                                q: params.term,
                                pageSize: 100,
                                page: page
                            };
                        },
                        processResults: (data, page) => {
                            var more = (page * 10) < data.total;
                            return { results: data.data, more: more };
                        }
                    }
                });

                attr.$observe('disabled', value => {
                    element.select2(value && 'disable' || 'enable');
                });

                scope.$watch('ngModel', value => {
                    if (value) {
                        const url = '/api/system/persons/lookup';
                        $.getJSON(url, { id: ctrl.$modelValue, format: 'json' }, result => {
                            if (result.data.length == 1) {
                                const option = new Option(result.data[0].text, result.data[0].id, true, true);
                                element.append(option);
                                element.trigger('change');
                            }
                        });
                    }
                });
            }
        };
    })
    .directive('systemPersonPersonalData', ['$log', 'PersonService', ($log, PersonService) => {
        return {
            restrict: 'A',
            replace: true,
            require: 'ngModel',
            scope: { person: '=ngModel' },
            templateUrl: 'app/system/persons/personaldataview.html',
            link(scope: any, element) {
                scope.personService = PersonService;
            }
        };
    }])
    .directive('systemPersonFormsResponsesGrid', (PollService, $state, $window, $http, $compile) => {
        return {
            restrict: 'A',
            scope: { personId: '='},
            link: (scope: any, element) => {

                var gridElementName = 'formResponsesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                
                scope.changeView = (view) => {
                    scope.view = view;
                    loadData();
                }

                function buildGridModel() {

                    function statusFormatter(cellvalue: any, options: any, rowObject: any) {
                        return PollService.getStatusTypeName(rowObject.statusId);
                    }

                    function EditButtonFormatter(cellvalue: any, options: any, rowObject: any) {
                        return '<i class="fa fa-pencil fa-fw hand"></i>';
                    }

                    var gridModel: any = {};
                    gridModel.colNames = ['Id', 'Encuesta', 'Usuario', 'Fecha Inicio', 'Fecha Fin', 'Estado', '', ''];
                    gridModel.colModel = [
                        { name: 'id', index: 'id', width: 30, align: 'right' },
                        { name: 'formName', index: 'formName', width: 100 },
                        { name: 'userName', index: 'userName', width: 100 },
                        { name: 'startDate', index: 'startDate', formatter: 'date', align: 'right', width: 50 },
                        { name: 'endDate', index: 'endDate', formatter: 'date', align: 'right', width: 50 },
                        { name: 'statusId', index: 'statusId', width: 50, formatter: statusFormatter },
                        { name: 'editCommand', index: 'editCommand', hidden: true, width: 25, formatter: EditButtonFormatter, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'deleteCommand', index: 'deleteCommand', hidden: true, width: 25, fixed: true, align: 'center', sortable: false, search: false }
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    //$.jgrid.gridUnload('#${gridElementName}');

                    var gridModel = buildGridModel();
                    if (scope.personId == null || scope.personId == undefined) {
                        scope.personId = 0;
                    }
                    var url = '/api/system/persons/' + scope.personId + '/formresponses.json?q=';

                    gridElement = $('#' + gridElementName);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        height: 400,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        datatype: 'json',
                        url: url,
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        rowNum: 100,
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                      
                            if (scope.personId) {
                        
                                var url = '/api/system/persons/' + scope.personId + '/formresponses.json?q=';
                                gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                                //gridElement.trigger('reloadGrid');
                            }
                        },
                        gridComplete: () => {
                            /*var ids = gridElement.jqGrid('getDataIDs');
                            for (var i = 0; i < ids.length; i++) {
                                var deleteCommand = '<span class="command-cell glyphicon glyphicon-remove"></span>';
                                gridElement.jqGrid('setRowData', ids[i], { deleteCommand: deleteCommand });
                            }*/
                        },
                        onCellSelect: (rowId, iCol) => {
                            return false;
                        },
                        loadComplete: () => {
                            $compile(angular.element('#' + gridElementName))(scope);
                        }
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                    
                    gridElement.jqGrid('filterToolbar', { autosearch: true });
                    $('#gview_formResponsesGrid .ui-search-toolbar').hide();
                }

                loadGrid();

                function loadData() {
                
                    var url = '/api/system/persons/' + scope.personId + '/formresponses.json?q=';
                    gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('beforeRequest');
                    gridElement.trigger('reloadGrid');
                
                }

                scope.$on('loadData', (event, personId) => {
                    
                  
                    if (personId) {
                        scope.personId = personId;
                       
                        loadGrid();
                        loadData();
                    }
                });

            }
        };
    })
    .directive('systemPersonsValidateGrid', ($state, Restangular, toastr, $compile) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                const gridElementName = 'personsGrid';
                const pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                const pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 400;

                scope.validate = (id) => {
                    Restangular.service('system/persons/' + id + '/validate').post({}).then(() => {
                        toastr.success('Personas', 'La operación se realizó con éxito.');
                        gridElement.trigger('reloadGrid');
                    }, () => {
                        toastr.error('Personas', 'Se produjo un error en la operación.');
                    });
                };
                
                function singleQuote(value) {
                    return `'${value}'`;
                }

                function actionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = '';
                    template += '<a href="#" data-ng-click="validate(' + singleQuote(rowObject.id) + ')" class="btn btn-primary btn-xs m-l-xs"><i class="fa fa-pencil"></i> Validar </a>';
                    //template += '<a href="#" data-ng-click="" class="btn btn-primary btn-xs m-l-xs"><i class="fa fa-pencil"></i> Iniciar Workflow </a>';
                    return template;
                }

                const colNames = ['', 'Nombre', 'CUIT', 'Teléfono', ''];
                const colModel: Array<any> = [
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
                    {
                        name: 'name',
                        index: 'nameContains',
                        sortable: true,
                        search: true
                    },
                    {
                        name: 'code',
                        index: 'codeContains',
                        sortable: true,
                        search: true
                    },
                    {
                        name: 'personPhoneNumber',
                        index: 'personPhoneNumber',
                        sortable: true,
                        search: true
                    },
                    { name: 'actions', index: 'actions', width: 250, align: 'left', fixed: true, search: false, formatter: actionsFormatter }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/system/personsforvalidation.json?isValid=false',
                    datatype: 'json',
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
                            //var estado = 'app.system.person';
                            //$state.go(estado, { personId: rowId });
                            var estado = 'app.crm.person.info';
                            $state.go(estado, { personId: rowId });
                        }
                        return true;
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

                //gridElement.addClass('ui-jqgrid-noborders');
                //$('.ui-search-toolbar').hide();
            }
        };
    });