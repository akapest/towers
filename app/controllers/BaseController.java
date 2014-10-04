package controllers;

import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.Location;
import models.User;
import play.Logger;
import play.Play;
import play.db.jpa.Model;
import play.mvc.Before;
import play.mvc.Controller;
import play.mvc.With;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;

/**
 * @author kpestov
 */
@With(Secure.class)
public class BaseController extends Secure.Security {

    protected static Gson gson = new GsonBuilder().setExclusionStrategies(new ExclusionStrategy() {

        @Override
        public boolean shouldSkipField(FieldAttributes field) {
            return  field.getName().equals("tower") //for point
                    || field.getName().equals("location")     // for tower
                    || field.getName().equals("locations_"); // for user
        }

        @Override
        public boolean shouldSkipClass(Class<?> aClass) {
            return false;
        }
    }).create();

    @Before
    public static void before(){
        Logger.info("%s", request.action);
    }

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

    protected static boolean isAdmin() {
        return connected() != null && connected().equals("admin");
    }

    protected static <M extends Model> String toJsonString(Collection<M> models, Class<M> cls) {
        JsonArray array = new JsonArray();
        for (M model : models) {
            JsonElement el = gson.toJsonTree(model, cls);
            array.add(el);
        }
        return array.toString();
    }

    protected static Collection<Location> userLocations() {
        String login = connected();
        if ("admin".equals(login)){
            return Location.findAll();
        }
        User user = User.find("byLogin", login).first();
        if (user != null){
            return user.locations_;
        }
        return new HashSet<Location>();
    }


}
