public class CustomFieldInfo {
        @AuraEnabled
        public string apiName;
        @AuraEnabled
        public string LabelName;
        @AuraEnabled
        public string fieldType;
        @AuraEnabled
        public boolean isUpdate;
        @AuraEnabled
        public integer length;
        @AuraEnabled
        public string piclistLabel;
        @AuraEnabled
        public string piclistValue;        
        public CustomFieldInfo(){
            apiName = '';
            LabelName = '';
            fieldType = '';
            isUpdate = false;
            length=0;
            piclistLabel='';
			piclistValue='';                
        }

}