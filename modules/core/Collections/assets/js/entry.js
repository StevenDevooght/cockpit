(function($){

    App.module.controller("entry", function($scope, $rootScope, $http, $timeout){

        var collection = COLLECTION,
            entry      = COLLECTION_ENTRY || {};

        $scope.collection = collection;
        $scope.entry      = entry;
        $scope.versions   = [];

        $scope.collectionEntries = {};

        // init entry with default values
        if(!entry["_id"] && collection.fields && collection.fields.length) {
            collection.fields.forEach(function(field){
                if(field["default"]) entry[field.name] = field["default"];
            });
        }

        // init the related collection entries
        if(collection.fields && collection.fields.length) {
            collection.fields.forEach(function(field){
                if(field.type === "collection") {
                    $scope.collectionEntries[field.collection] = [];
                }
            });
        }

        $scope.loadVersions = function() {

            if(!$scope.entry["_id"]) {
                return;
            }

            $http.post(App.route("/api/collections/getVersions"), {"id":$scope.entry["_id"], "colId":$scope.collection["_id"]}).success(function(data){

                if(data) {
                    $scope.versions = data;
                }

            }).error(App.module.callbacks.error.http);
        };

        $scope.clearVersions = function() {

            if(!$scope.entry["_id"]) {
                return;
            }

            App.Ui.confirm(App.i18n.get("Are you sure?"), function(){

                $http.post(App.route("/api/collections/clearVersions"), {"id":$scope.entry["_id"], "colId":$scope.collection["_id"]}).success(function(data){
                    $timeout(function(){
                        $scope.versions = [];
                        App.notify(App.i18n.get("Version history cleared!"), "success");
                    }, 0);
                }).error(App.module.callbacks.error.http);
            });
        };

        $scope.restoreVersion = function(versionId) {

            if(!versionId || !$scope.entry["_id"]) {
                return;
            }


            App.Ui.confirm(App.i18n.get("Are you sure?"), function(){

                var msg = $.UIkit.notify(['<i class="uk-icon-spinner uk-icon-spin"></i>', App.i18n.get("Restoring version...")].join(" "), {timeout:0});

                $http.post(App.route("/api/collections/restoreVersion"), {"docId":$scope.entry["_id"], "colId":$scope.collection["_id"],"versionId":versionId}).success(function(data){

                    setTimeout(function(){
                        msg.close();
                        location.href = App.route("/collections/entry/"+$scope.collection["_id"]+'/'+$scope.entry["_id"]);
                    }, 1000);
                }).error(App.module.callbacks.error.http);
            });
        };

        $scope.save = function(){

            var entry = angular.copy($scope.entry);

            if ($scope.validateForm(entry)) {
                $http.post(App.route("/api/collections/saveentry"), {"collection": collection, "entry":entry, "createversion": true}).success(function(data){

                    if(data && Object.keys(data).length) {
                        $scope.entry = data;
                        App.notify(App.i18n.get("Entry saved!"));

                        $scope.loadVersions();
                    }

                }).error(App.module.callbacks.error.http);
            }
        };

        $scope.validateForm = function(entry){
            var valid = true;

            $scope.collection.fields.forEach(function(field){
                delete field.error;
                if (field.required && (entry[field.name] === undefined || entry[field.name] === '')) {
                    field.error = App.i18n.get('This field is required.');
                    valid = false;
                }
            });

            return valid;
        };

        $scope.fieldsInArea = function(area) {

            var fields = [];

            if(area=="main") {

                fields = $scope.collection.fields.filter(function(field){

                    return (['text','html', 'markdown','code','wysiwyg','markdown', 'gallery', 'collection'].indexOf(field.type) > -1);
                });

            }

            if(area=="side"){
                fields = $scope.collection.fields.filter(function(field){
                    return ['select','date','time','media','boolean','tags'].indexOf(field.type) > -1;
                });
            }

            return fields;
        };

        function loadCollectionEntries() {
            Object.keys($scope.collectionEntries).forEach(function(key) {
                $http.post(App.route("/api/collections/findone"), { "filter": { _id: key } }).success(function(data){
                    var searchField = data.searchField;
                    
                    $http.post(App.route("/api/collections/entries"), {"collection": { _id: key, sortorder: null, sortfield: null } }).success(function(data) {
                        for(var i=0; i < data.length; i++) {
                            data[i].searchField = data[i][searchField];
                        }
                        $scope.collectionEntries[key] = data;
                    });
                });
            });
        }

        $scope.loadVersions();
        
        loadCollectionEntries();
    });

})(jQuery);
