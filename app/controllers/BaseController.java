package controllers;

import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.User;
import play.Play;
import play.db.jpa.Model;
import play.mvc.Controller;
import play.mvc.With;

import java.util.List;

/**
 * @author kpestov
 */
@With(Secure.class)
public class BaseController extends Secure.Security {

    protected static Gson gson = new GsonBuilder().setExclusionStrategies(new ExclusionStrategy() {

        @Override
        public boolean shouldSkipField(FieldAttributes field) {
            return field.getName().equals("location");
        }

        @Override
        public boolean shouldSkipClass(Class<?> aClass) {
            return false;
        }
    }).create();

    static boolean authenticate(String login, String password) {
        if ("admin".equals(login)) {
            return Play.configuration.getProperty("admin.pass", "admin").equals(password);
        } else {
            User user = User.find("byLogin", login).first();
            return user != null && user.password != null && user.password.equals(password);
        }
    }

    static boolean check(String profile) {
        String connected = connected();
        return connected.equals("admin");
    }

    protected static <M extends Model> String toJsonString(List<M> models, Class<M> cls) {
        JsonArray array = new JsonArray();
        for (M model : models) {
            JsonElement el = gson.toJsonTree(model, cls);
            array.add(el);
        }
        return array.toString();
    }


}
