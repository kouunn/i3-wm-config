var g_flg_option_update = false;

$(function(){
    translate_strings();
    init_pre_defined_list();
    init_usr_options();
    
    $("#btn_save").click(save_options);
    $("#btn_add").click(add_usr_code);
    $("#btn_all_on").click(turn_all_on);
    $("#btn_all_off").click(turn_all_off);
    $("#usr_defined").on("click", "a.del-btn", delete_usr_code); 
    
});

function translate_strings(){
    $(".trans").each(function(){
        $(this).html(chrome.i18n.getMessage($(this).html()));
    });
}
    
var TOGGLE_BTN_HTML = `
<label class="switch" >
  <input type="checkbox" checked>
  <span class="slider round"></span>
</label>
`;

var USR_CODE_HTML = `
<tr>
    <td><input class="form-control" value=""></td>
    <td><input class="form-control" value=""></td>
    <td><a class="btn btn-default del-btn" href="#" role="button">`
    + chrome.i18n.getMessage("Delete")
    +`</a></td>
</tr> 
`;

function turn_all_on(){
    $("#pre_defined input").prop("checked", true);
}

function turn_all_off(){
    $("#pre_defined input").prop("checked", false);
}

function init_pre_defined_list(){
    var tbl = $("#pre_defined");
    
    for (var code in TEXT_CODING_MAP){
        if(code === "default"){
            continue;
        }
        
        var temp = TEXT_CODING_MAP[code];
        var language = chrome.i18n.getMessage(temp[0]);
        var code_name = temp[1];
        
        var tr = $("<tr></tr>");
        var td = $("<td></td>");
        
        var label = $(TOGGLE_BTN_HTML);
        label.find("input").val(code);
        
        td.append(label);        
        
        tr.append($("<td>"+language+"</td>"))
            .append($("<td>"+code_name+"</td>"))
            .append(td)
            .appendTo(tbl);
    }    
}

function set_pre_defined(items){
    items.forEach(function(item){
        $("#pre_defined input[value='" + item + "']").prop("checked", false);
    });
}

function add_usr_code(){
    return $(USR_CODE_HTML).insertBefore($(this).closest("tr"));    
}

function delete_usr_code(e){
    $(this).closest("tr").remove();    
    e.stopPropagation();
}

function collect_disabled_menu (){
    var disabled =$("#pre_defined input:not(:checked)").map(function(){
        return $(this).val();
    })
    .get();                                                        
    
    return JSON.stringify(disabled);
}

function collect_usr_menu (){
    //var usr_menu = [];
    
    var usr_menu =  $("#usr_defined tr:gt(0)").map(function(){
        var lang = $(this).find("td:eq(0) input").val();
        var code = $(this).find("td:eq(1) input").val();
        
        if (lang && code ){
            return {
                "lang": lang,    
                "code": code,    
            };            
        }
        else {
            return null;
        }
    })
    .get();
    
    return JSON.stringify(usr_menu);
}

// Saves options to chrome.storage
function save_options() {
  chrome.storage.sync.set(
    {
        "disabled_menu" : collect_disabled_menu(),
        "usr_menu"      : collect_usr_menu()
    }, 
    function() {
        // Update status to let user know options were saved.
        var status = $("#save_status");
        status.fadeIn(400);
        //status.text('Options saved.');
        g_flg_option_update = true;
        setTimeout(function() {
          status.fadeOut(400);
        }, 1400);
    }
  );
}

//reload extension to apply new options
window.onbeforeunload = function(event) {
    if (g_flg_option_update){
        chrome.runtime.reload();
    }
    return null;
};

function init_usr_options(){
    chrome.storage.sync.get(
        {
            disabled_menu: "[]",
            usr_menu: "[]"
        }, 
        function(items) {
            set_pre_defined(JSON.parse(items["disabled_menu"]));
            init_usr_defined(JSON.parse(items["usr_menu"]));
        }
    );    
}

function init_usr_defined(usr_menu) { 
    var add_btn = $("#btn_add").get();
    usr_menu.forEach(function(item){
        var tr = add_usr_code.apply(add_btn);   
        tr.find("td:eq(0) input").val(item["lang"]);
        tr.find("td:eq(1) input").val(item["code"]);
    });
}