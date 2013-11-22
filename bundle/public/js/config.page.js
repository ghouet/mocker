//Common

$(document).ready(function () {
  startLoading();
  loadApplicationConfig(function(){stopLoading();}, "/accounts");
  loadProfileConfig(function(){stopLoading();});
});


initAppConfigFilters();
initAppConfigNewButton();
initProfileQuickSearch();
initProfileNewBtn();
initAppConfigQuickSearch();

function ajaxError(req, error){
  var msg = ""
  console.log(error)
  if (req.status === 0) {
    msg = ('Not connected.\n Verify Network.');
  } else if (req.status == 404) {
    msg = ('Resource not found. [404]');
  } else if (req.status == 500) {
    msg = ('Internal Server Error [500].');
  } else if (error === 'Bad Request'){
    msg = ('Invalid request : ' + req.responseText);
  } else if (error === 'parsererror') {
    msg = ('Requested content parse failed.');
  } else if (error === 'timeout') {
    msg = ('Time out error.');
  } else if (error === 'abort') {
    msg = ('Request aborted.');
  } else {
    msg = ('Uncaught Error.\n' + req.responseText);
  }
  stopLoading();
  notify("Error!",msg,"alert-danger");
}

//Application Configuration Tab
function currentPath(){ return '/' + $("#config-filters .active a").attr("href"); }

function initAppConfigFilters(){
  $('#config-filters li a').click(function(e){
    $('#config-filters li').removeClass('active');
    e.preventDefault();
    startLoading();
    var filter = $(this).attr('href');
    var active = $(this).parent();
    active.addClass('active');
    $('#app-field-list').html('');
    loadApplicationConfig(function(){
      stopLoading();},
      filter);
  });
}

function initAppConfigQuickSearch(){
  $('#appconfig-qc-input').keyup(function(){
    var filter = $('#appconfig-qc-input').val();
    console.log(filter)
    $('#app-field-list tr').each(function(i, item){
      var itemKey = $("input",$(this)).attr('id');
      if(itemKey.indexOf(filter) != -1) $(this).show();
      else $(this).hide();
    });
  });
}

function resetAppConfigQuickSearch(){
   $('#appconfig-qc-input').val('');
}

function initAppConfigNewButton() { 
  $("#new-appconfig-btn").click(function(event){
    addNewAppConfigRow();
    $(this).attr("disabled",true);
  }
  );
}

function addNewAppConfigRow() {
  var div = "<tr id='new-row' class='active'><td><div class='col-md-1 key-name'>"+currentPath()+"/</div><div class='col-md-5'><input type='text' id='newrow-key' class='form-control' placeholder='name'></div><div class='col-md-6 input-group'>" +
  "<input type='text' id='newrow-value' class='form-control' placeholder='value'>" +
  "<div class='input-group-btn'>" +  
  "<button class='btn btn-default' id='newrow-btn-save' type='button'><span class='glyphicon glyphicon-floppy-save'></span></button>" +   
  "<button id='rmvnewrow-btn' class='btn btn-default' type='button'><span class='glyphicon glyphicon-remove'></span></button>" +
  "</div></div></td></tr>";
  $('#app-field-list').prepend(div)
  $("#newrow-btn-save").click(function(e){
    saveKeyValue(currentPath() + '/' + $("#newrow-key").val(),$("#newrow-value").val());
 });
  $("#rmvnewrow-btn").click(function(event){
    $('#new-row').remove();
     $('#new-appconfig-btn').attr("disabled",false);
  });
}

function loadApplicationConfig(successCallback, path) {
  $('#new-appconfig-btn').attr("disabled",false);
  $.ajax({ 
    url: '/api/config/'+path+'?api-key=' + getParameterByName("api-key"),
    cache: false,
    success: function(data)
    {
      resetAppConfigQuickSearch();
      $('#app-field-list').html('');
      if(successCallback) {successCallback();}
      $.each(data, function(i, item) {
        var valattr = "";
           if("value" in item) valattr = " value='"+item.value+"'";
           var div = "<tr><td><div class='col-md-6 key-name'>"+item.key+"</div><div class='input-group col-md-6' id='row"+i+"'>" +
            "<input type='text' class='form-control' placeholder='value' id='"+item.key+"'"+valattr+">" +
            "<div class='input-group-btn'>" +  
            "<button class='btn btn-default save-btn-"+i+"' type='button'><span class='glyphicon glyphicon-floppy-save'></span></button>" +   
            "<button class='btn btn-default delete-btn-"+i+"' type='button'><span class='glyphicon glyphicon-trash'></span></button>" +
            "</div></div></td></tr>";
           $('#app-field-list').append(div);
            $(".save-btn-" + i).click(function(e){
             e.preventDefault();
             var key = $("#row"+ i + " input").attr("id");
             var value = $("#row"+ i + " input").val();
             saveKeyValue(key,value);
           });
            $(".delete-btn-" + i).click(function(e){
             e.preventDefault();
             var key = $("#row"+ i + " input").attr("id");
             confirm("Delete confirmation", "You are about to delete <strong>"+key+"</strong> and its descendants.<br/> Do you want to proceed ?", function(result) {
                if(result) deleteKey(key);
              });
           });
          });
    },
    error : function(r,o,e) { ajaxError(r,e,"#app-messages"); }
  });
  return false;
}

