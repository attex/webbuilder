// TIMETRACKER
function showTimes(t, started){
    if (!t){
        t = 0;
    }
    show(t);
    if (started){
        setTimeout(function(){
            showTimes(++t, true);
        }, 1000);
    }
}

function show(t) {
    t = parseInt(t);
    var res = "";
    var r0;
    var r1;
    if(t < 60){
        res = t + " Sekunden"
    } else {
        if(t<60*60) {
            r0 = div(t)
            res = r0[0] + ":" + r0[1] + " Minuten"
        } else {
            r0 = div(t)
            r1 = div(r0[0])
            res = r1[0] + ":" + r1[1] + ":" + r0[1] + " Stunden"
        }
    }
    $("#timespan").html(res);
}

function div(t) {
    m = Math.floor(t/60)
    return [m, fix_null(t-m*60)]
}

function fix_null(s){
    if (("" + s).length == 1){
        return "0" + s;
    }
    return s;
}

// REMOVE QUERY

function getQueryWithoutMessages(){
    var q = document.location.search;
    var res = [];
    var params = q.replace("?", "").split("&");
    for (var i in params){
        if(params != "") {
            if (!(params[i].indexOf("message=") == 0 ||
                params[i].indexOf("error=") == 0)) {
                res.push(params[i])
            }
        }
    }
    if (res != ""){
        return "?" + res.join("&")
    }
    return "";
}

function removeMessageQuery(){
    var query = getQueryWithoutMessages();
    history.replaceState(null, null, document.location.origin + document.location.pathname + query + document.location.hash);
}

function _updateQuery(key, value, baseurl){
    var params = baseurl.replace("?", "").split("&");
    var res = []
    var updated = false;
    for(var i in params){
        k_v = params[i].split("=");
        if(k_v[0].trim() == key) {
            res.push(key + "=" + value);
            updated = true;
        } else {
            if (k_v[0])
                res.push(k_v[0] + "=" + k_v[1]);
        }
    }
    if (!updated){
        res.push(key + "=" + value);
    }
    return "?" + res.join("&");
}
var currentQuery = document.location.search;

function _currentHREF(){
    return location.protocol + "//" + location.host + location.pathname + currentQuery;
}

function commitQuery(){
    history.pushState({}, document.title, _currentHREF());
    for(var i in ajaxInitilizedLists){
        if ($(ajaxInitilizedLists[i]).hasClass("ajax-adopt-query")){
            ajaxLoad($(ajaxInitilizedLists[i]), function () {});
        }
    }
}
var commitTimer;
function scheuleCommit(){
    if (commitTimer){
        clearTimeout(commitTimer);
        commitTimer = null;
    }
    if(currentQuery != document.location.search) {
        commitTimer = setTimeout((function (timer) {
            return function () {
                commitQuery();
            }
        })(commitTimer), 200);
    }
}

function updateQuery(key, value){
    // ajaxInitilizedLists
    currentQuery = _updateQuery(key, value, currentQuery);
    scheuleCommit();
}


// CONTAINER
// ajax-not-loaded
// ajax-save-state
// ajax-hidden
// ajax-never-hide

// data-access-url

// BUTTON
// data-icon-hidden
// data-icon-visible

function ajaxIsLoaded(item){
    return !item.hasClass("ajax-not-loaded")
}

function ajaxIsOpen(item) {
    return !(item.hasClass("ajax-not-loaded") || item.hasClass("ajax-hidden"));
}
function ajaxGetUrl(item){
    var url = item.attr("data-access-url");
    if(item.hasClass("ajax-adopt-query")) {
        if(url.indexOf("?") == -1){
            url += "?";
        } else {
            url += "&";
        }
        var args = window.location.search.replace("?", "").split("&")
        var fargs = []
        for(var i in args){
            if(args[i] && (args[i].indexOf("error") != 0 && args[i].indexOf("message") != 0)){
                fargs.push(args[i])
            }
        }
        url += fargs.join("&")
    }
    return url
}
function ajaxLoad(item, callback){
    if(item.attr("data-access-url").length == 0) {
        callback(false);
        return;
    }
    function failed(data, status){
        item.html(data.responseText);
        item.removeClass("ajax-not-loaded")
        callback(true);
    }
    $.get(ajaxGetUrl(item), function(data, status) {
        if (status = "success") {
            item.html(data)
            item.removeClass("ajax-not-loaded")
            callback(true)
        } else {
            callback(false);
        }
    }).fail(failed);
}


