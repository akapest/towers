package controllers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.Location;
import models.User;
import play.Logger;
import play.data.validation.Valid;

import java.util.Collection;
import java.util.List;

/**
 * @author kpestov
 */
public class Locations extends BaseController {

    public static void all() {
        Collection<Location> locations = userLocations();
        JsonArray array = new JsonArray();
        for (Location f : locations) {
            JsonElement el = gson.toJsonTree(f, Location.class);
            array.add(el);
        }
        renderJSON(array.toString());
    }

    public static void create(@Valid Location location) {
        try {
            location.create();
            renderJSON(String.format("{\"id\":%d}", location.id));

        } catch (Exception e) {
            Logger.error(e, "Failed to create object Location. Query: %s", request.querystring);
            error();
        }
    }

    public static void edit(@Valid Location location) {
        try {
            location.save();
            ok();

        } catch (Exception e) {
            Logger.error(e, "Failed to edit object Location. Query: %s", request.querystring);
            error();
        }
    }

    public static void delete(Long id) {
        try{
            Location f = Location.findById(id);
            if (f != null){
                f.delete();
                ok();
            } else {
                Logger.info("No location find to delete. id = " + id);
                badRequest();
            }
        } catch (Exception e){
            Logger.error(e, "Failed to delete object Location. Query: %s", request.querystring);
            error();
        }

    }

}
