({
    /*
     * レコード取得
     */
	getRefRecords : function(component, helper) {
		var action = component.get("c.getRefData");
        $A.util.removeClass(component.find('spinner'), 'slds-hide');
        component.set("v.cnt",0);
        component.set("v.allPage",0);
        component.set("v.nowPage",0);
        component.set("v.warning",false);
        component.set("v.err",false);
        action.setParams({
            "sObjectType" : component.get("v.sObjectType"),
            "refObject" : component.get("v.refObjects"),
            "recId" : component.get("v.recordId"),
            "clms" : component.get("v.ObjectColumn"),
            "sortclm": component.get("v.SortClm"),
            "sorted": component.get("v.Sort")
        });
        action.setCallback(this, function(a) {
            if(a.getState() === "SUCCESS"){
                var rec = a.getReturnValue();
                console.log(rec);
                helper.setMapShow(component,rec,helper);
            }else if(a.getState() === "ERROR"){
                component.set("v.err",true);
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) 
                        component.set("v.errMsg",errors[0].message);
                }
            }
            $A.util.addClass(component.find('spinner'), 'slds-hide');
        });
        $A.enqueueAction(action);  
	},
    setClmInfo : function(component,rec,helper) {
        var label=[];
        var api=[];
        var clmInfo=[];
        //Mapから取得
        for ( var key in rec ) {
            label.push(rec[key]['LabelName']);
            api.push(rec[key]['apiName']);
            //項目情報
            clmInfo.push({
                key:rec[key]['apiName'],
                isUpdate : rec[key]['isUpdate'],
                fieldType : rec[key]['fieldType'],
                length : rec[key]['length'],
                piclistLabel : rec[key]['piclistLabel'],
                piclistValue : rec[key]['piclistValue']
            });
        }
        component.set("v.ListHeader",label);
        component.set("v.ListHeaderApi",api);
        component.set("v.mapClmInfo",clmInfo);
    },
    /*
     * レコードセット
     */
    setMapShow : function(component,rec,helper) {
        if(rec != null && rec.length > 0){
            //recの関連リストが対象
            var refName = component.get("v.refObjects");
            var refrec = rec[0][refName];
            if(refrec==null) refrec =[];
            var pageSize = component.get("v.pageSize");
            component.set("v.cnt",refrec.length);
            component.set("v.ListData", refrec);
            component.set("v.start",0);
            component.set("v.nowPage",1);
            component.set("v.end",pageSize-1);
            component.set("v.allPage",Math.ceil(refrec.length/pageSize));
            var paginationList = [];
            var clms = component.get("v.ObjectColumn");
            var clmInfo = component.get("v.mapClmInfo");
            for(var i=0; i< pageSize; i++){
                helper.setMapShowRecord(component,refrec,clms,i,clmInfo,paginationList,helper);
            }
            component.set('v.mapShow', paginationList); 
        }
	},
    /*
     * レコードセット
     */
    setMapShowRecord : function(component,rec,clms,i,clmInfo,paginationList,helper) {
        if(rec[i]!=null){
            var rArr = []
            var clmIndex = 0;
            for(var key of clms){
                if(key!="Id" && key!="id" && key!="ID"
                   && key!="Name" && key!="name" && key!="NAME"){
                    var isUpdate=false;
                    var fieldType;
                    var length;
                    var picLabel;
                    var picValue;
                    for(var j=0; j< clmInfo.length; j++){
                        if(key===clmInfo[j].key){
                            isUpdate = clmInfo[j].isUpdate;
                            fieldType = clmInfo[j].fieldType;
                            length = clmInfo[j].length;
                            picLabel = clmInfo[j].piclistLabel;
                            picValue = clmInfo[j].piclistValue;
                            break;
                        }
                    }
                    rArr.push({
                        "apiName":key,
                        "value":rec[i][key],
                        "oldvalue":rec[i][key],
                        "clmIndex" : clmIndex,
                        "isUpdate" : isUpdate,
                        "fieldType" : fieldType,
                        "length" : length,
                        "piclistLabel" : picLabel,
                        "piclistValue" : picValue,
                        "editmode":false,
                        "edited":""
                    });
                    clmIndex++;
                }
            }
            paginationList.push({
                key:rec[i].Id,
                Name:rec[i].Name,
                Selected:false,
                record:rArr
            });
        }        
        
    },
    /*
     * 編集キャンセル
     *  IN  @ component ：component情報
     *      @ helper : helper情報
     */
    cancelEditMode : function(component,helper) {
        var mapShow = component.get("v.mapShow");
        for ( var key in mapShow ) {
            var rec = mapShow[key].record;
            for(var i=0; i< rec.length; i++){
                rec[i].editmode = false;
                rec[i].value = rec[i].oldvalue;
                rec[i].edited = "";
            }
        }
        component.set("v.edited",false);
        component.set("v.mapShow",mapShow);
        component.set("v.err",false);
        $A.util.addClass(component.find('spinner'), 'slds-hide');
    },
    nextPage : function(component,helper) {
        var end = component.get("v.end");
        var start = component.get("v.start");
        var pageSize = component.get("v.pageSize");
        var paginationList = [];
        var now = component.get("v.nowPage");
        var cnt = 0;
        var rec = component.get("v.ListData");
        var clms = component.get("v.ObjectColumn");
        var clmInfo = component.get("v.mapClmInfo");
        for(var i=end+1; i<end+pageSize+1; i++){
            if(rec.length > end){
				helper.setMapShowRecord(component,rec,clms,i,clmInfo,paginationList,helper);
                cnt++;
            }
        }
        start = start + cnt;
        end = end + cnt;
        component.set("v.start",start);
        component.set("v.end",end);
        component.set("v.nowPage",now+1);
        component.set('v.mapShow', paginationList);
    },
    previousPage : function(component,helper) {
        var rec = component.get("v.ListData");
        var end = component.get("v.end");
        var start = component.get("v.start");
        var pageSize = component.get("v.pageSize");
        var now = component.get("v.nowPage");
        var paginationList = [];
        var cnt = 0;
        var clms = component.get("v.ObjectColumn");
        var clmInfo = component.get("v.mapClmInfo");
        for(var i= start-pageSize; i < start ; i++){
            if(i > -1){
				helper.setMapShowRecord(component,rec,clms,i,clmInfo,paginationList,helper);
                cnt++;
            }else{
                start++;
            }
        }
        start = start - cnt;
        end = end - cnt;
        component.set("v.start",start);
        component.set("v.end",end);
        component.set("v.nowPage",now-1);
        component.set('v.mapShow', paginationList);
    }
})