function ajaxOpen(item, callback) {
    if(!ajaxIsOpen(item)){
        if(ajaxIsLoaded(item)){
            item.removeClass("ajax-hidden");
            callback(true);
        } else {
            ajaxLoad(item, callback);
        }
    }
}
function ajaxExtendCallback(item, callback){
     // if no callback create empty callback
    if(!callback){
        callback = function(){}
    }
    // extend callback by cookie updating
    if(item.hasClass("ajax-save-state")) {
        callback = (function (callback) {
            return function (value) {
                if (value) {
                    Cookies.set(item.prop("id"), true)
                } else {
                    Cookies.remove(item.prop("id"))
                }
                return callback(value);
            }
        })(callback);
    }
    return callback;
}
function ajaxHide(item, callback){
    if(!item.hasClass("ajax-never-hide")) {
        item.addClass("ajax-hidden")
        callback(false);
    } else {
        callback(true);
    }
}

function toggleAjaxItem(item, callback){
    if(ajaxIsOpen(item)) {
        ajaxHide(item, callback);
    } else{
        ajaxOpen(item, callback);
    }
}

function ajaxSetUrl(item, url) {
    var vis = ajaxIsOpen(item)
    if (url && item.attr("data-access-url") != url) {
        item.attr("data-access-url", url);
        item.addClass("ajax-not-loaded");
        item.removeClass("ajax-hidden");
        if (vis){
            ajaxLoad(item, ajaxExtendCallback(item));
        }
    }
    return item;
}

ajaxInitilizedButtons = [];
function ajaxInitializeButton(item){
    item = $(item);
    if($.inArray(item[0], ajaxInitilizedButtons) != -1){
        return
    }
    ajaxInitilizedButtons.push($(item)[0])
    item.on("click", function (e) {
        var hidden = item.attr("data-icon-hidden") || "glyphicon-chevron-right";
        var visible = item.attr("data-icon-visible") || "glyphicon-chevron-down";
        item.removeClass(visible);
        item.removeClass(hidden);
        item.addClass("glyphicon-remove-circle");
        var toggle = ajaxSetUrl($("#" + $(item).attr("data-ajax-toggle")), $(item).attr("data-ajax-url"));
        toggleAjaxItem(toggle, ajaxExtendCallback(toggle, function(isopen) {
            item.removeClass("glyphicon-remove-circle");
            if(isopen){
                item.addClass(visible);
            } else {

                item.addClass(hidden);
            }
        }));
    });
}

ajaxInitilizedLists = [];
function ajaxInitializeList(item) {
    if($.inArray(item[0], ajaxInitilizedLists) != -1){
        return
    }
    ajaxInitilizedLists.push($(item)[0])
    var c = Cookies.get(item.prop("id"));
    if (c && item.hasClass("ajax-save-state")) {
        ajaxOpen(item, ajaxExtendCallback(item));
    }
}


// TIME ENTRY FROM VALIDATION
function clearCustomValidity(form){
    form = $(form);
    var end = form.find("input[name='end'], textarea[name='comment']").each(function(i, item){
        item.setCustomValidity("");
    });
}

function validateHomeForm(form, target){
    form = $(form);
    clearCustomValidity(form)
    var beg = form.find("input[name='begin']");
    var end = form.find("input[name='end']");
    var area = form.find("textarea[name='comment']");
    var res = true;
    if (end.length != 0 && beg.val() > end.val()){
        end[0].setCustomValidity("Endzeit muss größer als Anfangszeit sein.");
    }
    if (area.val() == ""){
        area[0].setCustomValidity("Beschreibe deine Tätigkeiten kurz.");
    }
    return res
}

