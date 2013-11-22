window.onload = function () {
        if (getParameterByName("auth") == "failed"){
            $("#failureMsg").html("Invalid username or password");
        }
}