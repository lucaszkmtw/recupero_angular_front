angular.module('app.core', ['ngAnimate', 'ngSanitize'])
    .constant('APP_MEDIAQUERY', {
        'desktopXL': 1200,
        'desktop': 992,
        'tablet': 768,
        'mobile': 480
    })
    .filter('percentage', ['$filter', ($filter) => {
        return (input, decimals: number) => {
            return $filter('number')(input * 100, decimals) + '%';
        };
    }])
    .filter('cuit', () => {
        return (cuit: any) => {
            if (!cuit) { return ''; }
            cuit = cuit.slice(0, 2) + '-' + cuit.slice(2, 10) + '-' + cuit.slice(10, 11);
            return cuit;
        };
    })
    .filter('amDateTime', () => {
        return (value: any) => {
            if (!value) { return ''; }
            var date = moment(value);
            return date.format('L LT');
        };
    })
    .filter('reverse', () => {
        return (items) => {
            if (angular.isArray(items)) {
                return items.slice().reverse();
            }

            return items;
        };
    })
    .directive('lookup', ($compile, $parse, $document, $log, dialogs, $http, authManager) => {
        return {
            restrict: 'A',
            require: 'ngModel',
            transclude: true,
            scope: { ngModel: '=', isShown: '@ngShow', width: '@', showAddNew: '@', onSelect: '&?' },
            link: (scope: any, element, attr: any, ctrl: any, transclude) => {
                switch (attr.lookup) {
                    case 'cmsContentLookup':
                        scope.placeholder = 'Seleccione un contenido';
                        scope.url = '/api/cms/contents/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        break;
                    case 'healthHealthCareProviderLookup':
                        scope.placeholder = 'Seleccione un prestador';
                        scope.url = '/api/health/healthcareproviders/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'healthDiseaseLookup':
                        scope.placeholder = 'Seleccione un diagnóstico';
                        scope.url = '/api/health/diseases/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        break;
                    case 'healthPatientLookup':
                        scope.placeholder = 'Seleccione un paciente';
                        scope.url = '/api/health/patients/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/health/patient/editmodal.html';
                        scope.addNewDialogController = 'HealthPatientEditModalController';
                        break;
                    case 'healthCommercialDrugLookup':
                        scope.placeholder = 'Seleccione los medicamentos';
                        scope.url = '/api/health/commercialdrugs/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        break;
                    case 'healthDrugLookup':
                        scope.placeholder = 'Seleccione el principio activo';
                        scope.url = '/api/health/drugs/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'healthDrugPresentationLookup':
                        scope.placeholder = 'Seleccione la presentación del producto';
                        scope.url = '/api/health/drugpresentations/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'healthDoctorLookup':
                        scope.placeholder = 'Seleccione un médico';
                        scope.url = '/api/health/doctors/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/health/doctor/editmodal.html';
                        scope.addNewDialogController = 'HealthDoctorEditModalController';
                        break;
                    case 'healthMedicalPracticeLookup':
                        scope.placeholder = 'Seleccione una práctica médica';
                        scope.url = '/api/health/medicalpractices/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'healthPharmacyLookup':
                        scope.placeholder = 'Seleccione una farmacia';
                        scope.url = '/api/health/pharmacies/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'healthServiceLookup':
                        scope.placeholder = 'Seleccione un prestador';
                        scope.url = '/api/health/healthservices/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        scope.allowClear = true;
                        break;
                    case 'catalogProductLookup':
                        scope.placeholder = 'Seleccione un producto';
                        scope.url = '/api/catalog/products/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/catalog/products/editmodal.html';
                        scope.addNewDialogController = 'CatalogProductEditModalController';
                        
                        break;
                    case 'salesClientLookup':
                        scope.placeholder = 'Seleccione un cliente';
                        scope.url = '/api/sales/clients/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/sales/clients/editmodal.html';
                        scope.addNewDialogController = 'SalesClientEditModalController';
                        break;
                    case 'salesClientPersonLookup':
                        scope.placeholder = 'Seleccione un cliente';
                        scope.url = '/api/sales/clients/lookup.json?returnPersonId=true';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/sales/clients/editmodal.html';
                        scope.addNewDialogController = 'SalesClientEditModalController';
                        break;
                    case 'procurementVendorLookup':
                        scope.placeholder = 'Seleccione un proveedor';
                        scope.url = '/api/procurement/vendors/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/procurement/vendors/editmodal.html';
                        scope.addNewDialogController = 'ProcurementVendorEditModalController';
                        break;
                    case 'procurementVendorPersonLookup':
                        scope.placeholder = 'Seleccione un proveedor';
                        scope.url = '/api/procurement/vendors/lookup.json?returnPersonId=true';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        break;

                    case 'businessDocumentsDocumentLookup':
                        scope.placeholder = 'Seleccione el documento';
                        scope.url = '/api/businessdocuments/documents/lookup.json';;
                        scope.attributes = [{ name: 'typesId', required: false },{name: 'debtorId',required: false}];
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                 case 'productsconfigLookup':
                        scope.placeholder = 'Seleccione el Tipo de Credito';
                        scope.url = '/api/catalog/products/lookup.json';
                        scope.attributes = [{ name: 'categoryId', required: true }];
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'businessPartnerLookup':
                        scope.placeholder = 'Seleccione el socio de negocio';
                        scope.url = '/api/businesspartners/businesspartners/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'systemPermissionLookup':
                        scope.placeholder = 'Seleccione un permiso';
                        scope.url = '/api/system/permissions/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        //scope.addNewDialogTemplate = 'app/system/persons/editmodal.html';
                        //scope.addNewDialogController = 'SystemPersonEditModalController';
                        break;
                    case 'systemRoleLookup':
                        scope.placeholder = 'Seleccione un rol';
                        scope.url = '/api/system/roles/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        //scope.addNewDialogTemplate = 'app/system/persons/editmodal.html';
                        //scope.addNewDialogController = 'SystemPersonEditModalController';
                        break;
                    case 'systemUserLookup':
                        scope.placeholder = 'Seleccione un usuario';
                        scope.url = '/api/system/users/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        //scope.addNewDialogTemplate = 'app/system/persons/editmodal.html';
                        //scope.addNewDialogController = 'SystemPersonEditModalController';
                        break;
                    case 'systemPersonLookup':
                        scope.placeholder = 'Seleccione una persona';
                        scope.url = '/api/system/persons/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/system/persons/editmodal.html';
                        scope.addNewDialogController = 'SystemPersonEditModalController';
                        break;
                    case 'systemPersonSkillsLookup':
                        scope.placeholder = 'Seleccione las especialidades';
                        scope.url = '/api/system/persons/skills/lookup.json';
                        scope.multiple = true;
                        scope.showAddNew = false;
                        break;
                    case 'systemProjectCategoriesLookup':
                        scope.placeholder = 'Seleccione las categorías';
                        scope.url = '/api/projects/categories/lookup.json';
                        scope.multiple = true;
                        scope.showAddNew = false;
                        break;
                    case 'systemProjectTagsLookup':
                        scope.placeholder = 'Ingrese los Tags';
                        scope.multiple = true;
                        scope.showAddNew = false;
                        break;
                    case 'systemProjectCostCentersLookup':
                        scope.placeholder = 'Seleccione un centro de costo';
                        scope.url = '/api/financials/controlling/costcenters/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        scope.attributes = [{ name: 'returnAll', required: false }];
                        break;
                    case 'systemPersonSkillLookup':
                        scope.placeholder = 'Seleccione una especialidad';
                        scope.url = '/api/system/persons/skills/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'systemPlaceLookup':
                        scope.placeholder = 'Seleccione un elemento';
                        scope.url = '/api/system/places/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        scope.attributes = [{ name: 'typeId', required: false }, { name: 'parentId', required: false }];
                        break;
                    case 'systemDistrictLookup':
                        scope.placeholder = 'Seleccione un partido';
                        scope.url = '/api/system/places/lookup.json?typeId=4';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'systemProvinceLookup':
                        scope.placeholder = 'Seleccione una provincia';
                        scope.url = '/api/system/places/lookup.json?typeId=2';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'systemLocationLookup':
                        scope.placeholder = 'Seleccione una localidad';
                        scope.url = '/api/system/places/lookup.json?typeId=3';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        scope.attributes = [{ name: 'parentId', required: false }];
                        break;
                    case 'systemTenantLookup':
                        scope.placeholder = 'Seleccione un propietario';
                        scope.url = '/api/system/tenants/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'systemWorkflowInstanceLookup':
                        scope.placeholder = 'Seleccione un proceso';
                        scope.url = '/api/system/workflows/workflowinstances/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialPaymentMethodTypesLookup':
                        scope.placeholder = 'Seleccione un tipo de metodo de pago';
                        scope.url = '/api/financials/paymentmethodtypes/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialPaymentMethodsLookup':
                        scope.placeholder = 'Seleccione un metodo de pago';
                        scope.url = '/api/financials/paymentmethods/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialsBankLookup':
                        scope.placeholder = 'Seleccione un banco';
                        scope.url = '/api/financials/banks/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialsBankAccountLookup':
                        scope.placeholder = 'Seleccione una cuenta bancaria';
                        scope.url = '/api/financials/bankaccounts/lookup.json';
                        scope.attributes = [{ name: 'personId', required: true }];
                        scope.multiple = false;
                        scope.showAddNew = true;
                        scope.addNewDialogTemplate = 'app/crm/contacts/bank-account-modal.html';
                        scope.addNewDialogController = 'CrmBankAccountModalController';
                        break;
                    case 'financialsCheckBookLookup':
                        scope.placeholder = 'Seleccione una chequera';
                        scope.url = '/api/financials/checkbooks/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialBankBranchesLookup':
                        scope.placeholder = 'Seleccione una sucursal bancaria';
                        scope.url = '/api/financials/bankbranches/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialCurrenciesLookup':
                        scope.placeholder = 'Seleccione una moneda';
                        scope.url = '/api/financials/currencies/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'salesProductCatalogLookup':
                        scope.placeholder = 'Seleccione un producto';
                        scope.url = '/api/sales/productcatalogs/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'catalogProductCatalogLookup':
                        scope.placeholder = 'Seleccione un catálogo de producto';
                        scope.url = '/api/catalog/productcatalogs/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialCheckStatusLookup':
                        scope.placeholder = 'Seleccione un estado';
                        scope.url = '/api/financials/paymentdocumentitems/lookupcheckstatus.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialCashTransactionLookup':
                        scope.placeholder = 'Seleccione un estado';
                        scope.url = '/api/financials/paymentdocumentitems/lookupcashtransactionstatus.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'financialBankTransferLookup':
                        scope.placeholder = 'Seleccione un estado';
                        scope.url = '/api/financials/paymentdocumentitems/lookupbanktransfer.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'crmFormLookup':
                        scope.placeholder = 'Seleccione un formulario';
                        scope.url = '/api/cms/forms/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'crmCampaignLookup':
                        scope.placeholder = 'Seleccione una campaña';
                        scope.url = '/api/crm/campaign/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'invSiteLookup':
                        scope.placeholder = 'Seleccione un depósito';
                        scope.url = '/api/inv/sites/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        scope.attributes = [{ name: 'personId', required: true }];
                        break;
                    case 'investmentTypeAccountLookup':
                        scope.placeholder = 'Seleccione el tipo de cuenta inversora';
                        scope.url = '/api/investments/accounttypes/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'investmentInvestorLookup':
                        scope.placeholder = 'Seleccione el inversor';
                        scope.url = '/api/investments/investors/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;    
                    case 'investmentTraderLookup':
                        scope.placeholder = 'Seleccione el trader';
                        scope.url = '/api/investments/traders/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;     
                    case 'investmentCustodianLookup':
                        scope.placeholder = 'Seleccione el custodio';
                        scope.url = '/api/investments/custodians/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;         
                    case 'investmentManagerLookup':
                        scope.placeholder = 'Seleccione el gestor';
                        scope.url = '/api/investments/managers/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;
                    case 'productLookup':
                        scope.placeholder = 'Seleccione el concepto';
                        scope.url = '/api/catalog/products/lookup.json';
                        scope.attributes = [{ name: 'categoryId', required: true }];  
                        scope.multiple = false;
                        scope.showAddNew = false;                       
                        break;       
                    case 'categoryLookup':
                        scope.placeholder = 'Seleccione el tipo de crédito';
                        scope.url = '/api/catalog/categories/lookup.json';
                        scope.attributes = [{ name: 'organismId', required: true }];  
                        scope.multiple = false;
                        scope.showAddNew = false;                       
                        break;                        
                    case 'licenseTypeLookup':
                        scope.placeholder = 'Seleccione el tipo de matrícula';
                        scope.url = '/api/financials/debtmanagement/licensetypes/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;                       
                        break;                               
                    case 'organismTypeLookup':
                        scope.placeholder = 'Seleccione el tipo de organismo';
                        scope.url = '/api/financials/debtmanagement/organismtypes/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;                    
                        break;                          
                    case 'organismLookup':
                        scope.placeholder = 'Seleccione el organismo';
                        scope.url = '/api/financials/debtmanagement/organisms/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = true; 
                        //scope.addNewDialogTemplate = 'app/financials/DebtManagement/OrganismC/edit.html';                      
                        //scope.addNewDialogController = 'FinancialsDebtManagementOrganismController';    
                        scope.attributes = [{ name: 'code', required: true }];                      
                        break; 
                    case 'proxieLookup':
                        scope.placeholder = 'Seleccione el Apoderado';
                        scope.url = '/api/financials/debtmanagement/proxies/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;     
                        //scope.attributes = [{ name: 'code', required: true }];                      
                        break;     
                    case 'normativeLookup':
                        scope.placeholder = 'Seleccione la normativa';
                        scope.url = '/api/financials/debtmanagement/normatives/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;                        
                        break;
                    case 'lawLookup':
                        scope.placeholder = 'Seleccione la ley';
                        scope.url = '/api/financials/debtmanagement/laws/lookup.json';
                        scope.attributes = [{ name: 'organismId', required: false },{ name: 'categoryId', required: false},{ name: 'productId', required: false}];  
                        scope.multiple = false;
                        scope.showAddNew = false;                        
                        break;
                    case 'debtorLookup':
                        scope.placeholder = 'Seleccione el Deudor';
                        scope.url = '/api/financials/debtmanagement/debtors/lookup.json';;
                        scope.multiple = true;
                        scope.showAddNew = false;
                        break; 
                    case 'debtorSingleLookup':
                        scope.placeholder = 'Seleccione el Deudor';
                        scope.url = '/api/financials/debtmanagement/debtors/lookup.json';;
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break; 
                   case 'acredLookup':
                        scope.placeholder = 'Seleccione el Acreedor';
                        scope.url = '/api/financials/debtmanagement/creditors/lookup.json';;
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break; 
                        //api/financials/debtmanagement/creditors/lookup
                    case 'debtorTypeLookup':
                        scope.placeholder = 'Seleccione el Tipo de Deudor';
                        scope.url = '/api/financials/debtmanagement/debtortypes/lookup.json';;
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break; 
                    case 'businessPartnerTypeLookup':
                        scope.placeholder = 'Seleccione el Tipo Código';
                        scope.url = '/api/businesspartnertypes/lookup.json';;
                        scope.multiple = false;
                        scope.showAddNew = false;
                        break;     
                                               
                    default:
                        $log.error('Lookup ' + scope.id + ' is not defined');
                }
                scope.id = angular.isDefined(attr.id) ? attr.id : attr.lookup;
                scope.width = angular.isDefined(attr.width) ? attr.width : '100%';
                scope.filter = angular.isDefined(attr.filter) ? attr.filter : '';
                if (angular.isDefined(attr.showAddNew)) {
                    scope.showAddNew = attr.showAddNew.match(/true/i);
                }

                var inputGroupElement = angular.element('<div class="input-group select2-bootstrap-append"></div>');

                var page;
                var selectElement = angular.element(`<select name="${scope.id}" style="width: ${scope.width};" ng-required="true"></select>`);
                selectElement.attr('id', scope.id);

                function checkAttributes() {
                    if (scope.attributes && scope.attributes.length > 0) {
                        _.forEach(scope.attributes, (attribute: any) => {
                            if (attribute.required && attr[attribute.name] == null) {
                                $log.error(`Lookup: ${scope.id} - Attribute: ${attribute.name} is missing.`);
                                return false;
                            }
                        });
                    }

                    return true;
                }

                function buildData() {
                    var data = {};
                    if (scope.attributes && scope.attributes.length > 0) {
                        _.forEach(scope.attributes, (attribute: any) => {
                            data[attribute.name] = attr[attribute.name];
                        });
                    }

                    return data;
                }


                var select2Options: any = {
                    theme: 'bootstrap',
                    placeholder: scope.placeholder,
                    allowClear: scope.allowClear || false,
                    multiple: scope.multiple,

                    ajax: {
                        url: API_HOST + scope.url,
                        headers: { "Authorization": "Bearer " + authManager.getToken() },
                        dataType: 'json',
                        quietMillis: 100,
                        delay: 250,
                        data: (params) => {
                            page = params.page || 1;
                            var data = {
                                q: params.term,
                                pageSize: 100,
                                page: page,
                                filter: scope.filter
                            };
                            angular.extend(data, buildData());
                            return data;
                        },
                        processResults: (data) => {
                            var more = (page * 100) < data.total;
                            if (scope.id == 'systemProvinceLookup' || scope.id == 'systemPlaceLookup') {
                                for (var i = 0; i < data.data.length; i++) {
                                    var vecItem = angular.fromJson(data.data[i].text);
                                    if (angular.isDefined(attr.showLastMemberOnly) && attr.showLastMemberOnly) {
                                        var place: any = _.last(vecItem);
                                        data.data[i].text = place.Name;
                                    }
                                    else {
                                        var strItem = "";
                                        for (var j = 0; j < vecItem.length; j++) {
                                            strItem += vecItem[j].Name;
                                            if (j != vecItem.length - 1) {
                                                strItem += " - ";
                                            }
                                        }
                                        data.data[i].text = strItem;
                                    }
                                }
                            }
                            return {
                                results: data.data,
                                pagination: { more: more }
                            };
                        }
                    }
                };
                if (scope.id === 'systemProjectTagsLookup') {
                    select2Options.tokenSeparators = [',', ' ']
                    select2Options.tags = true;
                    select2Options.data = null;

                }
                inputGroupElement.append(selectElement);

                if (scope.showAddNew) {
                    var newButtonElement = angular.element('<span class="input-group-btn"><button class="btn btn-default" type="button" data-ng-click="addNew()"><i class="fa fa-file-o"></i></button></span>');
                    inputGroupElement.append(newButtonElement);
                    $compile(newButtonElement)(scope);
                }
                try {
                    inputGroupElement.append(transclude());
                } catch (e) {
                }

                element.replaceWith(inputGroupElement);

                attr.$observe('disabled', value => {
                    selectElement.prop('disabled', value);
                });

                checkAttributes();

                $compile(selectElement)(scope);
                var select2Element = selectElement.select2(select2Options);

                element.bind('$destroy', () => {
                    select2Element.select2('destroy');
                });

                attr.$observe('readonly', value => {
                    selectElement.prop('readonly', !!value);
                });

                scope.$watch('isShown', (value) => {
                    if (angular.isUndefined(value)) {
                        value = true;
                    }

                    if (value === true || value === 'true') {
                        inputGroupElement.show();
                    } else {
                        inputGroupElement.hide();
                    }
                });

                select2Element.on('select2:select', (e) => {
                    scope.$apply(() => {
                        var value = null;
                        console.log(e.params);
                        if (scope.id === 'systemProjectTagsLookup') {
                            value = e.params.data.text;
                        }

                        if (angular.isDefined(attr.modelProperty)) {
                            if (attr.modelProperty === 'text') {
                                value = e.params.data.text;
                            }
                            else {
                                value = e.params.data[attr.modelProperty];
                            }
                        }
                        else {

                            if (angular.isDefined(attr.returnAll)) {
                                value = e.params.data;
                            } else {
                                value = e.params.data.id;
                            }
                        }

                        if (angular.isDefined(scope.onSelect)) {
                            scope.onSelect({ value: value, text: e.params.data.text });
                        } else {
                            if (scope.multiple) {

                                ctrl.$modelValue.push(value);
                            } else {
                                if (angular.isDefined(attr.modelProperty) && attr.modelProperty === 'text') {
                                    ctrl.$setViewValue({ value: e.params.data.text, valueId: e.params.data.id });
                                } else {
                                    ctrl.$setViewValue(value);
                                }
                            }
                        }
                    });
                });

                select2Element.on('select2:unselect', (e) => {
                    if (scope.multiple) {
                        var index = ctrl.$modelValue.indexOf(parseInt(e.params.data.id));
                        if (index > -1) {
                            scope.$apply(() => {
                                ctrl.$modelValue.splice(index, 1);
                            });
                        }
                    } else {
                        ctrl.$setViewValue(null);
                    }
                });

                scope.addNew = () => {
                    var modalInstance = dialogs.create(scope.addNewDialogTemplate, scope.addNewDialogController, {}, { size: 'lg', animation: false });
                    modalInstance.result.then((result) => {
                        if (scope.multiple) {
                            ctrl.$modelValue.push(result.id);
                        } else {
                            ctrl.$setViewValue(result.id);
                        }
                    }, () => { });
                }

                scope.$watch('ngModel', value => {
                    if (value) {

                        if (angular.isArray(ctrl.$modelValue)) {
                            if (ctrl.$modelValue.length > 0) {
                                var ids = ctrl.$modelValue.join();
                                selectElement.val(null);
                                $http.get(API_HOST + scope.url, { params: { ids: ids, format: 'json' } } ).then(result => {
                                 console.log(result.data.data);
                                    _.forEach(result.data.data, (item: any) => {
                                        var option = new Option(item.text, item.id, true, true);
                                        selectElement.append(option);
                                    });
                                    selectElement.trigger('change');
                                });
                            }
                        } else {
                            var id = ctrl.$modelValue;
                            if (typeof id === 'object') {
                                id = id.valueId;
                            }

                            $http.get(API_HOST + scope.url,{ params: { id: id, format: 'json' }}).then(result => {
                                _.forEach(result.data.data, (item: any) => {

                                    if (scope.id == 'systemProvinceLookup' || scope.id == 'systemPlaceLookup') {
                                        var vecItem = angular.fromJson(item.text);
                                        var strItem = "";
                                        for (var j = 0; j < vecItem.length; j++) {
                                            strItem += vecItem[j].Name;
                                            if (j != vecItem.length - 1) {
                                                strItem += " - ";
                                            }
                                        }
                                        item.text = strItem;
                                    }

                                    var option = new Option(item.text, item.id, true, true);
                                    selectElement.append(option);
                                });
                                selectElement.trigger('change');
                            });

                        }
                    } else {
                        selectElement.val(null);
                        selectElement.trigger('change');
                    }
                });
            }
        };
    });

