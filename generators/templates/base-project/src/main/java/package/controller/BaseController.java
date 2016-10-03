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

	public HttpPost getPostRequest(String apiBaseURI, Object requestObject)
			throws URISyntaxException, JsonProcessingException, UnsupportedEncodingException {
		URIBuilder builder = new URIBuilder(apiBaseURI);
		builder.addParameter("tla", "<%= tla %>");

		String listStubsUri = builder.build().toString();
		HttpPost postRequest = new HttpPost(listStubsUri);

		ObjectMapper entityMapper = new ObjectMapper();
		String writeValueAsString = entityMapper.writeValueAsString(requestObject);

		StringEntity entity = new StringEntity(writeValueAsString);
		entity.setContentType(MediaType.APPLICATION_JSON_VALUE);
		postRequest.setEntity(entity);

		return postRequest;
	}

	public ResponseEntity<String> getResponseAsString(HttpResponse response) throws ParseException, IOException {
		HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Access-Control-Allow-Origin", "*");

        return new ResponseEntity<String>(EntityUtils.toString(response.getEntity()), responseHeaders,
                HttpStatus.OK);
	}

}
