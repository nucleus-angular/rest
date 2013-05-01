angular.module('nag.rest.config', [])
.value('nagRestBaseUrl', '')
.value('nagRestResponseDataLocation', '')
.value('nagRestModelIdProperty', 'id')
.value('nagRestUpdateMethod', 'PUT')
.value('nagRestRequestFormatter', function() {});