var jsRequires: any = {
    scripts: {
        'login-soft': 'content/css/login-soft.css',
        'icheck': ['node_modules/icheck/icheck.min.js', 'Content/plugins/iCheck/custom.css'],
        'jqueryui': { insertBefore: '#loadBefore', files: ['node_modules/jquery-ui-bundle/jquery-ui.min.js', 'node_modules/jquery-ui-bundle/jquery-ui.min.css'] },
        'jqGrid': { insertBefore: '#loadBefore', serie: true, files: ['Content/css/plugins/ui.jqgrid.css', 'Content/plugins/jqgrid/js/i18n/grid.locale-es-ar.js', 'Content/plugins/jqgrid/js/jquery.jqGrid.min.js', 'Content/plugins/jqgrid/plugins/jquery.tablednd.js'] },
        'kendotreeview': { insertBefore: '#loadBefore', serie: true, files: ['Content/plugins/kendoui/css/kendo.common-material.min.css', 'Content/plugins/kendoui/css/kendo.custom.css', 'Content/plugins/kendoui/js/kendo.core.min.js', 'Content/plugins/kendoui/js/kendo.data.min.js', 'Content/plugins/kendoui/js/kendo.userevents.min.js', 'Content/plugins/kendoui/js/kendo.draganddrop.min.js', 'Content/plugins/kendoui/js/kendo.treeview.draganddrop.min.js', 'Content/plugins/kendoui/js/kendo.treeview.min.js', 'Content/plugins/kendoui/js/cultures/kendo.culture.es-AR.min.js'] },
        'kendowindow': { insertBefore: '#loadBefore', serie: true, files: ['Content/plugins/kendoui/css/kendo.common-material.min.css', 'Content/plugins/kendoui/css/kendo.custom.css', 'Content/plugins/kendoui/js/kendo.core.min.js', 'Content/plugins/kendoui/js/kendo.userevents.min.js', 'Content/plugins/kendoui/js/kendo.draganddrop.min.js', 'Content/plugins/kendoui/js/kendo.window.min.js', 'Content/plugins/kendoui/js/cultures/kendo.culture.es-AR.min.js'] },
        'bpmn-viewer': { files: ['node_modules/jquery-mousewheel/jquery.mousewheel.js', 'bower_components/bpmn-js/dist/bpmn-viewer.min.js'], serie: true, insertBefore: '#loadBefore' },
        'tableDnD': { files: ['bower_components/TableDnD/dist/jquery.tablednd.min.js'], insertBefore: '#loadBefore' },
        'imageviewer': { files: ['node_modules/imageviewer/dist/viewer.css', 'node_modules/imageviewer/dist/viewer.js'], insertBefore: '#loadBefore' },

        //*** Filters
        'htmlToPlaintext': 'assets/js/filters/htmlToPlaintext.js'
    },
    //*** angularJS Modules
    modules: [
        {
            name: 'infinite-scroll',
            files: ['node_modules/ng-infinite-scroll/build/ng-infinite-scroll.min.js']
        },
        {
            name: 'angular-google-maps-geocoder',
            files: ['node_modules/angular-google-maps-geocoder/dist/angular-google-maps-geocoder.min.js']
        },
        {
            name: 'ngStorage',
            files: ['node_modules/ngstorage/ngStorage.min.js']
        },
        {
            name: 'pageslide-directive',
            files: ['node_modules/angular-pageslide-directive/dist/angular-pageslide-directive.min.js']
        },
        {
            name: 'gridshore.c3js.chart',
            serie: true,
            files: ['css/plugins/c3/c3.min.css', 'js/plugins/d3/d3.min.js', 'js/plugins/c3/c3.min.js', 'js/plugins/c3/c3-angular.min.js']
        },
        {
            name: 'angular-send-feedback',
            insertBefore: '#loadBefore',
            files: ['node_modules/angular-send-feedback/dist/angular-send-feedback.min.css', 'node_modules/angular-send-feedback/dist/angular-send-feedback.min.js']
        },
        {
            name: 'ui-mask',
            files: ['node_modules/angular-ui-mask/dist/mask.min.js']
        },
        {
            name: 'ng-backstretch',
            files: ['node_modules/ng-backstretch/dist/ng-backstretch.min.js']
        },
        {
            name: 'ngCkeditor',
            serie: true,
            files: ['Content/plugins/ckeditor/ckeditor.js', 'bower_components/ng-ckeditor/ng-ckeditor.js', 'bower_components/ng-ckeditor/ng-ckeditor.css']
        },
        {
            name: 'ui.router.tabs',
            files: ['node_modules/angular-ui-router-tabs/src/ui-router-tabs.js']
        },
        {
            name: 'chart.js',
            serie: true,
            files: ['node_modules/chart.js/dist/Chart.min.js', 'node_modules/angular-chart.js/dist/angular-chart.min.js']
        },
        {
            name: 'angular-flot',
            serie: true,
            files: ['content/plugins/flot-0.8.3/jquery.flot.js', 'content/plugins/flot-0.8.3/jquery.flot.time.js', 'content/plugins/flot-0.8.3/jquery.flot.resize.js', 'content/plugins/flot-0.8.3/jquery.flot.symbol.js', 'content/plugins/flot-0.8.3/jquery.flot.pie.js', 'node_modules/angular-flot/angular-flot.js',]
        },
        {
            name: 'ui.tree',
            serie: true,
            insertBefore: '#loadBefore',
            files: ['node_modules/angular-ui-tree/dist/angular-ui-tree.min.js', 'node_modules/angular-ui-tree/dist/angular-ui-tree.min.css']
        },
        {
            name: 'angularFileUpload',
            files: ['node_modules/angular-file-upload/dist/angular-file-upload.min.js']
        },
        {
            name: 'toastr',
            serie: true,
            insertBefore: '#loadBefore',
            files: ['node_modules/angular-toastr/dist/angular-toastr.min.css', 'node_modules/angular-toastr/dist/angular-toastr.tpls.min.js']
        },
        {
            name: 'ngMap',
            files: ['node_modules/ngmap/build/scripts/ng-map.min.js']
        },
        {
            name: 'angularBootstrapNavTree',
            files: ['vendor/angular-bootstrap-nav-tree/abn_tree_directive.js', 'vendor/angular-bootstrap-nav-tree/abn_tree.css']
        }, {
            name: 'ngTable',
            files: ['vendor/ng-table/ng-table.min.js', 'vendor/ng-table/ng-table.min.css']
        }, {
            name: 'angular-bootstrap-touchspin',
            files: ['vendor/bootstrap-touchspin/angular.bootstrap-touchspin.js', 'vendor/bootstrap-touchspin/jquery.bootstrap-touchspin.min.css']
        }, {
            name: 'ngImgCrop',
            files: ['vendor/ngImgCrop/ng-img-crop.js', 'vendor/ngImgCrop/ng-img-crop.css']
        }, {
            name: 'ngAside',
            files: ['vendor/angular-aside/angular-aside.min.js', 'vendor/angular-aside/angular-aside.min.css']
        }, {
            name: 'truncate',
            files: ['vendor/angular-truncate/truncate.js']
        }, {
            name: 'oitozero.ngSweetAlert',
            files: ['vendor/sweet-alert/ngSweetAlert.min.js']
        }, {
            name: 'monospaced.elastic',
            files: ['vendor/angular-elastic/elastic.js']
        }, {
            name: 'tc.chartjs',
            files: ['vendor/chartjs/tc-angular-chartjs.min.js']
        }, {
            name: 'sparkline',
            files: ['vendor/sparkline/angular-sparkline.js']
        }, {
            name: 'flow',
            files: ['vendor/ng-flow/ng-flow-standalone.min.js']
        }, {
            name: 'uiSwitch',
            files: ['vendor/angular-ui-switch/angular-ui-switch.min.js', 'vendor/angular-ui-switch/angular-ui-switch.min.css']
        }, {
            name: 'mwl.calendar',
            files: ['vendor/angular-bootstrap-calendar/angular-bootstrap-calendar.js', 'vendor/angular-bootstrap-calendar/angular-bootstrap-calendar-tpls.js', 'vendor/angular-bootstrap-calendar/angular-bootstrap-calendar.min.css']
        }, {
            name: 'ng-nestable',
            files: ['vendor/ng-nestable/angular-nestable.js']
        }, {
            name: 'vAccordion',
            files: ['vendor/v-accordion/v-accordion.min.js', 'vendor/v-accordion/v-accordion.min.css']
        }, {
            name: 'xeditable',
            files: ['vendor/angular-xeditable/xeditable.min.js', 'vendor/angular-xeditable/xeditable.css']
        }, {
            name: 'config-xeditable',
            files: ['vendor/angular-xeditable/config-xeditable.js']
        }, {
            name: 'checklist-model',
            files: ['vendor/checklist-model/checklist-model.js']
        },
        {
            name: 'easypiechart',
            serie: true,
            files: ['node_modules/easy-pie-chart/dist/angular.easypiechart.min.js', 'node_modules/easy-pie-chart/dist/jquery.easypiechart.min.js']

        },
        {
            name: 'ui.footable',
            serie: true,
            files: ['node_modules/angular-footable/dist/angular-footable.min.js', 'node_modules/footable/dist/footable.all.min.js', 'node_modules/footable/css/footable.core.min.css'],

        },
        {
            name: 'slick-carousel',
            serie: true,
            files: ['node_modules/slick-carousel/slick/slick.min.js', 'node_modules/angular-slick-carousel/dist/angular-slick.min.js', 'node_modules/slick-carousel/slick/slick.css', 'node_modules/slick-carousel/slick/slick-theme.css'],

        }]
};

function loadSequence(...args: string[]) {
    return {
        deps: ['$ocLazyLoad', '$q',
            function ($ocLL, $q) {
                var promise = $q.when(1);
                for (var i = 0, len = args.length; i < len; i++) {
                    promise = promiseThen(args[i]);
                }
                return promise;

                function promiseThen(arg) {
                    if (typeof arg == 'function')
                        return promise.then(arg);
                    else
                        return promise.then(() => {
                            var nowLoad = requiredData(arg);
                            if (!nowLoad)
                                return $.error('Route resolve: Bad resource name [' + arg + ']');
                            return $ocLL.load(nowLoad);
                        });
                }

                function requiredData(name) {
                    if (jsRequires.modules)
                        for (var m in jsRequires.modules)
                            if (jsRequires.modules[m].name && jsRequires.modules[m].name === name)
                                return jsRequires.modules[m];
                    return jsRequires.scripts && jsRequires.scripts[name];
                }
            }]
    };
}

function stringGen(len) {
    var text = '';

    var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}
