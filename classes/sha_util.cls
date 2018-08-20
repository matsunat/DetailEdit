public class sha_util {
    /*
     * ソート処理
     */
    public static List<Sobject> sortList(List<Sobject> items, String sortField, String order){
        if(items.isEmpty()) return items;
        List<Sobject> rslt = new List<Sobject>();
        List<Sobject> res = new List<Sobject>();
        Map<object, List<Sobject>> objectMap = new Map<object, List<Sobject>>();
        for(Sobject ob : items){
            if(objectMap.get(ob.get(sortField)) == null){
                objectMap.put(ob.get(sortField), new List<Sobject>());
            }
            objectMap.get(ob.get(sortField)).add(ob);
        }
        List<object> keys = new List<object>(objectMap.keySet());
        keys.sort();
        for(object key : keys){
            rslt.addAll(objectMap.get(key));
        }
        if(order.toLowerCase() == 'asc'){
            for(Sobject ob : rslt){
				res.add(ob);
            }
        }else if(order.toLowerCase() == 'desc'){
            for(integer i = rslt.size()-1; i >= 0; i--){
				res.add(rslt[i]);
            }
        }
        return res;
    }
    /*
     * カラムのラベル情報取得
     * IN  @ sObjectType ：対象オブジェクトのAPI名
     *     @ clms ：表示指定の項目API名
     * OUT @ List<CustomFieldInfo>：Field情報配列
     */
    public static List<CustomFieldInfo> getCustomFieldInfo(string sObjectType,List<string> clms){
        List<CustomFieldInfo>  lstCustomFieldInfo = new List<CustomFieldInfo> ();
        //スキーマ情報から対象オブジェクト情報を取得
        Schema.SObjectType sObjType = (Schema.SObjectType) Schema.getGlobalDescribe().get(sObjectType);
        Map<String, Schema.SObjectField> fieldmap = sObjType.getDescribe().fields.getMap();
        for(string f : clms){
            //Id項目は不要
            if(f!='id' && f!='Id' && f!='ID'){
                CustomFieldInfo fi = new CustomFieldInfo();
                try{
                    Schema.SObjectField field = (Schema.SObjectField) fieldmap.get(f);
                    Schema.DescribeFieldResult fr = field.getDescribe();
                    fi.apiName=fr.getName();
                    fi.labelName = fr.getLabel();
                    fi.isUpdate = isfieldUpdate(fr.isUpdateable(),fr.getType());
                    fi.fieldType = getFieldTypeStr(fr.getType());
                    fi.length = fr.getLength();
                    
                    if(fr.getType()==Schema.DisplayType.PICKLIST){
                        integer i = 0;
                        for(Schema.PicklistEntry p : fr.getPicklistValues()){
                            if(i==0){
                                fi.piclistLabel = p.getLabel();
                                fi.piclistValue = p.getValue();
                            }else{
                                fi.piclistLabel += ','+p.getLabel();
                                fi.piclistValue += ','+p.getValue();                                
                            }
                            i++;
                        }
                    }                  
                }catch(exception ex){
                    //リレーション項目はラベル値をカラム名とします。
                    //数式を作成して表示すること
                    fi.apiName=f;
                    fi.labelName = f;
                    fi.isUpdate = false;
                }
                system.debug(fi);
                lstCustomFieldInfo.Add(fi);
            }
        }
        return lstCustomFieldInfo;
    } 
    /*
     * 型項目をテキスト変換(出力、入力時に使用する)
     * 数値：NUMBER
     * 金額：CURRENCY
     * 日付：DATE
     * 日時：DATETIME
     * チェックボックス：BOOLEAN
     * テキストエリア：TEXTAREA
     * メール：EMAIL
     * URL：URL
     * その他：STRING
     */
    private static string getFieldTypeStr(Schema.DisplayType ft){
        string fts = 'STRING';
        if(ft == Schema.DisplayType.ADDRESS){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.ANYTYPE){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.BASE64){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.BOOLEAN){
            fts = 'BOOLEAN';
        }
        else if(ft == Schema.DisplayType.COMBOBOX){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.COMPLEXVALUE){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.CURRENCY){
            fts = 'CURRENCY';
        }
        else if(ft == Schema.DisplayType.DATACATEGORYGROUPREFERENCE){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.DATE){
            fts = 'DATE';
        }
        else if(ft == Schema.DisplayType.DATETIME){
            fts = 'DATETIME';
        }
        else if(ft == Schema.DisplayType.DOUBLE){
            fts = 'NUMBER';
        }
        else if(ft == Schema.DisplayType.EMAIL){
            fts = 'EMAIL';
        }
        else if(ft == Schema.DisplayType.ENCRYPTEDSTRING){
            fts = 'STRING';
        }  
        else if(ft == Schema.DisplayType.ID){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.INTEGER){
            fts = 'NUMBER';
        }
        else if(ft == Schema.DisplayType.JSON){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.LOCATION){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.MULTIPICKLIST){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.PERCENT){
            fts = 'NUMBER';
        }
        else if(ft == Schema.DisplayType.PHONE){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.PICKLIST){
            fts = 'PICKLIST';
        }
        else if(ft == Schema.DisplayType.REFERENCE){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.SOBJECT){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.STRING){
            fts = 'STRING';
        }
        else if(ft == Schema.DisplayType.TEXTAREA){
            fts = 'TEXTAREA';
        }
        else if(ft == Schema.DisplayType.URL){
            fts = 'URL';
        }
        return fts;
    }
    /*
     * 編集可能項目を限定する。
     */
    private static boolean isfieldUpdate(boolean enableUpdate,Schema.DisplayType ft){
        if(!enableUpdate) return false;
		if(ft == Schema.DisplayType.BASE64
          ||ft == Schema.DisplayType.COMBOBOX
          ||ft == Schema.DisplayType.COMPLEXVALUE
          ||ft == Schema.DisplayType.DATACATEGORYGROUPREFERENCE
          ||ft == Schema.DisplayType.ENCRYPTEDSTRING
          ||ft == Schema.DisplayType.ID
          ||ft == Schema.DisplayType.JSON
          ||ft == Schema.DisplayType.LOCATION
          ||ft == Schema.DisplayType.MULTIPICKLIST
          ||ft == Schema.DisplayType.REFERENCE //仕様上参照項目は使用できない
          ||ft == Schema.DisplayType.SOBJECT
          )
        {
        	return false;
        }
        return enableUpdate;
    }
    
}