function validatePWCForm(form){
    var f1 = form.find("input[name='password']");
    var f2 = form.find("input[name='password_wdh']");
    f2[0].setCustomValidity("");
    if (f1.val() != f2.val()){
        f2[0].setCustomValidity("Die Passwörter müssen übereinstimmen");
    }
    return true;
}



function findFormParent(item) {
    if (item.prop("tagName") == "FORM") {
        return item;
    }
    if (item.parent()) {
        return findFormParent(item.parent())
    }
    return null;
}

var CSFRValue = null;

// TIME TRACKER UPDATING
var requestTimer = null;
function updateTimeTracker(form){
    if (requestTimer){
        clearTimeout(requestTimer);
        requestTimer = null;
    }
    requestTimer = setTimeout((function(timer){
        return function(){
            sendTimeTrackerRequest(form)
        }
    })(requestTimer), 200);
}

var cgeReq = null;
function sendTimeTrackerRequest(form){
    if (cgeReq){
        cgeReq.abort();
    }
    cgeReq = $.post("/timetracker/", $(form).serialize());
}

function initializeTimeEntyFormButtons(form){
    $(".entry-buttons button").on("click", function (e) {
        form.find("#action").attr("value",$(e.target).attr("data-action"));
        form.attr("action", $(e.target).attr("data-url"));
    });
}
// redirect status from ajax request to current
function redirectStatusTo(none, type, evt){
    var key = "message";
    if (type=="error") {
        key = "error";
        evt = none;
    }
    if(evt.status == 500){
        alert("Internal Server Error");
        return;
    }
    var lines =  evt.responseText.split("\n");
    var entries = []
    for (var i in lines) {
        entries.push(key  + "=" + lines[i])
    }
    if (entries.length > 20) return;
    window.location.search = "?" + entries.join("&");
}

function updateValue(item){
    var value = [];
    item.find(".contract-list").children().each(function(i, item){
        if ($(item).find(".contract-entry").length == 0)
            return;
        value.push({
            begin: new Date($(item).find(".date-begin").find("input").val() + "-01"),
            end: new Date($(item).find(".date-end").find("input").val() + "-01"),
            target_hours: $(item).find("input[name=target_hours]").val()
        });
    });
    item.find("input[name=contracts]").val(JSON.stringify(value));
}

function removeContractEntry(item, entry){
    entry.remove();
    updateValue(item);
}

function addContractEntry(item, begin, end, target_hours){
    if(!begin){
        begin = new Date();
    }
    if(!end) {
        end = new Date();
    }
    item = $(item);
    var parent = document.createElement("div")
    $(parent).html(
            '<div class="contract-entry"> \
                <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4"> \
                    <div class="date-begin input-group date"> \
                        <input name="date" type="text" class="form-control" /> \
                        <span class="input-group-addon"> \
                            <span class="glyphicon glyphicon-calendar"></span> \
                        </span> \
                    </div> \
                </div> \
                <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4"> \
                    <div class="date-end input-group date"> \
                        <input name="date" type="text" class="form-control" /> \
                        <span class="input-group-addon"> \
                            <span class="glyphicon glyphicon-calendar"></span> \
                        </span> \
                    </div> \
                </div> \
                <div class="col-xs-2 col-sm-2 col-md-2 col-lg-2">	\
                    <input class="form-control" name="target_hours" type="number" value="0"> \
                </div>\
                <span class="glyphicon glyphicon-remove btn btn-danger righti"></span> \
            </div>');
    item.find(".contract-list").append(parent)
    var entry = $(parent).find(".contract-entry").last();
    entry.find(".glyphicon-remove").on("click", function(evt){
       removeContractEntry(item, entry);
    });
    entry.find(".date-begin").datetimepicker({
        defaultDate: new Date(begin),
        format: 'YYYY-MM'
    });
    entry.find(".date-end").datetimepicker({
        defaultDate: new Date(end),
        format: 'YYYY-MM'
    });
    entry.find("input[name=target_hours]").val(target_hours);
    updateValue(item);
    entry.find(".date, input[name=target_hours]").on("blur dp.change propertychange change click keyup input paste", function(evt){
        updateValue(item);
    });
}


