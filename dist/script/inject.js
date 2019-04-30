
(function(window){

    // inject a JavaScript block of code or request an external JavaScript file
    function injectJS(_rule, _cb){

        // it's a remote file if ".path" is defined 
        if (_rule.path){

            var el = document.createElement('script');

            el.setAttribute('type', 'text/javascript');
            el.onload = _cb;
            el.onerror = function(){
                ___rules.unshift({ type: 'js', code: 'console.error("Code-Injector [JS] - Error loading: \"'+ _rule.path +'\"");'});
                _cb();
            };

            el.src = _rule.path +(_rule.path.indexOf('?') !== -1 ? '&':'?') +'cache='+Date.now();
            
            document.head.append(el);
        }
        else{

            var el = document.createElement('script');
                el.textContent = _rule.code;

            document.head.append(el);
            
            _cb();
        }
    }

    // inject a CSS block of code or request an external CSS file
    function injectCSS(_rule, _cb){

        // it's a remote file if ".path" is defined 
        if (_rule.path){

            var el = document.createElement('link');

            el.setAttribute('type', 'text/css');
            el.onload = _cb;
            el.onerror = function(){
                ___rules.unshift({ type: 'js', code: 'console.error("Code-Injector [CSS] - Error loading: \"'+ _rule.path +'\"");'});
                _cb();
            };

            el.href = _rule.path +(_rule.path.indexOf('?') !== -1 ? '&':'?') +'cache='+Date.now();
            
            document.head.append(el);
        }
        else{

			var	el = document.createElement('style');			
			
			if (_rule.code.includes("---")) {
				var fm, attrs, att, val;
				fm = _rule.code.match(/^(---)(.|\n)*(---)$/gim)[0];
				_rule.code = _rule.code.replace(fm,"");
				attrs = fm.replace(/---/g,"").replace(/\n\n/g,"\n").trim().split("\n");
				
				attrs.forEach(function(element){
					att = element.substr(0, element.indexOf(":")).trim();
					val = element.substr(element.indexOf(":")+1).trim();
					el.setAttribute(att, val);
				});				
			}
			
	
            el.textContent = _rule.code;

            document.head.append(el);

            _cb();
        }
    }

    // inject an HTML block of code 
    function injectHTML(_rule, _cb){

        // it's a remote file if ".path" is defined 
        // !! cannot request remote HTML files
        if (_rule.path) {
            ___rules.unshift({ type: 'js', code: 'console.error("Code-Injector [HTML] - Error, Cannot request remote HTML files.");'});
            _cb();
        }
        else{

            var parser = new DOMParser();
            var doc = parser.parseFromString(_rule.code, "text/html");

            while(doc.body.firstChild){
                document.body.append(doc.body.firstChild);
            }

            _cb();
        }
    }

    // Main loop to inject the selected rules by type
    function insertRules(_rules){

        var rule = _rules.shift();
        if (rule === undefined) return;

        switch(rule.type){

            case 'js': 
                injectJS(rule, insertRules.bind(null, _rules));
                break;

            case 'css': 
                injectCSS(rule, insertRules.bind(null, _rules));
                break;

            case 'html': 
                injectHTML(rule, insertRules.bind(null, _rules));
                break;

        }
    }

    // handle extension messages
    function handleOnMessage(_data, _sender, _callback){
        
        // immediately inject the list of rules without the "On page load" option enabled
        insertRules(_data.onCommit);
    
        // if the page isn't already loaded
        // wait for the page load to inject the list of rules with the "On page load" option enabled
        if (document.readyState === 'complete'){
            insertRules(_data.onLoad);
        }
        else{
            window.addEventListener('load', function(){
                insertRules(_data.onLoad);
            });
        }

        if (typeof _callback === 'function')
            return _callback(true);

        return true;
    }

    // messaging handler
    try{
        // check for the available compatibility
        var fallback = typeof chrome !== 'undefined' ? chrome : browser;

        // listen for extension messages
        fallback.runtime.onMessage.addListener(handleOnMessage);
    }
    catch(_x){
        console.error('[Code-Injector] Failed to listen for messages, Injection failed.', _x);
    }

}(window));