function saveKeyValue(key,value){
  startLoading();
  $.ajax({ 
    url: '/api/config'+key+'?api-key=' + getParameterByName("api-key"),
    type: "post",
    data: { value: value },
    success: function(data)
    {
      loadApplicationConfig(function(){
        stopLoading();
        notify("Success!",key+' has been succesfully updated.',"alert-success");
      }, currentPath());
    },
    error : function(r,o,e) { ajaxError(r,e,"#app-messages"); }
  });
}

function deleteKey(key){
  startLoading();
  $.ajax({ 
    url: '/api/config'+key+'?api-key=' + getParameterByName("api-key"),
    type: "delete",
    success: function(data)
    {
      loadApplicationConfig(function(){
        stopLoading();
        notify("Success!",key+' has been succesfully deleted.',"alert-success");
      }, currentPath());
    },
    error : function(r,o,e) { ajaxError(r,e,"#app-messages"); }
  });
}

//Profile Configuration Tab
function initProfileNewBtn(){
 $("#new-profile-btn").click(function(event){
    showNewProfileBlock();
    $(this).attr("disabled",true);
  }
  );
}

function initProfileQuickSearch(){
  $('#profile-qc-input').keyup(function(){
    var filter = $('#profile-qc-input').val();
    $('#profiles-list .col-md-4').each(function(i, item){
      var itemKey = $("#key",$(this)).val();
      if(itemKey.indexOf(filter) != -1) $(this).show();
      else $(this).hide();
    });
  });
}

function resetProfileQuickSearch(){
   $('#profile-qc-input').val('');
}

function showNewProfileBlock() {
  $('#new-profile').html('');  
   var div = "<div class='col-md-4' id='new-profile-container' ><div class='panel panel-primary' id='new-profile'>"
        div += "<table class='table'><tbody id='profile-pan-new'>";
        div += makeProfileField("Profile key", "key");
        div += makeProfileField("Target Bitrate", "target_bitrate");
        div += makeProfileField("Codecs", "codecs");
        div += makeProfileField("Resolution", "resolution");
        div += makeProfileField("Aspect Ratio", "aspect_ratio");
        div += makeProfileField("GOP Length", "gop_length");
        div += makeProfileField("GOP Size", "gop_size");
        div += makeProfileField("Audio Sample Rate", "audio_sample_rate");
        div += makeProfileField("Frame Rate", "frame_rate");
        div += "</tbody></table>";
        div += "<div class='panel-footer'>";
        div += "<button id='new-profile-btn-save' type='button' class='btn btn-default'><span class='glyphicon glyphicon-floppy-save'></span></button>";
        div += "<button id='new-profile-btn-remove' type='button' class='btn btn-default'><span class='glyphicon glyphicon-remove'></span></button>";
        div += "</div>";
        div += "</div></div>";
  $('#profiles-list').prepend(div);
  $("#new-profile-btn-save").click(function(e){
     var panId ="#profile-pan-new";
     createProfile($(panId + " #key").val(),
            $(panId + " #codecs").val(),
            $(panId + " #resolution").val(),
            $(panId + " #aspect_ratio").val(),
            $(panId + " #target_bitrate").val(),
            $(panId + " #gop_length").val(),
            $(panId + " #gop_size").val(),
            $(panId + " #audio_sample_rate").val(),
            $(panId + " #frame_rate").val());
 });
 $("#new-profile-btn-remove").click(function(event){
  $('#new-profile-container').remove();
     $('#new-profile-btn').attr("disabled",false);
  });
}

function makeProfileField(name, id, value, css, disabled) {
  var val = ""
  if(value != undefined) { val = " value='"+value+"'" }
  var cssClass = ""
  if(css != undefined) { cssClass = "class='"+css+"'" }
  var disabledAttr = ""
  if(disabled == true) { disabledAttr = "disabled"}
  return "<tr><td {0}><div class='profile-name col-md-5'><small>{1}</small></div><div class='col-md-7'><input type='text' class='input-sm form-control' {2} placeholder='value' id='{3}' {4}></div></td></tr>".format(cssClass, name, disabledAttr, id, val);
}