function checkUserForm(pk) {
    //control variables
    var form = $("#edit-form-" + pk);
    var sendable = true;
    var errorMessage = "";
    var postToUrl = "/access/employees/"

    //data to send
    var surname = $("#input-surname-" + pk).val();
    var firstName = $("#input-firstname-" + pk).val();
    var emailOfUser = "" + $("#input-email-" + pk).val();

    var email = form.find("input[name=email]").val();
    var ldap = form.find("select[name=ldap_user_id]").val();
    var contracts = $("input[id=contracts-" + pk + "]").val();
    //control values
    if (contracts) {
        var jCont = JSON.parse(contracts);
        for (var i in jCont) {
            var cont = jCont[i];
            if (!cont.target_hours) {
                sendable = false;
                errorMessage += "Sollstunden muss eine Zahl größer als 0 sein.\n";
            }
            for (var j in jCont) {
                var cont2 = jCont[j];
                if (cont2 == cont)
                    continue;
                if (cont.end >= cont2.begin && cont.begin <= cont2.end) {
                    sendable = false;

                    errorMessage += ("Es existieren überlappende Einträge für: " +
                    new Date(cont.begin).getFullYear() + "-" + (new Date(cont.begin).getMonth() + 1) + " bis " +
                    new Date(cont.end).getFullYear() + "-" + (new Date(cont.end).getMonth() + 1) + "\n");
                    break;
                }
            }
        }
    }
    //control surname
    var nameRegEx = RegExp("^[-A-Za-zÄÖÜäöü ]+$");
    if (!nameRegEx.test(surname)) {
        sendable = false;
        errorMessage += "Nachname des Mitarbeiters enthält nicht nur A-Ü oder a-ü.\n"
    }
    //control firstName
    if (!nameRegEx.test(firstName)) {
        sendable = false;
        errorMessage += "Vorname des Mitarbeiters enthält nicht nur A-Ü oder a-ü.\n"
    }

    //control LDAP with backend
    if(form.find(".tabradio.active input").val() == "True"){
        //control email (not reliable) backend must control email
        var emailRegEx = RegExp("^.+@.+\..+[^@]$");
        if (!emailRegEx.test(emailOfUser)) {
            sendable = false;
            errorMessage += "Bitte geben Sie eine korrekte Email Adresse ein.\n";
        }
    } else{
        if (!ldap || ldap == "-1"){
            errorMessage += "Kein LDAP User ausgewählt."
            sendable = false;
        }
    }


    //send post if possible
    if (!sendable) {
        alert(errorMessage);
    }
    return sendable;
}



function createreqstring(){
    var text = "/statistics/query/?";
    var beg = $("#statistic-beginpicker").data("DateTimePicker");
    var first = true;
    if (beg.date()) {
        text += "begin__gte=" + beg.date().format("YYYY-MM-DD");
        first = false;
    }
    var end = $("#statistic-endpicker").data("DateTimePicker");
    if (end.date()) {
        if (first) {
            first = false;
        } else {
            text += "&";
        }
        text += "begin__lte=" + end.date().format("YYYY-MM-DD 23:59");
    }
    if ($("#tutor-input").length) {
        if ($("#tutor-dropdown").data("pk") == "-1"){
            if ($("#tutor-form").val() != "") {
                if (first) {
                    first = false;
                } else {
                    text += "&";
                }
                text += "tutorname=" + $("#tutor-form").val();
            }
        } else {
             if (first) {
            first = false;
        } else {
            text += "&";
        }
            text += "time_sheet__user__tutors__pk=" + $("#tutor-dropdown").data("pk");
        }
    }
    if ($("#hiwi-input").length) {
        if ($("#hiwi-dropdown").data("pk") == "-1"){
            if ($("#hiwi-form").val() != "") {
                if (first) {
                    first = false;
                } else {
                    text += "&";
                }
                text += "hiwiname=" + $("#hiwi-form").val();
            }

        } else {
            if (first) {
            first = false;
        } else {
            text += "&";
        }
            text += "time_sheet__user__pk=" + $("#hiwi-dropdown").data("pk");
        }
    }
    if ($("#project-dropdown").data("pk") == "-1"){
        if ($("#project-form").val() != "") {
            if (first) {
                first = false;
            } else {
                text += "&";
            }
            text += "project__name__icontains=" + $("#project-form").val();
        }
        } else {
        if (first) {
            first = false;
        } else {
            text += "&";
        }
            text += "project__pk=" + $("#project-dropdown").data("pk");
    }
    if ($("#category-dropdown").data("pk") == "-1"){
        if ($("#category-form").val() != "") {
            if (first) {
                first = false;
            } else {
                text += "&";
            }
            text += "category__name__icontains=" + $("#category-form").val();
        }
        } else {
        if (first) {
            first = false;
        } else {
            text += "&";
        }
            text += "category__pk=" + $("#category-dropdown").data("pk");
    }
    return text;

}

