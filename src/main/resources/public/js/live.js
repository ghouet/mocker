
$(document).ready(function () {
    pullRequests();
    pullHistory();
});

function doQuickReply(event){
  var code = $(".response-code", $(event.target).parent().parent()).text();
  var body = $(".response-body", $(event.target).parent().parent()).text();
  $.ajax({ 
    url: '/requests/' + $("#curent-request-name").text() + "?code=" + code,
    cache: false,
    type: "POST",
    data: body,
    success: function(data)
    {
      pullRequests();
      pullHistory();
    }
  });
  return true;
}

function doReply(event){
  $.ajax({ 
    url: '/requests/' + $("#curent-request-name").text() + "?code=" + $(event.target).text(),
    cache: false,
    data: $("#reply-body").val(),
    type: "POST",
    success: function(data)
    {
      pullRequests();
      pullHistory();
    }
  });
  return true;
}

function pullRequests() {
  $('#current-request').html('None');
  $('#request-list').html('<tr><td>Empty<td></tr>');
  $('#reply-block').hide();
  $.ajax({ 
    url: '/requests',
    cache: false,
    success: function(data)
    {
      if(data.length > 0){        
        $('#current-request').html('');
        $('#reply-block').show();
      }
      if(data.length > 1){ 
        $('#request-list').html('');   
      }
      $.each(data, function(i, item) {
        if(i==0)
          $('#current-request').append(makeHeadRequest(item));
        else
          $('#request-list').append(makeQueuedRequest(item));
      });
      $('.doreply').click(doReply)
      $('#pending-count').html(Math.max(data.length - 1,0))
    }
  });
  return false;
}


function makeHeadRequest(item){
  var div = "<form class='form-horizontal' role='form'>";
  div += "<div class='form-group'>";
  div += "<p id='curent-request-name' class='hidden'>"+item.name+"</p>"
  div += "<label class='col-sm-2 control-label'>Method</label>";
  div += "<div class='col-sm-10'><p class='form-control-static'>"+item.method+"</p></div>";
  div += "</div>";
  div += "<div class='form-group'>";
  div += "<label class='col-sm-2 control-label'>Path</label>";
  div += "<div class='col-sm-10'><p class='form-control-static'>"+item.path+"</p></div>";
  div += "</div>";
  div += "<div class='form-group'>";
  div += "<label class='col-sm-2 control-label'>Body</label>";
  div += "<div class='col-sm-10'><p class='form-control-static'>"+item.body+"</p></div>";
  div += "</div>";
  return div

}

function makeQueuedRequest(item){
  var div = "<tr>";
  div += "<td>"+item.method+"</td>";
  div += "<td>"+item.path+"</td>";
  div += "<td>"+item.body+"</td>";
  div += "</tr>";
  return div
}

function pullHistory() {
  $('#history').html('<tr><td>Empty<td></tr>');
  $.ajax({ 
    url: '/history',
    cache: false,
    success: function(data)
    {
      if(data.length > 0){    
        $('#history').html('');
        $.each(data, function(i, item) {      
            var div = makeHistory(item)
            $('#history').append(div);
        });
        $('.doquickreply').click(doQuickReply)
      }
    }
  });
  return false;
}

function makeHistory(item){
  var div = "<tr>";
  div += "<td ><button type='button' class='btn btn-default btn-sm doquickreply'>Re-Use</button></td>";
  div += "<td class='response-code' >"+item.code+"</td>";
  div += "<td class='response-body' >"+item.body+"</td>";
  div += "</tr>";
  return div
}