function makeProfileDiv(i, item) {
        var div = "<div class='col-md-4'><div class='panel panel-primary'><table class='table'><tbody class='profile-pan' id='profile-pan-{0}'>";
        div += makeProfileField("Profile key", "key", item.key, "active");
        div += makeProfileField("Target Bitrate", "target_bitrate", item.target_bitrate);
        div += makeProfileField("Codecs", "codecs", item.codecs);
        div += makeProfileField("Resolution", "resolution", item.resolution);
        div += makeProfileField("Aspect Ratio", "aspect_ratio", item.aspect_ratio);
        div += makeProfileField("GOP Length", "gop_length", item.gop_length);
        div += makeProfileField("GOP Size", "gop_size", item.gop_size);
        div += makeProfileField("Audio Sample Rate", "audio_sample_rate", item.audio_sample_rate);
        div += makeProfileField("Frame Rate", "frame_rate", item.frame_rate);
        div += makeProfileField("Creation Time", "created_at",  item.created_at, undefined, true);
        div += "</tbody></table>";
        div += "<div class='panel-footer'>";
        div += "<button id='profile-save-btn-{10}' type='button' class='btn btn-default'><span class='glyphicon glyphicon-floppy-save'></span></button>";
        div += "<button id='profile-delete-btn-{11}' type='button' class='btn btn-default'><span class='glyphicon glyphicon-trash'></span></button>";
        div += "</div></div></div>";

        return div.format(i, 
          item.key,
          item.codecs,
          item.resolution,
          item.aspect_ratio,
          item.target_bitrate,
          item.gop_length,
          item.gop_size,
          item.audio_sample_rate,
          item.frame_rate,
          i, i)
}

function loadProfileConfig(successCallback) {
  $('#new-profile-btn').attr("disabled",false);
  $.ajax({ 
    url: '/api/profiles?api-key=' + getParameterByName("api-key"),
    cache: false,
    success: function(data)
    {
      resetProfileQuickSearch();
      if(successCallback) {successCallback();}
      $('#profiles-list').html('');
      $.each(data, function(i, item) {                    
        $('#profiles-list').append(makeProfileDiv(i,item));
        $("#profile-save-btn-" + i).click(function(e){
         var panId ="#profile-pan-"+ i;
         updateProfile(item.id,
            item.site_id,
            $(panId + " #key").val(),
            $(panId + " #codecs").val(),
            $(panId + " #resolution").val(),
            $(panId + " #aspect_ratio").val(),
            $(panId + " #target_bitrate").val(),
            $(panId + " #gop_length").val(),
            $(panId + " #gop_size").val(),
            $(panId + " #audio_sample_rate").val(),
            $(panId + " #frame_rate").val(),
            item.created_at);
          });
        $("#profile-delete-btn-" + i).click(function(e){
          confirm("Delete confirmation", "You are about to delete the profile <strong>"+item.key+"</strong>.<br/> Do you want to proceed ?", function(result) {
            if(result) deleteProfile(item.id, item.site_id);
          });
        });
      });
    },
    error : function(r,o,e) { ajaxError(r,e,"#profiles-messages"); }
  });
  return false;
}

function createProfile(key, codecs, resolution, aspect_ratio, target_bitrate, gop_length, gop_size, audio_sample_rate, frame_rate){
  startLoading();
  $.ajax({ 
    url: '/api/profiles?api-key=' + getParameterByName("api-key"),
    type: "post",
    data: { key: key, 
      codecs: codecs, 
      resolution:resolution,
      aspect_ratio: aspect_ratio,
      target_bitrate: target_bitrate,
      gop_length: gop_length,
      gop_size: gop_size,
      audio_sample_rate: audio_sample_rate,
      frame_rate: frame_rate },
    success: function(data)
    {
      loadProfileConfig(function(){
        stopLoading();
        notify("Success!",'Profile has been succesfully created.',"alert-success");
      });
    },
    error: function(r,o,e) { ajaxError(r,e); }
  });
}


function updateProfile(id, siteId, key,codecs,resolution, aspect_ratio, target_bitrate, gop_length, gop_size, audio_sample_rate, frame_rate, created_at){
  startLoading();
  $.ajax({ 
    url: '/api/profiles/'+siteId+'/'+id+'?api-key=' + getParameterByName("api-key"),
    type: "post",
    data: { key: key, 
      codecs: codecs, 
      resolution:resolution,
      aspect_ratio: aspect_ratio,
      target_bitrate: target_bitrate,
      gop_length: gop_length,
      gop_size: gop_size,
      audio_sample_rate: audio_sample_rate,
      frame_rate: frame_rate,
      created_at: created_at},
    success: function(data)
    {
      loadProfileConfig(function(){
        stopLoading();
        notify("Success!",'Profile has been succesfully updated.',"alert-success");
      });
    },
    error: function(r,o,e) { ajaxError(r,e); }
  });
}

function deleteProfile(id, siteId){
  startLoading();
  $.ajax({ 
    url: '/api/profiles/'+siteId+'/'+id+'?api-key=' + getParameterByName("api-key"),
    type: "delete",
    success: function(data)
    {
      loadProfileConfig(function(){
        stopLoading();
        notify("Success!",'Profile has been succesfully deleted.',"alert-success");
      });
    },
    error: function(r,o,e) { ajaxError(r,e); }
  });
}