function initializeStatistics () {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    var graph1, graph2, graph3, graph4, graph5;
    graph1 = $('#first-graph');
    graph2 = $('#second-graph');
    graph3 = $('#third-graph');
    graph4 = $('#fourth-graph');
    graph5 = $('#fifth-graph');
    Plotly.plot(graph1[0], [{}], {title: 'Übersicht', xaxis: {type: date, tickformat:'%d.%m.%Y', hoverformat:'%d.%m.%Y'}, yaxis: {title: 'Stunden', rangemode: 'nonnegative'}}, {displayModeBar: false});
    Plotly.plot(graph2[0], [{}], {title: 'Kategorien: Gesamtübersicht', showlegend: true}, {displayModeBar: false});
    Plotly.plot(graph3[0], [{}], {title: 'Projekte: Gesamtübersicht', showlegend: true}, {displayModeBar: false});
    Plotly.plot(graph4[0], [{}], {title: 'Kategorien: zeitlicher Verlauf', showlegend: true, xaxis: {type: date, tickformat:'%d.%m.%Y', hoverformat:'%d.%m.%Y'}, yaxis: {title: 'Stunden (Summe)', rangemode: 'nonnegative'}}, {displayModeBar: false});
    Plotly.plot(graph5[0], [{}], {title: 'Projekte: zeitlicher Verlauf', showlegend: true, xaxis: {type: date, tickformat:'%d.%m.%Y', hoverformat:'%d.%m.%Y'}, yaxis: {title: 'Stunden (Summe)', rangemode: 'nonnegative'}}, {displayModeBar: false});
    $('#statistic-beginpicker').datetimepicker({
        defaultDate: firstDay,
        format: 'DD.MM.YYYY',
        showClear: true
    });
    $('#statistic-endpicker').datetimepicker({
        defaultDate: lastDay,
        format: 'DD.MM.YYYY',
        showClear: true
    });
    $('#tutor-dropdown').data("pk", "-1");
    $('#hiwi-dropdown').data("pk", "-1");
    $('#project-dropdown').data("pk", "-1");
    $('#category-dropdown').data("pk", "-1");
    $('#tutor-dropdown li a').on('click', function(){
        if ($(this).data("value") != "-1") {
            $('#hiwi-form').val("");
            $('#hiwi-dropdown').data("pk", "-1");
        }
        $('#tutor-dropdown').data("pk", $(this).data("value"));
        $('#tutor-form').val($(this).text());
        updateGraphs(graph1, graph2, graph3, graph4, graph5);
    });
    $('#hiwi-dropdown li a').on('click', function(){
        if ($(this).data("value") != "-1") {
            $('#tutor-form').val("");
            $('#tutor-dropdown').data("pk", "-1");
        }
        $('#hiwi-dropdown').data("pk", $(this).data("value"));
        $('#hiwi-form').val($(this).text());
        updateGraphs(graph1, graph2, graph3, graph4, graph5);
    });
    $('#project-dropdown li a').on('click', function(){
        $('#project-dropdown').data("pk", $(this).data("value"));
        $('#project-form').val($(this).text());
        updateGraphs(graph1, graph2, graph3, graph4, graph5);
    });
    $('#category-dropdown li a').on('click', function(){
        $('#category-dropdown').data("pk", $(this).data("value"));
        $('#category-form').val($(this).text());
        updateGraphs(graph1, graph2, graph3, graph4, graph5);
    });
    $('.form-control').on("change input paste blur", function(){
        updateGraphs(graph1, graph2, graph3, graph4, graph5);
    });
    $('#hiwi-form').on("change keyup input paste keydown", function(){
        $('#tutor-form').val("");
        $('#tutor-dropdown').data("pk", "-1");
    });
    $('#tutor-form').on("keydown", function(){
        $('#tuor-dropdown').data("pk", "-1");
    });
    $('#hiwi-form').on("keydown", function(){
        $('#hiwi-dropdown').data("pk", "-1");
    });
    $('#category-form').on("keydown", function(){
        $('#category-dropdown').data("pk", "-1");
    });
    $('#project-form').on("keydown", function(){
        $('#project-dropdown').data("pk", "-1");
    });

    updateGraphs(graph1, graph2, graph3, graph4, graph5);
    $(window).resize(function(){
        Plotly.Plots.resize(graph1[0]);
        Plotly.Plots.resize(graph2[0]);
        Plotly.Plots.resize(graph3[0]);
        Plotly.Plots.resize(graph4[0]);
        Plotly.Plots.resize(graph5[0]);
    });

    $('#statistics-export-link').on('click', function(){
        var encodedUri = encodeURI(createCSV());
        window.open(encodedUri);
    })

}
var old_query = "";
function updateGraphs(graph1, graph2, graph3, graph4, graph5) {
    if (old_query == createreqstring())
        return;
    old_query = createreqstring();
    invalidate();
    get_daily(function(data){
        graph1.show();
        graph1[0].data = [{x: data.x, y: data.y, type: 'bar'}];
        Plotly.redraw(graph1[0]);
        if (data.x.length == 0) {
            graph1.hide()
        }
    });
    get_category_pie(function(data){
        graph2.show();
        var text = [];
        for (var i=0; i < data.x.length; i++){
            text.push(data.y[i] + "h")
        }
        graph2[0].data = [{labels: data.x, values: data.y, type:'pie', text: text, hoverinfo:"label+text"}];
        Plotly.redraw(graph2[0]);
        if (data.x.length == 0){
            graph2.hide();
        }
    });
    get_project_pie(function(data){
        graph3.show();
        var text = [];
        for (var i=0; i < data.x.length; i++){
            text.push(data.y[i] + "h")
        }
        graph3[0].data = [{labels: data.x, values: data.y, type:'pie', text: text, hoverinfo:"label+text"}];
        Plotly.redraw(graph3[0]);
        if (data.x.length == 0){
            graph3.hide();
        }
    });
    get_daily_by_category(function(data){
        graph4.show();
        if (data.length == 0){
            graph4.hide();
            return;
        }
        var list = [];
        for(var i=0; i<data.length; i++){
            var m = "lines"
            if (data[i].x.length < 2){
                m = "markers"
            }
            list.push({name: data[i].name, type: 'scatter', x: data[i].x, y:data[i].y, mode:m});
        }
        graph4[0].data = list;
        Plotly.redraw(graph4[0]);
    })
    get_daily_by_project(function(data){
        graph5.show();
        if (data.length == 0){
            graph5.hide();
            return;
        }
        var list = [];
        for(var i=0; i<data.length; i++){
            var m = "lines"
            if (data[i].x.length < 2){
                m = "markers"
            }
            list.push({name: data[i].name, type: 'scatter', x: data[i].x, y:data[i].y, mode:m});
        }
        graph5[0].data = list;
        Plotly.redraw(graph5[0]);
    })
}

