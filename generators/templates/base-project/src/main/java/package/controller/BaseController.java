package <%= packageName %>.controller;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;

import org.apache.http.HttpResponse;
import org.apache.http.ParseException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

class BaseController {

	public ResponseEntity<String> getResponseAsString(HttpResponse response) throws ParseException, IOException {
		
		HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        if(response!=null){
        return new ResponseEntity<String>(EntityUtils.toString(response.getEntity()), responseHeaders,
                HttpStatus.OK);
        }
        return new ResponseEntity<String>("Rest Call Success", responseHeaders,
                HttpStatus.OK);
	}

}
