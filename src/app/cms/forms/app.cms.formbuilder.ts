angular.module('app.cms.formbuilder', ['app.core', 'gridstack-angular'])
    .directive('formBuilder', ($log, $parse, $http, Restangular, formService, dialogs) => {
        return {
            restrict: 'A',
            require: ['?^form'],
            scope: {},
            controller: function ($scope) {
                {
                    var vm = this;
                    vm.form = {};
                    vm.mode = 1;
                    vm.options = {
                        disableDrag: false,
                        disableResize: false
                    };

                    vm.showProperties = (field) => {
                        //var item = angular.copy(field);
                        var dlg = dialogs.create('app/cms/forms/fieldproperties.html', 'FormFieldPropertiesController', { item: field }, { size: 'lg' });
                        dlg.result.then((result) => {
                            field = result;
                            /*
                            var fieldToChange: any = _.find(vm.item.fields, ['id', field.id]);
                            if (angular.isDefined(fieldToChange)) {
                                fieldToChange = result;
                            }
                            */
                        },
                            () => { });
                    };

                    // add new field drop-down:
                    vm.addField = {};
                    vm.addField.types = formService.fields;
                    vm.addField.new = vm.addField.types[0].name;

                    vm.addNewField = () => {
                        var id = stringGen(5);

                        var newField = {
                            "id": id,
                            "name": 'Nuevo campo',
                            "type": vm.newFieldType,
                            "required": false,
                            "value": '',
                            "height": 2
                        };

                        vm.item.fields.push(newField);

                        vm.showProperties(newField);
                    };

                    vm.loadPersonStructure = () => {
                        vm.item.person.isValid = false;
                        vm.item.person.isOrganization = false;
                        var hasAddress = false;
                        var address = {};
                        var hasLocation = false;
                        var locationTypeId;
                        var hasEmployer = false;
                        vm.item.employee = {};
                        var employer = {};

                        _.forEach(vm.item.fields, (field: any) => {
                            var personFieldName = field.type.replace("person", "");
                            switch (field.type) {
                                case 'personName':
                                    vm.item.person[personFieldName] = field.value;
                                    vm.item.person.isOrganization = true;
                                    break;
                                case 'personFirstName':
                                    vm.item.person[personFieldName] = field.value;
                                    break;
                                case 'personLastName':
                                    vm.item.person[personFieldName] = field.value;
                                    break;
                                case 'personCode':
                                    vm.item.person[personFieldName] = field.value;
                                    break;
                                case 'personEmail':
                                    vm.item.person.emails = [{
                                        typeId: 2,
                                        Address: field.value
                                    }];
                                    break;
                                case 'personPhone':
                                    vm.item.person.phones = [{
                                        typeId: 2,
                                        Number: field.value
                                    }];
                                    break;
                                case 'personStreet':
                                    hasAddress = true;
                                    address["street"] = field.value;
                                    break;
                                case 'personStreetNumber':
                                    hasAddress = true;
                                    address["streetNumber"] = field.value;
                                    break;
                                case 'personZipCode':
                                    hasAddress = true;
                                    address["zipCode"] = field.value;
                                    break;
                                case 'personFloor':
                                    hasAddress = true;
                                    address["floor"] = field.value;
                                    break;
                                case 'personAppartment':
                                    hasAddress = true;
                                    address["appartment"] = field.value;
                                    break;
                                case 'personLocation':
                                    if (field.value) {
                                        hasAddress = true;
                                        hasLocation = true;
                                        locationTypeId = field.value.valueId;
                                    }
                                    break;
                                case 'personEmployerName':
                                    employer["name"] = field.value;
                                    employer["isOrganization"] = true;
                                    hasEmployer = true;
                                    break;
                                case 'personEmployerFirstName':
                                    employer["firstName"] = field.value;
                                    employer["isOrganization"] = false;
                                    hasEmployer = true;
                                    break;
                                case 'personEmployerLastName':
                                    employer["lastName"] = field.value;
                                    employer["isOrganization"] = false;
                                    hasEmployer = true;
                                    break;
                                case 'personEmployerCode':
                                    employer["code"] = field.value;
                                    employer["isOrganization"] = false;
                                    hasEmployer = true;
                                    break;
                                case 'personEmployerLookup':
                                    break;
                                case 'personSalary':
                                    vm.item.employee["salary"] = field.value;
                                    break;
                                case 'personBirthDate':
                                    vm.item.person[personFieldName] = field.value;
                                    break;
                            }
                        });

                        if (hasAddress) {
                            if (hasLocation) {
                                address["placeId"] = locationTypeId;
                            }

                            vm.item.person.addresses = [{
                                typeId: 2,
                                address: address
                            }];
                        }

                        if (hasEmployer) {
                            //$scope.item.employer = {};
                            //$scope.item.employer.isOrganization = false;
                            vm.item.employer = employer;
                        }

                    };

                    vm.onChange = function (event, ui) {
                        $scope.form.$setDirty();
                    };

                    vm.hasQuota = () => {
                        var hasQuota = angular.isDefined(vm.item) && (vm.item.quota === 0 || vm.item.quota - vm.item.responses > 0);
                        return hasQuota;
                    };

                    vm.isOpen = () => {
                        if (angular.isDefined(vm.item) && vm.item.fromDate) {
                            var now = moment();
                            var from = moment(vm.item.fromDate);
                            var to = moment(vm.item.toDate);
                            var momentInstance: any = moment();
                            var range = momentInstance.range(from, to);

                            return range.contains(now);
                        } else {
                            return true;
                        }
                    };

                    vm.waigintList = false;

                    vm.getFieldValue = (fieldId) => {
                        var field: any = _.find(vm.item.fields, ['id', fieldId]);
                        if (angular.isDefined(field.value)) {
                            return field.value;
                        }

                        return null;
                    };

                    return vm;
                }
            },
            controllerAs: 'vm',
            bindToController: { item: '=?item' },
            templateUrl: '/app/cms/forms/builder.html',
            link: (scope: any, elm, attr: any, ctrl: any) => {
                scope.form = ctrl[0];
            }
        };
    })
    .controller('FormFieldPropertiesController', ['$log', '$scope', '$translate', 'Restangular', 'toastr', '$uibModalInstance', 'formService', 'data',
        ($log,
            $scope: any,
            $translate,
            Restangular,
            toastr,
            $uibModalInstance,
            formService,
            data) => {

            $scope.field = data.item;
            $scope.fieldTypes = formService.fields;

            $scope.showRequired = (field) => {
                if (field.type === 'label')
                    return false;
                else
                    return true;
            };

            $scope.showCondition = (field) => {
                if (field.type === 'text')
                    return true;
                else
                    return false;
            };

            $scope.showDefaultValue = (field) => {
                if (field.type === 'label' || field.type === 'hidden')
                    return true;
                else
                    return false;
            };

            $scope.showAddOptions = (field) => {
                if (field.type === 'radio' || field.type === 'dropdown' || field.type === 'checkbox')
                    return true;
                else
                    return false;
            };

            $scope.addOption = (field) => {
                if (!field.options)
                    field.options = new Array();

                var id = stringGen(5);
                var newOption = {
                    "id": id,
                    "text": '',
                    "value": id
                };

                field.options.push(newOption);
            };

            $scope.moveOptionUp = (id, field) => {
                for (var i = 0; i < field.options.length; i++) {
                    if (field.options[i].id === id) {
                        var element = field.options[i];
                        field.options.splice(i, 1);
                        field.options.splice(i - 1, 0, element);
                        break;
                    }
                }
            };

            $scope.moveOptionDown = (id, field) => {
                for (var i = 0; i < field.options.length; i++) {
                    if (field.options[i].id === id) {
                        var element = field.options[i];
                        field.options.splice(i, 1);
                        field.options.splice(i + 1, 0, element);
                        break;
                    }
                }
            };

            $scope.deleteOption = (field, option) => {
                for (var i = 0; i < field.options.length; i++) {
                    if (field.options[i].id === option.id) {
                        field.options.splice(i, 1);
                        break;
                    }
                }
            };

            $scope.ok = () => {
                $uibModalInstance.close($scope.field);
            }

            $scope.cancel = () => {
                $uibModalInstance.dismiss('cancel');
            }
        }]);