function get_daily(callback){ // stunden pro tag
    _get_prepared("daily", callback);
}

function get_daily_comm(callback){ // stunden pro tag
    _get_prepared("dailyComm", callback);
}

function get_project_pie(callback){
    _get_prepared("projectPie", callback)
}
function get_category_pie(callback){
    _get_prepared("categoryPie", callback)
}
function get_daily_by_project(callback){
    _get_prepared("dailyByProject", callback)
}
function get_daily_by_category(callback){
    _get_prepared("dailyByCategory", callback)
}

function invalidate(){
    _data = undefined;
}

function is_valid(){
    return !!_data;
}
var request_string = undefined;

var _data = undefined;

function _prepareData(){
    _prepareDaily();
    _prepareCategoryPie();
    _prepareProjectPie();
    _prepareDailyByProject();
    _prepareDailyByCategory();
    _prepareDailyComm();
}

var _prepared = {
};

function _get_prepared(name, callback){
    if (!is_valid()){
        _getData(function(){
            callback(_prepared[name]);
        });
    } else {
        callback(_prepared[name]);
    }
}

function _prepareDaily(){
    var data = _data.data;
    var temp_dict = {};
    for (var i in data){
        var entry = data[i];
        if (!(entry[0] in temp_dict)){
            temp_dict[entry[0]] = 0;
        }
        temp_dict[entry[0]] += entry[1]
    }
    var x = [];
    var y = [];
    var kl = sorted_keys(temp_dict)
    for(var i in kl) {
        x.push(kl[i]);
        y.push(Math.round(temp_dict[kl[i]] / 360) / 10);
    }
    _prepared.daily = {
        x: x,
        y: y
    }
}

