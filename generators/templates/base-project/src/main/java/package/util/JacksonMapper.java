package <%= packageName %>.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class JacksonMapper extends ObjectMapper {

    private static final long serialVersionUID = 1L;

    public JacksonMapper() {
		this.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
	}

}
