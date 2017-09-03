$(document).ready(function(){

	var apikey = "&key=KVEz-WDMsj";
	var auth = "auth=";
	var uniquets = "&uniquets=1489158738699";
	var path = "&path=%2F";
	var apihost;
    var fname;

	function compare(a,b){
		if(a.path<b.path){
			return -1;
		}
		if(a.path>b.path){
			return 1;
		}
		return 0;
	}

    function sp(k){
    	for (x = 0; x < k; x++) {$("textarea").append("+");}
		$("textarea").append("\r\n");
    }

    $.ajaxSetup({timeout: 30000});

    $("#url").click(function(){
         $(this).val("");
    });
	
    $("#get").click(function(){
        var url = $("#url").val();
        var loc = url.indexOf("uuid");
        var jid = url.indexOf("jobs");
        var one = url.indexOf("st/4/jobs");
        var see = url.indexOf("see.capture-app.com");
        var story = url.indexOf("story.capture-app");

        var myauth = $("#myauth").val();
        if(myauth){
        	auth="auth="+myauth;
        }

		function sauth() {
			var hmacSHA1 = function (key) {
				var hasher = new sjcl.misc.hmac(key, sjcl.hash.sha1);
				this.encrypt = function () {
					return hasher.encrypt.apply(hasher, arguments);
				};
			};

			var password = sjcl.codec.hex.fromBits( sjcl.hash.sha1.hash(myauth + jobuuid) );
			var key = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(password, jobuuid, 1001, 5*32, hmacSHA1));
			return key;
		}

        if (!url){
                alert("No Link. Please Enter Caputre Link.");
                throw "No URL";
            } else if (see>=0){
            	loc+=5;
                var jobuuid = url.substr(loc,36);
            } else if (one>=0) {
            	jid+=5;
            	var jobuuid = url.substr(jid,36);
            } else if (story>=0) {
            	var a = url.lastIndexOf("/");
				var b = url.substring(a + 1);
				var jobuuid = toolbox.b64ToUuid(b);
				if(myauth){
        		auth = "auth="+encodeURIComponent(sauth());
 		       }
				
            } else {
                alert("Not Caputre link");
                throw "Not Caputre share link";
        }

        $.getJSON('https://login.cptr.no/st/4/jobs/'+jobuuid+'/service?', function(data){
            apihost=data.service["app-host"];
            $.getJSON('https://'+apihost+'/st/4/jobs/'+jobuuid+'/files?'+auth+apikey+path+uniquets, function(data){
            	try {
				data.sort(compare);
				}
				catch(err){
					alert(err);
				}

				for (i=0; i < data.length; i++) {
					var size = (data[i].size/1048576);

					if (size != parseInt(size,10)){
						var size = size.toFixed(2);
					}

                	var str = data[i].path;

					fname = encodeURIComponent(str);

					var finalurl = 'https://'+apihost+ '/st/4/jobs/' + jobuuid + '/files_by_id/' + data[i].id +'/'+fname+'?'+auth+apikey+'\r\n';

					if (str.search("part")>1){
							var s = str.lastIndexOf("part");
							var e = str.lastIndexOf(".");
							var id = parseInt(str.substring((s+4), e));

						if (str.search("part1\\.")>1 | str.search("part01\\.")>1){
							str2 = str.substring(0,(s-1));
							$("textarea").append("\r\n"+str2+"\r\n");
							sp(35);
						}

							$("textarea").append("Part "+id+" ("+size+"MB)\r\n"+finalurl+"\r\n")
					}
					else {
						sp(35);
						$("textarea").append(str+"\r\nSize ("+size+"MB)\r\n"+finalurl+"\r\n");
					}
				}
            })
            .fail(function(xhr){
                mystatus = xhr.status;
                switch(mystatus) {
                    case 404:
                        alert("So bad :(\r\nFiles had been deleted!");
                        break;
                    case 429:
                        alert("Too Many Requests! :O\r\nTry it tomorrow.");
                        break;
                    case 403:
                        alert("Password protected link! :/\r\nYou must provide Password or auth key.");
                        break;
                    case 401:
                        alert("Only owner can download this type of link!\r\nAsk him/her to share it public");
                        break;
                    default:
                        //alert("ERROR_NETWORK_NOT_REACH!");
                }
            });
        })
        .fail(function(){ alert("ERROR_NETWORK_NOT_REACH");});
    });
	
	$("#reset").click(function(){
		$("textarea").text("Links will be there...\r\n");
		$("#url").val("");
		$("#myauth").val("");
		auth = "auth=";
	});
});