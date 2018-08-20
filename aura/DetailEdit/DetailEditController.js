({
    /*
	 * 初期処理
	 */
	doInit : function(component, event, helper) {
        //カラム情報
        var clmStr = component.get("v.ColumnStr");
        var clms = [];
        var clms = clmStr.split(',');
        component.set("v.ObjectColumn",clms);
        var action = component.get("c.getClmInfo");
        action.setParams({
            "sObjectType" : component.get("v.refObjectType"),
            "clms" : clms
        });
        action.setCallback(this, function(a) {
            if(a.getState() === "SUCCESS"){
                var rec = a.getReturnValue();
                helper.setClmInfo(component,rec,helper);
                helper.getRefRecords(component,helper);
            }else if(a.getState() === "ERROR"){
                 component.set("v.err",true);
                 var errors = action.getError();
                 if (errors) {
                     if (errors[0] && errors[0].message) 
                         component.set("v.errMsg",errors[0].message);
                 }
            }
        });
        $A.enqueueAction(action); 
	},
    /*
	 * カラムリサイズ
	 */
    calculateWidth : function(component, event, helper) {
        var childObj = event.target
        var mouseStart=event.clientX;
        component.set("v.currentEle", childObj);
        component.set("v.mouseStart",mouseStart);
        if(event.stopPropagation) event.stopPropagation();
        if(event.preventDefault) event.preventDefault();
        event.cancelBubble=true;
        event.returnValue=false; 
    },
    setNewWidth : function(component, event, helper) {
        var currentEle = component.get("v.currentEle");
        if( currentEle != null && currentEle.tagName ) {
            var parObj = currentEle;
            while(parObj.parentNode.tagName != 'TH') {
                if( parObj.className == 'slds-resizable__handle')
                    currentEle = parObj;    
                parObj = parObj.parentNode;
                count++;
            }
            var count = 1;
            var mouseStart = component.get("v.mouseStart");
            var oldWidth = parObj.offsetWidth;  
            var newWidth = oldWidth + (event.clientX - parseFloat(mouseStart));
            component.set("v.newWidth", newWidth);
            currentEle.style.right = ( oldWidth - newWidth ) +'px';
            component.set("v.currentEle", currentEle);
        }
    },
    resetColumn: function(component, event, helper) {
        if( component.get("v.currentEle") !== null ) {
            var newWidth = component.get("v.newWidth"); 
            var currentEle = component.get("v.currentEle").parentNode.parentNode; 
            var parObj = currentEle.parentNode; 
            parObj.style.width = newWidth+'px';
            currentEle.style.width = newWidth+'px';
            console.log(newWidth);
            component.get("v.currentEle").style.right = 0; 
            component.set("v.currentEle", null); 
        }
	},
    /*
     * クリックヘッダチェックボックス
     */
    clickHeaderChk : function(component, event, helper){
        var chk = component.get("v.allChk");
        var mapShow = component.get("v.mapShow");
        for ( var key in mapShow ) {
            mapShow[key].Selected = chk;
            var rec = mapShow[key].record;
            for(var i=0; i< rec.length; i++){
                rec[i].editmode = false;
            }
        }
        component.set("v.mapShow",mapShow);
    },
     /*
     * クリックレコードチェックボックス
     */   
    clickRecordChk : function(component, event, helper){
        var mapShow = component.get("v.mapShow");
        for ( var key in mapShow ) {
            var rec = mapShow[key].record;
            for(var i=0; i< rec.length; i++){
                rec[i].editmode = false;
            }
        }
        component.set("v.mapShow",mapShow);
    },
    /*
     * sort
     */
    clickHeader : function(component, event, helper){
        var edited = component.get("v.edited");
        if(edited){
            if( window.confirm( "編集内容が保存されていません。ページを並び替えてよろしいですか？" )){
                component.set("v.edited",false);
            }else{
                return;
            }
        }
        var target = event.target;
        if(target.tagName==null) return;
        if(target.tagName!="A"){
            while(true){
                target = target.parentNode;
                if(target.tagName==="A") break;
            }
        }
        if(target.tagName=="A"){
            var clms = component.get("v.ListHeaderApi");
            var sort = component.get("v.Sort");
            if(sort==="asc"){
                sort = "desc";
            }else{
                sort = "asc";
            }
            component.set("v.Sort",sort);
            component.set("v.SortClm",clms[target.rel]);
            helper.getRefRecords(component,helper);
        }
    },
    /*
     * インライン編集
     */
    clickClm : function(component, event, helper) {
        var target = event.target;
        if(target.tagName===null || target.tagName === undefined) return;
        if(target.tagName!="TD"){
            //TDまでノードを上る
            while(true){
                target = target.parentNode;
                if(target.tagName==="TD") break;
            }
        }
        var apiName;
        var recKey;
        if(target.tagName==="TD"){
            var UlPram = target.getElementsByTagName('ul');
            if(UlPram.length>0){
                var listPram = UlPram[0].children;
                for (var i = 0; i < listPram.length; i++){
                    if(listPram[i].id==="recKey") recKey=listPram[i].innerHTML;
                    if(listPram[i].id==="apiName") apiName=listPram[i].innerHTML;
                }
            }
            var mapShow = component.get("v.mapShow");
            component.set("v.selectRec",0);
            var cnt = 0;
            for ( var key in mapShow ) {
                if(mapShow[key].Selected)cnt++;
                if(mapShow[key].key===recKey){
                    var rec = mapShow[key].record;
                    for(var i=0; i< rec.length; i++){
                        if(rec[i].apiName === apiName){
                            rec[i].editmode = true;
                            break;
                        }
                    }
                }else{
                    var rec = mapShow[key].record;
                    for(var i=0; i< rec.length; i++){
                         rec[i].editmode = false;
                    }
                }
            }
            //現在の値を保持
            component.set("v.selectRec",cnt);
            component.set("v.mapShow",mapShow);
        }
    },
    /*
     * 更新値変更
     */
    fieldEdit : function(component, event, helper) {
        var recKey = event.getParam("sObjectId");
        var apiName = event.getParam("apiName");
        var newValue = event.getParam("value");
        var fixOther = event.getParam("fixOther");
        var mapShow = component.get("v.mapShow");
        for ( var key in mapShow ) {
            var fix = false;
            if(mapShow[key].key===recKey){
                fix = true;
            }
            if(fixOther){
                if(mapShow[key].Selected) fix = true;
            }
            if(fix){
                var rec = mapShow[key].record;
                for(var i=0; i< rec.length; i++){
                    if(rec[i].apiName === apiName){
                        rec[i].value = newValue;
                        rec[i].editmode = false;
                        if(rec[i].oldvalue != newValue){
                            rec[i].edited = "slds-is-edited";
                            component.set("v.edited",true);
                        }else{
                            rec[i].edited = "";
                        }
                        break;
                    }
                }
            }
        }
        //現在の値を保持
        component.set("v.mapShow",mapShow);        
    },
    /*
     * 更新値変更キャンセル
     */
    CancelEdit : function(component, event, helper){
        helper.cancelEditMode(component, event);
    },
    /*
     * 更新値変更保存
     */
    SaveEdit : function(component, event, helper){
        var ListData = component.get("v.ListData");
        var mapShow = component.get("v.mapShow");
        component.set("v.warning",false);
        component.set("v.err",false);
        var upd =[];
        for ( var key in mapShow ) {
            var rec = mapShow[key].record;
            for(var i=0; i< ListData.length; i++){
                if(mapShow[key].key === ListData[i].Id){
                    var edit = false;
                    for(var j=0; j< rec.length; j++){
                        if(rec[j].edited==="slds-is-edited"){
                            if(rec[j].fieldType==="DATETIME"){
                                var str = rec[j].value;
                                if($A.util.isEmpty(str)){
                                    ListData[i][rec[j].apiName] = rec[j].value;
                                }else{
                                    if(str.match(/^\d{4}\-\d{2}\-\d{2}\T\d{2}\:\d{2}\$/)){
                                        ListData[i][rec[j].apiName] = rec[j].value+':00.000Z';
                                    }else if(str.match(/^\d{4}\-\d{2}\-\d{2}\T\d{2}\:\d{2}\:\d{2}\.\d{3}\Z$/)){
                                        ListData[i][rec[j].apiName] = rec[j].value;
                                    }
                                }
                            }else{
                                ListData[i][rec[j].apiName] = rec[j].value;
                            }
                            edit = true;
                        }
                    }
                    if(edit)upd.push(ListData[i]);
                }
            }
        }
        var action = component.get("c.updListData");
        $A.util.removeClass(component.find('spinner'), 'slds-hide');
        action.setParams({
            "lstUpd" :  upd
        });
        action.setCallback(this, function(a) {
            if(a.getState() === "SUCCESS"){
                component.set("v.edited",false);
                var updrec = a.getReturnValue();
                for ( var key in mapShow ) {
                    var rec = mapShow[key].record;
                    for(var i=0; i< updrec.length; i++){
                        if(mapShow[key].key === updrec[i].Id){
                            for(var j=0; j< rec.length; j++){
                                rec[j].editmode = false;
                                rec[j].value = updrec[i][rec[j].apiName]
                                rec[j].oldvalue = rec[j].value;
                                rec[j].edited = "";
                            }
                    	}
                	}
                }
                component.set("v.mapShow",mapShow);
                $A.util.addClass(component.find('spinner'), 'slds-hide');
            }else if(a.getState() === "ERROR"){
                 component.set("v.err",true);
                 var errors = action.getError();
                 if (errors) {
                     if (errors[0] && errors[0].message) 
                         component.set("v.errMsg",errors[0].message);
                 }
            }
        });
        $A.enqueueAction(action); 
    },
    /*
     * レコードアクション
     */
    recordAction : function(component, event, helper) {
        //今は削除のみ
        if( window.confirm( "削除します。よろしいですか？" )){
            var selectValue = event.getParam("value");
            var ListData = component.get("v.ListData");
            var mapShow = component.get("v.mapShow");
			var del =[];
            for ( var key in mapShow ) {
                var rec = mapShow[key].record;
                if(mapShow[key].key ===  selectValue){
                    for(var i=0; i< ListData.length; i++){
                        if(mapShow[key].key === ListData[i].Id){
                            del.push(ListData[i]);
                            ListData.splice(i,1);
                        }
                    }
                }
            }
            var action = component.get("c.delData");
            $A.util.removeClass(component.find('spinner'), 'slds-hide');
            action.setParams({
                "lstDel" :  del
            });
            action.setCallback(this, function(a) {
                if(a.getState() === "SUCCESS"){
                    var pageSize = component.get("v.pageSize");
                    component.set("v.ListData",ListData);
                    component.set("v.allPage",Math.ceil(ListData.length/pageSize));
                    component.set("v.cnt",ListData.length);
 					//今のページを再表示
                    if(ListData.length > 0){
						var now = component.get("v.nowPage");

                        var paginationList = [];
                        var clms = component.get("v.ObjectColumn");
                        var clmInfo = component.get("v.mapClmInfo");
                        var cnt = 0;
                        //今のページでいいか
                        var size_index = (now * pageSize) - pageSize;
                        if(ListData.length > size_index){
                            for(var i=size_index; i<size_index+pageSize; i++){
                                if(ListData.length > i){
                                    helper.setMapShowRecord(component,ListData,clms,i,clmInfo,paginationList,helper);
                                    cnt++;
                                }
                            }     
                            component.set('v.mapShow', paginationList);
                        }else{
                            //満たない場合はページを下げる
                            helper.previousPage(component,helper);
                        }
                    }else{
                        component.set("v.cnt",0);
                        component.set("v.allPage",0);
                        component.set("v.nowPage",0);
                        component.set("v.warning",false);
                        component.set("v.err",false);
                    }
                    $A.util.addClass(component.find('spinner'), 'slds-hide');
                }else if(a.getState() === "ERROR"){
                     component.set("v.err",true);
                     var errors = action.getError();
                     if (errors) {
                         if (errors[0] && errors[0].message) 
                             component.set("v.errMsg",errors[0].message);
                     }
                }
            });
            $A.enqueueAction(action); 
        }else{
            return;
        }
    },
    /*
     * 新規ボタン押下
     */
    createData : function(component, event, helper) {
        var createRecordEvent = $A.get("e.force:createRecord");
        //子オブジェクトの親オブジェクト参照（または主従）項目名は親オブジェクト名であること
        var refApi = component.get("v.sObjectType");
        var params = {};
        params[refApi] = component.get("v.recordId"); //名前指定で連想を作成する
        createRecordEvent.setParams({
            "entityApiName": component.get("v.refObjectType"),
            "defaultFieldValues": params
        });
        createRecordEvent.fire();
    },
     /*
     * ページャー機能：次へ
     */
    Next : function(component, event, helper) {
        var edited = component.get("v.edited");
        if(edited){
            if( window.confirm( "編集内容が保存されていません。ページを切り替えてよろしいですか？" )){
                component.set("v.edited",false);
            }else{
                return;
            }
        }
		helper.nextPage(component,helper);	
		
    },
    /*
     * ページャー機能：前へ
     */    
    Previous : function(component, event, helper) {
        var edited = component.get("v.edited");
        if(edited){
            if( window.confirm( "編集内容が保存されていません。ページを切り替えてよろしいですか？" )){
                component.set("v.edited",false);
            }else{
                return;
            }
        }
		helper.previousPage(component,helper);		
    }
})