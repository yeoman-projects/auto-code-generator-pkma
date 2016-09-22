package  <%= packageName %>.dto;

import java.io.Serializable;

public class <%= className %> implements Serializable {

    private static final long serialVersionUID = 1L;
    <%_ for (idx in fields) {
   
        var variableType = fields[idx].variableType;
        var variableName = fields[idx].variableName;
        var variableMethodName = fields[idx].variableMethodName;
       
    _%>
    
    private <%= variableType %> <%= variableName %>;
    
    public <%= variableType %> get<%= variableMethodName %>() {
        return <%= variableName %>;
    }
       
    public void set<%= variableMethodName %>(<%= variableType %> <%= variableName %>) {
	   this.<%= variableName %> = <%= variableName %>;
    }

 <%_ } _%>
  
}
