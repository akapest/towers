package controllers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import play.db.jpa.Model;
import play.mvc.*;

import java.util.*;

import models.*;

public class Application extends BaseController {

    public static void index() {
        String freqs = toJsonString(Freq.<Freq>findAll(), Freq.class);
        String locations = toJsonString(Location.<Location>findAll(), Location.class);
        String towers = toJsonString(Tower.<Tower>findAll(), Tower.class);
        String username = Secure.Security.connected();
        if (isNull(username)){
            renderTemplate("Application/stub.html");
        } else {
            renderTemplate("Application/index.html", username, freqs, locations, towers);
        }
    }

    public static boolean notNull(String s){
        return s !=  null && !s.equals("");
    }

    public static boolean isNull(String s){
        return s ==  null || s.equals("");
    }

}
