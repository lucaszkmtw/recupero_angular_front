angular.module('app.financials.ar.debtmanagement',['app.financials.ar.debtmanagement.organisms',
'app.financials.ar.debtmanagement.organismtypes','app.financials.ar.debtmanagement.credittypes',
'app.financials.ar.debtmanagement.laws','app.financials.ar.debtmanagement.normatives',
'app.financials.ar.debtmanagement.normativelaws',
'app.financials.ar.debtmanagement.organismlaws','app.financials.ar.debtmanagement.debtortypes',
'app.financials.ar.debtmanagement.debtors','app.financials.ar.debtmanagement.organismtypes',
'app.financials.ar.debtmanagement.organisms','app.financials.ar.debtmanagement.credittypes',
'app.financials.ar.debtmanagement.organismproducts','app.financials.ar.debtmanagement.licensetypes',
'app.financials.ar.debtmanagement.proxies','app.financials.ar.debtmanagement.proxielicensetypes','app.financials.ar.debtmanagement.products',
'app.financials.ar.debtmanagement.collections','app.financials.ar.debtmanagement.prescriptions','app.financials.ar.debtmanagement.creditors',
'app.financials.ar.debtmanagement.organismcategories','app.financials.ar.debtmanagement.productcategories'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.ar.debtmanagement',
            {
                url: '/debtmanagement',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'findm.debtmanagement'
                }
            })    
 });
 