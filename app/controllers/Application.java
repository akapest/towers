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
        String locations = toJsonString(userLocations(), Location.class);
        String points = toJsonString(TowerPoint.<TowerPoint>findAll(), TowerPoint.class);
        String username = Secure.Security.connected();
        Boolean isAdmin = isAdmin();
        if (isNull(username)){
            renderTemplate("Application/stub.html");
        } else {
            renderTemplate("Application/index.html", username, freqs, locations, points, isAdmin);
        }
    }

    public static boolean notNull(String s){
        return s !=  null && !s.equals("");
    }

    public static boolean isNull(String s){
        return s ==  null || s.equals("");
    }

}
