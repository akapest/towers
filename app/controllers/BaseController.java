package controllers;

import com.google.gson.Gson;
import models.User;
import play.mvc.Controller;

/**
 * @author kpestov
 */
public class BaseController extends Secure.Security {

    protected static Gson gson = new Gson();

    static boolean authenticate(String login, String password){
        /*User user = User.find("byLogin", login).first();
        return user != null && user.password.equals(password);*/
        return true;
    }

    static boolean check(String profile){
        String connected = connected();
        User user = User.find("byLogin", connected).first();
        return user != null && user.login.equals("admin");
    }



}
