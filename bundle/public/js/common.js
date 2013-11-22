function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

if (typeof String.prototype.format != 'function') {
	String.prototype.format = function() {
	    var formatted = this;
	    for(arg in arguments) {
	        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
	    }
	    return formatted;
	};
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

function notify(title, msg, severity) {
 var alert = '<div class="navbar-fixed-top notification"><div class="alert pull-right '+severity+'"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>'+title+'</strong> '+msg+'</div></div>'
 $('body').append(alert);
 $(".alert").fadeIn("slow");
 $(".alert").delay(4000).fadeOut("slow", function () { $(this).remove(); });
}

function confirm(title, question, callback) {
    var confirmModal = 
      $('<div class="modal fade"><div class="modal-dialog"><div class="modal-content">' +    
          '<div class="modal-header">' +
            '<a class="close" data-dismiss="modal" >&times;</a>' +
            '<h3>'+title+'</h3>' +
          '</div>' +
          '<div class="modal-body">' +
            '<p>' + question + '</p>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<a href="#" class="btn" data-dismiss="modal">Cancel</a>' +
            '<a href="#" id="confirm-modal-ok" class="btn btn-primary">Proceed</a>' +
          '</div>' +
        '</div></div></div>');

    confirmModal.find('#confirm-modal-ok').click(function(event) {
      callback(true);
      confirmModal.modal('hide');
    });
    confirmModal.modal('show');
  };

var loadingModal = null;

function startLoading(){
  loadingModal= $('<div class="modal fade"></div>');
  loadingModal.modal({
    keyboard: false,
    backdrop: 'static',
    show:true
  });
}

function stopLoading(){
  loadingModal.modal('hide');
}


