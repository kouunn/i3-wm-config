//TODO add a choice : no pop up again(if click tell user can get waiting time info on chrome extension pop up page by images)
var global_var = global_var || {}; 
var alreadyRun = false;

function updateNotice(doneMsg){
    document.getElementById('background').classList.remove('alert-info');
    document.getElementById('background').classList.add('alert-success');
    document.getElementById('content').style.display = 'none';
    document.getElementById('notice').style.display = 'block';
    document.getElementById('content').style.display = 'none';
    document.getElementById("note").style.display = 'none';
    document.getElementById('timer').innerHTML = doneMsg;
}

function showNotice(title,content,note,doneMsg,queueSeconds,orgin_wait){
    if (!alreadyRun) {
    	document.getElementById('notice').style.display = 'block';
        document.getElementById("title").innerHTML = title;
        document.getElementById("content").innerHTML = content;
        if(orgin_wait){
            document.getElementById("orgin_wait").innerHTML = "("+orgin_wait+")";
        }
        document.getElementById("note").innerHTML = note;
        if(queueSeconds>0){
	    	startTimer(queueSeconds,doneMsg,title);
        }
        // needed because opening eg. DevTools to inpect the page
        // will trigger both the "complete" state and the tabId conditions
        // in background.js:
        alreadyRun = true; 
    }
}

function startTimer(the_seconds,doneMsg,begin_title) {
    titleScroller(begin_title+".  ");
    var timer = new Timer();
	timer.start({countdown: true, startValues: {seconds: the_seconds}});
	document.getElementById('timer').innerHTML = timer.getTimeValues().toString();
	timer.addEventListener('secondsUpdated', function (e) {
	    document.getElementById('timer').innerHTML = timer.getTimeValues().toString();
	});
	timer.addEventListener('targetAchieved', function (e) {
	    document.getElementById('timer').innerHTML = doneMsg;
        clearTimeout(global_var.marquee);
        titleScroller(doneMsg+".  ");
	    after();
	});


    function after(){
    	document.getElementById('background').classList.remove('alert-info');
    	document.getElementById('background').classList.add('alert-success');
    	document.getElementById('content').style.display = 'none';
    }

    function titleScroller(text) {
        document.title = text;
        global_var.marquee = setTimeout(function () {
            titleScroller(text.substr(1) + text.substr(0, 1));
        }, 150);
    }
}

