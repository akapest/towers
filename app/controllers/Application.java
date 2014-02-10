package controllers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import play.*;
import play.mvc.*;

import java.util.*;

import models.*;

public class Application extends Controller {

    private static Gson gson = new Gson();

    public static void index() {
        List<Freq> freqsList = Freq.findAll();
        JsonArray array = new JsonArray();
        for (Freq f : freqsList) {
            JsonElement el = gson.toJsonTree(f, Freq.class);
            array.add(el);
        }
        String freqs = array.toString();
        String user = Secure.Security.connected();
        if (isNull(user)){
            renderTemplate("Application/stub.html");
        } else {
            renderTemplate("Application/index.html", user, freqs);
        }
    }

    public static boolean notNull(String s){
        return s !=  null && !s.equals("");
    }

    public static boolean isNull(String s){
        return s ==  null || s.equals("");
    }

}