function _prepareDailyComm(){
    var data = _data.data;
    var temp_dict = {};
    for (var i in data){
        var entry = data[i];
        if (!(entry[0] in temp_dict)){
            temp_dict[entry[0]] = 0;
        }
        temp_dict[entry[0]] += entry[1]
    }
    var x = [];
    var y = [];
    var last = 0;
    for(var i in temp_dict) {
        x.push(i);
        last = temp_dict[i] += last;
        y.push(Math.round(last / 360) / 10);
    }
    _prepared.dailyComm = {
        x: x,
        y: y
    }
}

function sorted_keys(list){
    var res = [];
    for(var i in list){
        res.push(i);
    }
    res.sort()
    return res
}
function _prepareCategoryPie(){
    var data = _data.data;
    var temp_dict = {}
    for (var i in data){
        var entry = data[i];
        if (!(entry[3] in temp_dict)){
            temp_dict[entry[3]] = 0;
        }
        temp_dict[entry[3]] += entry[1]
    }
    var x = [];
    var y = [];
    for(var i in temp_dict) {
        x.push(_data.categories[i]);
        y.push(Math.round(temp_dict[i] / 360) / 10);
    }
    _prepared.categoryPie = {
        x: x,
        y: y
    }
}

function _prepareProjectPie(){
    var data = _data.data;
    var temp_dict = {}
    for (var i in data){
        var entry = data[i];
        if (!(entry[2] in temp_dict)){
            temp_dict[entry[2]] = 0;
        }
        temp_dict[entry[2]] += entry[1];
    }
    var x = [];
    var y = [];
    for(var i in temp_dict) {
        x.push(_data.projects[i]);
        y.push(Math.round(temp_dict[i] / 360) / 10);
    }
    _prepared.projectPie = {
        x: x,
        y: y
    }
}

function _prepareDailyByProject(){
    var data = _data.data;
    var temp_dict = {};
    for (var i in data){
        var entry = data[i];
        if (!(entry[2] in temp_dict)){
            temp_dict[entry[2]] = {};
        }
        var project_dict = temp_dict[entry[2]]
        if (!(entry[0] in project_dict)){
            project_dict[entry[0]] = 0
        }
        project_dict[entry[0]] += entry[1];
    }
    for(var i in temp_dict){
        project_dict = temp_dict[i];
        var x = [];
        var y = [];
        var last = 0;
        var keys = sorted_keys(project_dict);
        for(var f in keys) {
            var g = keys[f];
            x.push(g);
            last = project_dict[g] + last;
            y.push(Math.round(last / 360) / 10 );
        }
        temp_dict[i] = {
            x: x,
            y: y
        }
    }
    var result = [];
    for(var i in temp_dict) {
        result.push(temp_dict[i]);
        temp_dict[i].name = _data.projects[i];
    }
    _prepared.dailyByProject = result
}


