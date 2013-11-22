$(document).ready(function () {
	refreshHealth();
	$("#health-refresh-btn").click(function(e){
		refreshHealth();
	});
});

var servicelist=['stream_publisher','feature_service','ad_service','adrouter']

function refreshHealth() {
	$("#loading-ind").show();
  $.ajax({ 
    url: '/api/config/?api-key=' + getParameterByName("api-key"),
    cache: false,
    success: function(data)
    {
      $('#services-list').html('');
      var healthReport = new Array();
      $(data).each(function(i, item) {
          if(item.key.indexOf('/instances/')!=-1){
         			var name = item.key.split('/')[1];
         			var ip1 = item.value.split("tcp://")[1];
         			var ip2 = item.value.split("tcp://")[2];
         			healthReport.push({name:name,ip1:ip1,ip2:ip2})
       		}
       });
      buildHealthView(healthReport);
	  $("#loading-ind").hide();
    },
    error : function(r,o,e) { ajaxError(r,e,"#app-messages"); }
  });
  return false;
}

function buildHealthView(data){
  var inactiveServices = servicelist;
	$(data).each(function(i,item){
    var view = buildHealthServiceView(item.name, item.ip1+"<br/>"+item.ip2, "panel-success");	
    var index = inactiveServices.indexOf(item.name);
    if (index > -1) { inactiveServices.splice(index, 1); }
		$('#services-list').append(view);
	});
  $(inactiveServices).each(function(i,name){
    $('#services-list').append(buildHealthServiceView(name, 'Not running<br/><br/>', "panel-danger"));
  });
}

function buildHealthServiceView(name, content, css){
	var div = "<div class='col-sm-6 col-md-3'>";
    div += "<div class='panel "+css+"'>";
    div += "<div class='panel-heading'>"+name+"</div>";
    div += "<div class='panel-body'>"+content+"</div>";
    div += "</div></div>";
	return div;
}
