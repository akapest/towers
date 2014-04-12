package controllers;

import com.google.gson.Gson;
import models.User;
import play.mvc.Controller;

/**
 * @author kpestov
 */
public class TController extends Secure.Security {

    protected static Gson gson = new Gson();

    static boolean authenticate(String username, String password){
        User user = User.find("byName", username).first();
        return user != null && user.password.equals(password);
    }

    static boolean check(String profile){
        String connected = connected();
        User user = User.find("byName", connected).first();
        return user != null && user.name.equals("admin");
    }



}
