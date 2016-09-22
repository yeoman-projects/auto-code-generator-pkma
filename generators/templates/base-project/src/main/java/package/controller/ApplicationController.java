package <%=packageName%>.controller;

import java.util.logging.Logger;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

<%_ for (classImport in restInvokersClassImports){
	var classImport = restInvokersClassImports[classImport];
	_%> 
import <%= packageName%>.dto.<%= classImport%>; 
<%_}_%>

@Controller
public class ApplicationController extends BaseController {

	private HttpClient httpClient;

	private Logger logger = Logger.getLogger(getClass().getName());

	private ApplicationController() {
	}

	public ApplicationController(HttpClient httpClient) {
		this.httpClient = httpClient;
	}

	<%_ for(invoker in restInvokers)
	{
		var invoker = restInvokers[invoker];
		_%>
	@SuppressWarnings("rawtypes")
	@RequestMapping(value="<%= invoker.restEndPointUrl %>", method = RequestMethod.<%= invoker.httpMethodType %>,<%_ if(invoker.httpMethodType!=='GET') {_%>consumes = MediaType.APPLICATION_JSON_VALUE,<%_ } _%> produces = MediaType.APPLICATION_JSON_VALUE)
	    @ResponseBody ResponseEntity <%= invoker.methodName %>(<%_ if(invoker.httpMethodType!=='GET') {_%>@RequestBody  final  <%= invoker.requestBody %> request <%_ } _%>) {
       
       try {
            return getResponseAsString(null);
        } catch (Exception e) {
            System.out.println(e);
            // TODO: handle exception
        }
        return null;
    }
	
	<%_}_%>

}
