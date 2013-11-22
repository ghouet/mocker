$(document).ready(function () {
	fetchChannels();
});

function fetchChannels() {
	$.ajax({ 
    url: 'http://localhost:7771/channels?api_key=qa-vdms',
    cache: false,
    success: function(data)
    {
      $('#channel-list').html('');
      $(data).each(function(i,item){
		$('#channel-list').append(buildChannelView(item));
	  });
    }
  });
  return false;
}

function uploadManifest(url, fileSelector) {
	console.log("Uploading to " + url);
	var file = $(fileSelector).get(0).files[0];
    if (file) {
        // create reader
		console.log("Uploading file" + file);
        startLoading();
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            //alert(e.target.result);
            $.ajax({
            	url:url,
            	cache: false,
            	type: "post",
    			data: e.target.result,
			    success: function(data)
			    {
			      alert("Manifest set");
        		  stopLoading();
			    }
            });
        };
    }
}

function buildChannelView(item){
	var status = "panel-success";
	if(!item.enabled) status = "panel-danger";

	var div = "<div class='col-md-4'><div class='panel "+status+"'>";
        div += "<div class='panel-heading'><center>" + item.name + "</center></div>";
        div += "<table class='table'><tbody class='profile-pan' id='profile-pan-{0}'>";
        div += makeProfileField("Analytics Id", "analyticsId", item.analyticsId);
        div += makeProfileField("Delivery Host", "deliveryHost", item.deliveryHost);
        div += makeProfileField("Token", "token", item.token);
        div += makeProfileField("Delivery Path", "deliveryPath", item.deliveryPath);
        div += makeProfileField("Playlist Duration", "playlistDuration", item.playlistDuration);
        div += makeProfileField("Preroll Ad Insertion", "prerollAdInsertion", item.prerollAdInsertion);
        div += makeProfileField("Base Stream Ad Insertion", "baseStreamAdInsertion", item.baseStreamAdInsertion);
        div += makeProfileField("Targeting Data", "targetingData", item.targetingData);
        div += makeProfileField("Enabled", "enabled", item.enabled);
        div += makeEncoderPanel(item)
        div += "</tbody></table>";
        div += "<div class='panel-footer'>";
        div += "<button id='profile-save-btn-{10}' type='button' class='btn btn-default'><span class='glyphicon glyphicon-floppy-save'></span></button>";
        div += "<button id='profile-delete-btn-{11}' type='button' class='btn btn-default'><span class='glyphicon glyphicon-trash'></span></button>";
        if(item.enabled) div += "<button id='profile-disable-btn-{11}' type='button' class='btn btn-danger'>Disable</button>";
        else div += "<button id='profile-enable-btn-{11}' type='button' class='pull-right btn btn-success'>Enable</button>";
        div += "</div></div></div>";
	return div;
}

function makeEncoderPanel(item){
	var encoderPanels = "<tr><td>Encoders";
	$(item.encoders).each(function(i,enc){
		var variantsDiv = "";
		$(item.encoders.variants).each(function(i,variant){
			variantsDiv+= "variant"+i
		});
		var setManifestDiv = "<button type='button' class='btn' id='set-manifest-btn-"+item.id+i+"'>Upload Manifest</button><input type='file' id='set-manifest-file-"+item.id+i+"'/>";
		encoderPanels += "<ul><li>id : "+enc.id+"</li><li>"+variantsDiv+"</li><li>"+setManifestDiv+"</li></ul>";
		var url = "http://loclahost:7771/channels/"+item.id+"/encoders/"+enc.id+"/update_playlist/"+item.token+"/manifest.m3u8";
		console.log( url + " -> #set-manifest-file-"+item.id+i);
			
		$("#set-manifest-btn-"+item.id+i).on("click", function(e){
			uploadManifest(url,"#set-manifest-file-"+item.id+i);
		});
	});
	return encoderPanels + "</td></tr>";
}


function makeProfileField(name, id, value, css, size) {
  var val = ""
  if(value != undefined) { val = " value='"+value+"'" }
  var cssClass = ""
  return "<tr><td {0}><div class='profile-name col-md-5'><small>{1}</small></div><div class='col-md-7'><input type='text' class='input-sm form-control' placeholder='value' id='{2}' {3}></div></td></tr>".format(cssClass, name,id, val);
}
