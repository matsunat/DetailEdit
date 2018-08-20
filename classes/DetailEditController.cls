public with sharing class DetailEditController {
    /*
     * リストデータ取得
     * IN  @ sObjectType ：主オブジェクトのAPI名
     *     @ refObject ：従オブジェクトのAPI名
     *     @ clms ：表示指定の従オブジェクト項目API名
     *     @ recId ：絞り込み主オブジェクトのID
     *     @ sortclm ：sort項目
     * 　　@ sorted ：sort順(desc,asc)
     * OUT @ List<sObject>　：リストビューデータ
     */
	@AuraEnabled
    public static List<sObject> getRefData(string sObjectType,string refObject,string recId,List<string> clms,string sortclm,string sorted){
        List<sObject> lstObj = new List<sObject>();
        lstObj = database.query(getquery(sObjectType,refObject,clms,recId,sortclm,sorted));
        return lstObj;
    }
    /*
     * 項目情報取得
     * IN  @ sObjectType ：オブジェクトのAPI名
     *     @ clms ：オブジェクト項目API名
     * OUT @ List<CustomFieldInfo>　：項目情報データ
     */
	@AuraEnabled
    public static List<CustomFieldInfo> getClmInfo(string sObjectType,List<string> clms){
        return sha_util.getCustomFieldInfo(sObjectType,clms);
    }
    /*
     * データ保存
     * IN  @ lstUpd ：保存するデータ
     * OUT @ List<sObject>　：再取得データ
     */    
    @AuraEnabled
	public static List<sObject> updListData(List<sObject> lstUpd){
        if(!lstUpd.isEmpty()){
            update lstUpd;
            //更新後、数式更新のため再取得
            Map<String, Object> fields = lstUpd[0].getPopulatedFieldsAsMap();
            Set<id> keys = new Set<id>();
            for(sObject s : lstUpd){
            	keys.Add((id)s.get('id'));
            }
            string q = 'Select ';
            integer cnt = 0;
            for(string fieldName : fields.keySet()){
                if(cnt == 0){
                    q+=fieldName;
                }else{
                    q+= ','+fieldName;
                }
                cnt++;
            }
            q+= ' From ' + lstUpd[0].getSObjectType();
            q+= ' Where Id = :keys';
            lstUpd = database.query(q);
        }
        return lstUpd;
    }
    @AuraEnabled
    public static void delData(List<sObject> lstDel){
		if(!lstDel.isEmpty()) delete lstDel;
    }
    /*
     * クエリ生成
     */
    private static string getquery(string sObjectType,string refObject,List<string> clms,string recId,string sortclm,string sorted){
        string q = 'Select id,(Select id ';
        for(string s : clms){
        	q+= string.isEmpty(s)? '':','+s;
        }
        q+=' From ' + refObject;
        if(!string.isEmpty(sortclm) && !string.isEmpty(sorted)){
            q+= ' Order by ' + sortclm + ' ' + sorted;
        }else{
            q+= ' Order by Name asc';
        }
        q+=' )';
        q+=' From ' + sObjectType + ' Where id = ' + '\'' + recId + '\'';
        system.debug(q);
        return q;
    }
}