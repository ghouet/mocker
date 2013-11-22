//Common

$(document).ready(function () {
    startLoading();
    loadFeatures(0);
    loadAds(0);
    initContentQuickSearch("features");
    initContentQuickSearch("ads");
});

var perPage = 100
function from(page){ return page * perPage}
function to(page){ return (page+1) * perPage}

function initContentQuickSearch(type){
  $('#'+type+"-qc-input").keyup(function(){
    var filter = $('#'+type+"-qc-input").val();
    var count = 0;
    $('#'+type+'-list .col-sm-12').each(function(i, item){
      var itemKey = $("h5",$(this)).text();
      if(itemKey.indexOf(filter) != -1) {
        $(this).show();
        count+=1;
      }
      else $(this).hide();
    });
    if(filter!='') $('#'+type+"-qc-badge").text(count);
    else $('#'+type+"-qc-badge").text('');
  });
}

function loadFeatures(page) {
  $.ajax({ 
    url: '/api/entertainments?api-key=' + getParameterByName("api-key") + "&from="  + from(page) + "&to=" + to(page),
    cache: false,
    success: function(data)
    {
      $('#features-list').html('');
      $.each(data, function(i, item) {          
          /*var div = "<div class='col-sm-12 col-md-12'>";
          div += "<div class='panel panel-default'>";
  		    div += "<div class='panel-heading'><h5>"+item.external_key+"     ("+item.duration_in_seconds+"s)</h5></div>";
  		    div += "<div class='panel-body panel-primary'>";
          div += "<div id='rendition-list-"+item.id+i+"'></div>";
          div += "</div>";
  		    div += "</div></div>";*/
          var div = "<tr>"
          div += "<td>"+item.external_key+"</td>"          
          div += "<td>"+item.duration_in_seconds+"</td>"          
          div += "<td>"+item.created_at+"</td>"
          div += "</tr>"
          $('#features-list').append(div);
          loadRenditions('entertainments',item.id, item.site_id, "#rendition-list-"+item.id+i);
       });
       stopLoading();
    }
  });
  return false;
}

function loadAds(page) {
  $.ajax({ 
    url: '/api/ads?api-key=' + getParameterByName("api-key") + "&from=" + from(page) + "&to=" + to(page),
    cache: false,
    success: function(data)
    {
      $('#ads-list').html('');
      $.each(data, function(i, item) {
          var div = "<div class='col-sm-12 col-md-12'>";
          div += "<div class='panel panel-default'>";
          div += "<div class='panel-heading'><h5>"+item.external_key+"     ("+item.duration_in_seconds+"s)</h5></div>";
          div += "<div class='panel-body panel-primary'>";
          div += "<div id='rendition-list-"+item.id+i+"'></div>";
          div += "</div>";
          div += "</div></div>";
          $('#ads-list').append(div);
          loadRenditions('ads',item.id, item.site_id, "#rendition-list-"+item.id+i);        
       });
    }
  });
  return false;
}

function loadRenditions(type, id, siteId, container) {
   $.ajax({ 
    url: '/api/'+siteId+'/'+type+'/'+id+'/renditions?api-key=' + getParameterByName("api-key"),
    cache: false,
    success: function(data)
    {
      $.each(data, function(i, item) {
          var div = "<div class='col-md-2''>";
          div += "<div class='panel panel-primary'>";
          div += "<table class='table'><tbody>";
          div += "<tr class='active'><td ><b>Profile</b></td><td>"+ item.profile_key +"</td></tr>";
          div += "<tr><td><b>Bitrate</b></dtd><td>"+ item.avg_bit_rate +"</td></tr>";
          div += "<tr><td/><td>";
          div += "<button id='rendition-playlist-btn-"+id+i+"' type='button' class='btn btn-default'><span class='glyphicon glyphicon-list-alt'></span></button>";
          div+= "</td></tr>";
          div += "</tbody></table>";
          div += "</div>";
          div += "</div>";
          $(container).append(div);
          $('#rendition-playlist-btn-'+id+i).click(function(e){
             $('<div class="modal fade "><div class="modal-dialog modal-large"><div class="modal-content">' + 
                '<div class="modal-body">' +
                  '<pre>' + item.raw_m3u8 + '</pre>' +
                '</div></div></div></div>').modal('show');
          });
       });
    }
  });
  return false;
}

