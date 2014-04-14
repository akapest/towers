package controllers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.User;
import play.Logger;
import play.data.validation.Valid;

import java.util.List;

/**
 * @author kpestov
 */
//@With(Secure.class)
public class Users extends BaseController {
    
    @Check(value="users")    
    public static void all() {
        List<User> users = User.findAll();
        JsonArray array = new JsonArray();
        for (User user : users) {
            JsonElement el = gson.toJsonTree(user, User.class);
            array.add(el);
        }
        renderJSON(array.toString());
    }

    @Check(value="users")
    public static void create(@Valid User user) {
        try {
            user.validateAndCreate();
            renderJSON(String.format("{\"id\":%d}", user.id));

        } catch (Exception e) {
            Logger.error(e, "Failed to create object User. Query: %s", request.querystring);
            error();
        }
    }

    @Check(value="users")
    public static void edit(@Valid User user) {
        try {
            user.validateAndSave();
            ok();

        } catch (Exception e) {
            Logger.error(e, "Failed to edit object User. Query: %s", request.querystring);
            error();
        }
    }

    @Check(value="users")
    public static void delete(Long id) {
        try{
            User user = User.findById(id);
            if (user != null){
                user.delete();
                ok();
            } else {
                Logger.info("No user find to delete. id = " + id);
                badRequest();
            }
        } catch (Exception e){
            Logger.error(e, "Failed to delete object User. Query: %s", request.querystring);
            error();
        }

    }

}