function _prepareDailyByCategory(){
    var data = _data.data;
    var temp_dict = {}
    for (var i in data){
        var entry = data[i];
        if (!(entry[3] in temp_dict)){
            temp_dict[entry[3]] = {};
        }
        var project_dict = temp_dict[entry[3]]
        if (!(entry[0] in project_dict)){
            project_dict[entry[0]] = 0
        }
        project_dict[entry[0]] += entry[1];
    }
    for(var i in temp_dict){
        project_dict = temp_dict[i];
        var x = [];
        var y = [];
        var last = 0;
        var keys = sorted_keys(project_dict);
        for(var f in keys) {
            var g = keys[f];
            x.push(g);
            last = project_dict[g] + last
            y.push(Math.round((last) / 360) / 10);
        }
        temp_dict[i] = {
            x: x,
            y: y
        }
    }
    var result = []
    for(var i in temp_dict) {
        result.push(temp_dict[i]);
        temp_dict[i].name = _data.categories[i];
    }
    _prepared.dailyByCategory = result
}


var callbacks = []
function _getData(callback){
    callbacks.push(callback);
    if(request_string == createreqstring()){
            return;
    }
    request_string = createreqstring();
    $.get(request_string, (function(requeststring){
        return (function(data, status, event) {
            if (requeststring == request_string) {
                _data = JSON.parse(data);
                _data.projects[-1] = "Kein Projekt";
                _data.categories[-1] = "Keine Kategorie";
                _prepareData();
                for (var i in callbacks) {
                    if (callbacks[i])
                        callbacks[i]();
                }
                callbacks = []
            }
        })
    })(request_string));
}

function createCSV(){
    var text="data:text/csv;charset=utf-8,";
    get_daily(function(data){
        text+="Datum,Stunden\n";
        text+=graphtocsv(data);
    });
    get_daily_by_category(function(data){
        for (var j = 0; j < data.length; j++){
            text+='Datum,"'+data[j].name+'" (Summe)\n'
            text+= graphtocsv(data[j]);
        }
    });
    get_daily_by_project(function(data){
        for (var j = 0; j < data.length; j++){
            text+='Datum,"'+data[j].name+'" (Summe)\n'
            text+= graphtocsv(data[j]);
        }
    });
    return text;
}
function graphtocsv(data){
    text = ""
    for (var i=0; i<data.x.length; i++){
        text += data.x[i] + "," + data.y[i] + "\n";
    }
    return text;
}

$(function() {
    $("input[name='csrfmiddlewaretoken']").each(function(i, item){
        CSFRValue = $(item).val();
    });

    $(".ajax-list-view").each(function(i, item) {
        if (!$(item).hasClass("ajax-on-event")) {
            ajaxOpen($(item), ajaxExtendCallback($(item)));
        }
    }).each(function(i, item){
        ajaxInitializeList($(item));
    });

    $(".ajax-list-toggle").each(function (i, item) {
        ajaxInitializeButton(item);
    });

    $(".home-form").each(function(i, item){
        $(item).on("submit", function(){
            return validateHomeForm($(item));
        }).find("input, textarea").bind("blur dp.change propertychange change click keyup input paste", function(ev){
           return validateHomeForm($(item), ev.target);
        });
        validateHomeForm($(item))
    });

   $(".form-changepsw").each(function(i, item){
        $(item).on("submit", function(){
            return validatePWCForm($(item));
        }).find("input").bind("blur propertychange change click keyup input paste", function(ev){
            return validatePWCForm($(item));
        });
        validatePWCForm($(item));
    });


    $(".ignore-form-validation").on("click", function(evt){

        var form = findFormParent($(evt.target));
        if(form) {
            clearCustomValidity(form);
        }
    });
    $(".home-form.time-tracking").find("select, textarea").on("blur propertychange change click keyup input paste", function(evt){
        var item = $(evt.target);
        updateTimeTracker($(findFormParent(item)));
    });

    $(".search-input").on("blur change click keyup input paste", function(ev){
       updateQuery("search", $(ev.target).val());
    });
    removeMessageQuery();
});


